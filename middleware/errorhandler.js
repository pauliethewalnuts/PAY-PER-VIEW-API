const errorHandlerMiddleware = (err,req,res,next) =>{
    let customError = {
        msg: err.message || 'Something Went Wrong, Please try again Later',
        statusCode: err.statusCode || 500
    }
    if(err.name === 'CastError'){
        customError.msg = `No job found with id: ${err.value}`
        customError.statusCode = 404
    }

    if(err.code && err.code === 11000){
        customError.msg = `Duplicate value entered for ${Object.keys(err.errorResponse.keyValue)} field, please enter another one`
        customError.statusCode = 400
    }

    if(err.name === 'ValidationError'){
        customError.msg = Object.values(err.errors).map((item)=>item.message).join(',')
        customError.statusCode = 400
    }

    return res.status(customError.statusCode).json({msg: customError.msg })
    }

module.exports = errorHandlerMiddleware