const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma/client')



//helper to generate token
const generateToken=(userId)=>{
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    )
}

//POST /auth/register
const register= async (req,res,next)=>{
    try{
        const {name,email,password}=req.body

        //validate input
        if(!email || !password){
            return res.status(400).json({message:'Email and password are required'})
        }

        if (password.length < 6){
            return res.status(400).json({message:'Password must be at least 6 characters'})
        }
        // check if user already exists
        const existingUser=await prisma.user.findUnique({
            where: {email}
        })
        if (existingUser){
            return res.status(409).json({message:'Email already in use'})
        }
        //hash password
        const hashedPassword= await bcrypt.hash(password,10)

        //create user
        const user= await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            }
        })

        //generate token
        const token=generateToken(user.id)

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                plan: user.plan
            }
        })
    }   catch(err){
        next(err)
    }
}


//POST /auth/login
const login = async (req,res,next) =>{
    try{
        const {email,password}=req.body

        if(!email || !password){
            return res.status(401).json({message:'Email and password are required'})
        }

        //find user
        const user= await prisma.user.findUnique({
            where: {email}
        })
        if(!user){
            res.status(401).json({message:'Invalid email or password'})
        }

        //compare password
        const isMatch= await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(401).json({message:'Invalid email or password'})
        }

        const token=generateToken(user.id)

        res.json({
            token,
            user: {
                id:user.id,
                name: user.name,
                email: user.email,
                plan:user.plan
            }
        })


    }catch(err){
        next(err)
    }
}


//GET /auth/me

const getMe= async(req,res,next)=>{
    try{
        const user = await prisma.user.findUnique({
            where: {id:req.userId},
            select: {
                id:true,
                name:true,
                email:true,
                plan:true,
                createdAt: true
            }
        })

        if(!user){
            return res.status(404).json({message:'User not found'})
        }

        res.json({user})

    }catch(err){
        next(err)
    }
}


module.exports= {register,login,getMe}
