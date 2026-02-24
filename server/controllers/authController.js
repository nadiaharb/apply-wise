const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const prisma = require('../prisma/client')

//  Token Helpers 

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// short-lived token used only to pass the 2FA check
const generateTempToken = (userId) => {
  return jwt.sign(
    { userId, temp: true },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  )
}

//  Register

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser)
      return res.status(409).json({ message: 'Email already in use' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    const token = generateToken(user.id)

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        twoFactorEnabled: user.twoFactorEnabled
      }
    })
  } catch (err) {
    next(err)
  }
}

//  Login

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' })

    // if 2FA is enabled, return a temp token instead
    if (user.twoFactorEnabled) {
      const tempToken = generateTempToken(user.id)
      return res.json({
        requires2FA: true,
        tempToken
      })
    }

    // normal login
    const token = generateToken(user.id)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        twoFactorEnabled: user.twoFactorEnabled
      }
    })
  } catch (err) {
    next(err)
  }
}

//  Verify 2FA code at login 

const verify2FA = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body

    if (!tempToken || !code)
      return res.status(400).json({ message: 'Token and code are required' })

    // decode the temp token
    let decoded
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    if (!decoded.temp)
      return res.status(401).json({ message: 'Invalid token type' })

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user || !user.twoFactorSecret)
      return res.status(401).json({ message: 'User not found' })

    // verify the TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1  // allows 30 seconds of clock drift
    })

    if (!isValid)
      return res.status(401).json({ message: 'Invalid authentication code' })

    // code is valid — issue the real token
    const token = generateToken(user.id)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        twoFactorEnabled: user.twoFactorEnabled
      }
    })
  } catch (err) {
    next(err)
  }
}

//  Get current user 

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        twoFactorEnabled: true,
        createdAt: true
      }
    })

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({ user })
  } catch (err) {
    next(err)
  }
}

//  Setup 2FA (generates QR code) 

const setup2FA = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })

    // generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Apply Wise (${user.email})`
    })

    // save the secret temporarily 
    await prisma.user.update({
      where: { id: req.userId },
      data: { twoFactorSecret: secret.base32 }
    })

    // generate QR code as a data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url)

    res.json({
      qrCode: qrCodeUrl,
      secret: secret.base32  // show this as backup code
    })
  } catch (err) {
    next(err)
  }
}

//  Confirm and enable 2FA 

const enable2FA = async (req, res, next) => {
  try {
    const { code } = req.body

    if (!code)
      return res.status(400).json({ message: 'Verification code is required' })

    const user = await prisma.user.findUnique({ where: { id: req.userId } })

    if (!user.twoFactorSecret)
      return res.status(400).json({ message: 'Run setup first' })

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    })

    if (!isValid)
      return res.status(401).json({ message: 'Invalid code — try again' })

    await prisma.user.update({
      where: { id: req.userId },
      data: { twoFactorEnabled: true }
    })

    res.json({ message: '2FA enabled successfully' })
  } catch (err) {
    next(err)
  }
}

//  Disable 2FA 

const disable2FA = async (req, res, next) => {
  try {
    const { code } = req.body

    const user = await prisma.user.findUnique({ where: { id: req.userId } })

    if (!user.twoFactorEnabled)
      return res.status(400).json({ message: '2FA is not enabled' })

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    })

    if (!isValid)
      return res.status(401).json({ message: 'Invalid code' })

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    })

    res.json({ message: '2FA disabled' })
  } catch (err) {
    next(err)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: { id: true, name: true, email: true, plan: true, twoFactorEnabled: true }
    })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  register,
  login,
  verify2FA,
  getMe,
  setup2FA,
  enable2FA,
  disable2FA,
  updateProfile
}