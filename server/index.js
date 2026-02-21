const express = require('express')
const cors = require('cors')
require('dotenv').config()



const app = express()

app.use(cors({origin: 'http://localhost:5173'}))
app.use(express.json())

//health check

app.get('/',(req,res)=>{
    res.json({message: 'ApplyWise is running 🚀'})
})

const errorHandler=require('./middleware/errorHandler')


app.use(errorHandler)
const PORT = process.env.PORT || 5000
app.listen(PORT,()=> console.log(`Server running on port ${PORT}`))