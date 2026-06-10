const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const user = require('../../Geofencing Attendance - API/models/user')

const UserSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please enter a username"],
        maxlength: 50
    },
    email:{
        type: String,
        required: [true,'Please provide an E-mail'],
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'Please provide a valid E-mail'],
        unique: true
    },
    password:{
        type: String,
        minlength: [8,'Length of the password should be more than 8 characters'],
        required:[true,'Please Provide a Password']
    },
    role:{
        type: String,
        enum: ['buyer','seller'],
        required: [true,'Please specify a role']
    }
})

UserSchema.pre('save',async function(){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})

UserSchema.methods.createJWT = function(){
    return jwt.sign({userId:this._id,name:this.name,role:this.role},process.env.JWT_SECRET,{expiresIn: process.env.EXPIRES_IN})
}

UserSchema.methods.comparePasswords = async function(password){
    const isMatch = await bcrypt.compare(password,this.password)
    return isMatch
}


module.exports = mongoose.model('User',UserSchema)