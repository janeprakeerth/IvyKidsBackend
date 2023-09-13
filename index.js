const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require("cors");
const AppError = require('./utils/appError')
const globalErrorHandler = require('./Controllers/errorController')

const userRouter = require('./Routers/UserRouter')
const tweetRouter = require('./Routers/tweetRouter')



process.on('uncaughtException',err=>{
    console.log(err.name,err.message)
    console.log("Unhandled Exception")
    process.exit(1)
})

const dotenv  = require('dotenv')

const app = express()
app.set('trust proxy', true)
app.use(cors());

dotenv.config({path:'./config.env'})

const DB = process.env.DATABASE.replace('<password>',process.env.PASSWORD)

const connectionParam = {
    useNewUrlParser:true,
    useUnifiedTopology:true
}
mongoose.connect(DB,connectionParam).then(con=>{
    console.log('DB CONNECTION SUCCESS')
})

const PORT = process.env.PORT||4000

app.use(morgan('dev'))
app.use(express.json())


app.use('/api/user',userRouter)
app.use('/api/tweet',tweetRouter)


app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl}`,404))
})
app.use(globalErrorHandler)

const server = app.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`)
})
process.on('unhandledRejection',err=>{
    console.log(err.name,err.message)
    console.log("Unhandled Rejection")
    server.close(()=>{
        process.exit(1)
    })
})