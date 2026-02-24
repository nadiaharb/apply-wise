const express = require('express')
const router = express.Router()
const { register, login, verify2FA, getMe, setup2FA, enable2FA, disable2FA, updateProfile } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

// public
router.post('/register', register)
router.post('/login', login)
router.post('/2fa/verify', verify2FA)

// protected
router.get('/me', authMiddleware, getMe)
router.post('/2fa/setup', authMiddleware, setup2FA)
router.post('/2fa/enable', authMiddleware, enable2FA)
router.post('/2fa/disable', authMiddleware, disable2FA)
router.patch('/profile', authMiddleware, updateProfile)

module.exports = router