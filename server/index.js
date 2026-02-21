const express = require('express')
const cors = require('cors')
require('dotenv').config()


const authRoutes=require('./routes/auth')
const errorHandler=require('./middleware/errorHandler')

const app = express()

app.use(cors({origin: 'http://localhost:5173'}))
app.use(express.json())

//routes
app.use('/auth', authRoutes)

//health check
app.get('/',(req,res)=>{
    res.json({message: 'ApplyWise is running 🚀'})
})


app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT,()=> console.log(`Server running on port ${PORT}`))