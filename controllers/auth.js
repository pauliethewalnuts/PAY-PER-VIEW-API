const user = require('../models/user')
const User = require('../models/user')
const UnauthorizedError = require('../errors/indexError')
const BadRequestError = require('../errors/indexError')

const register = async (req,res)=>{
    const user = await User.create(req.body)
    const token = user.createJWT()
    res.status(201).json({name:user.name,email:user.email,role:user.role,token})
}

const login = async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        throw new BadRequestError('Please enter email and password')
    }
    const user = await User.findOne({email})
    if(!user){
        throw new BadRequestError(`No ${email} email found`)
    }
    const isMatch = await user.comparePasswords(password)
    if(!isMatch){
        throw new UnauthorizedError('Wrong Password')
    }
    const token = user.createJWT()
    res.json({name:user.name,role:user.role,token})
}

module.exports = {register,login}