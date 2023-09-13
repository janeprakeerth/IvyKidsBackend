const AppError = require("../utils/appError")

const handleCastErrorDb = err=>{
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message,400)
}
const handleDuplicatefieldsDb = err=>{
    const message = `Duplicate field value: ${err}. Please use another value`
    return new AppError(message,400)
}
const handleValidationErrorDb = err=>{
    const errors =  Object.values(err.errors).map(ele=>ele.message)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message,400)
}
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'Error'
    let error = {...err}
    console.log(err)
    if(err.name==='CastError'){
        error = handleCastErrorDb(error)
    }else if(err.code === 11000){
        error = handleDuplicatefieldsDb(err.message)
    }else if(err.name==='ValidationError'){
        error = handleValidationErrorDb(error)
    }
    if(error.isOperational){
        res.status(error.statusCode).json({
            status:error.status,
            message:error.message?error.message:err.message
        })
    }else{
        res.status(500).json({
            status:'error',
            message:'Something went very wrong'
        })
    }
}