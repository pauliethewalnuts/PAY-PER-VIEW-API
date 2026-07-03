const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please enter a username"],
        maxlength: 50,
        trim: true,
    },
    userName: {
        type: String,
        required: [true, "Please provide a unique username"],
        minlength:3,
        maxLength: 20,
        match: [/^[a-z][a-z0-9_]*$/,"Username must start with a letter and contain only letters, numbers, and underscores."],
        unique: true,
        trim: true,
        lowercase: true
    },
    email:{
        type: String,
        required: [true,'Please provide an E-mail'],
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'Please provide a valid E-mail'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        minlength: [8,'Length of the password should be more than 8 characters'],
        required:[true,'Please Provide a Password']
    },
    profileImage:{
        url: {
            type: String,
            default: process.env.DEFAULT_PROFILE_IMAGE
        },
        public_id:{
            type: String,
            default: null
        }
    }
})

UserSchema.pre('save',async function(){
    if(!this.isModified('password')){
        return 
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})

UserSchema.methods.createJWT = function(){
    return jwt.sign({userId:this._id,name:this.name,userName: this.userName},process.env.JWT_SECRET,{expiresIn: process.env.EXPIRES_IN})
}

UserSchema.methods.comparePasswords = async function(password){
    const isMatch = await bcrypt.compare(password,this.password)
    return isMatch
}


module.exports = mongoose.model('User',UserSchema)