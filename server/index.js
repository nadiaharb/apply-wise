const express = require('express')
const cors = require('cors')
require('dotenv').config()


const authRoutes=require('./routes/auth')
const jobsRoutes=require('./routes/jobs')
const aiRoutes = require('./routes/ai')
const coverLetterRoutes = require('./routes/coverLetters')
const analyticsRoutes = require('./routes/analytics')
const errorHandler=require('./middleware/errorHandler')

const app = express()


const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL  
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

app.use(express.json())

//routes
app.use('/auth', authRoutes)
app.use('/jobs',jobsRoutes)
app.use('/ai', aiRoutes)
app.use('/cover-letters', coverLetterRoutes)
app.use('/analytics', analyticsRoutes)
//health check
app.get('/',(req,res)=>{
    res.json({message: 'ApplyWise is running 🚀'})
})


app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT,()=> console.log(`Server running on port ${PORT}`))