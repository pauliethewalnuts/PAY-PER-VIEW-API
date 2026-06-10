const jwt = require('jsonwebtoken')
const UnauthorizedError = require('../errors/indexError')

const authenticationMiddleware = async (req,res,next) =>{
    const {authorization} = req.headers
    if(!authorization || !authorization.startsWith('Bearer')){
        throw new UnauthorizedError('Invalid Token')
    }
    const token = authorization.split(' ')[1]
    try {
        const info = await jwt.verify(token,process.env.JWT_SECRET)
        req.user = {userId:info.userId,name:info.name,role:info.role}
        next()
    } catch (error) {
        throw new UnauthorizedError(error.message)
    }

}

module.exports = authenticationMiddleware