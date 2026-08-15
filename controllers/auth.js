const User = require('../models/user')
const UnauthorizedError = require('../errors/indexError')
const BadRequestError = require('../errors/indexError')
const NotFoundError = require('../errors/indexError')
const Redis = require('ioredis');
const {sendEmailQueue,sendPassChange} = require('../queues/sendEmailQueue');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const cloudinary = require('../config/cloudinary')

// const register = async (req,res)=>{
//     const user = await User.create(req.body)
//     const token = user.createJWT()
//     res.status(201).json({name:user.name,email:user.email,token})
// }

const redis = new Redis({
    host: 'localhost',
    port: 6379
});

const register = async(req,res) =>{
    const {name, userName, email ,password} = req.body
    if(!name || !userName || !email || !password){
        throw new BadRequestError("Please enter your details for verification")
    }
    const [existingUserName,existingEmail] =  await Promise.all([
        User.findOne({userName}),
        User.findOne({email})
    ])
    if(existingUserName){
        throw new BadRequestError('This user name has already been taken please nter a new one')
    }
    if(existingEmail){
        throw new BadRequestError('Already Registered with this email')
    }
    if(!email.includes('@')){
        throw new BadRequestError('Please enter a valid email')
    }
    if(password.length < 8){
        throw new BadRequestError('Password should be atleast 8 characters')
    }
    const sentCode = await redis.get(`verify:${email}`)
    if(sentCode){
        throw new BadRequestError('Verification code already sent')
    }
    const code = Math.floor(100000 + Math.random()*900000).toString()

    await redis.set(`verify:${email}`,JSON.stringify({name,userName,email,password,code}),'EX', 600)

    await sendEmailQueue.add('send-verification-email',{email,code})

    res.status(200).send(`Verification code sent to email ${email}`)
}

const setProfileImage = async(req,res)=>{
    const {userId,userName} = req.user
    const user = await User.findById(userId)
    if(!user){
        throw new NotFoundError("No user Found")
    }
    const image = req.file
    if(!image){
        throw new BadRequestError("Please provide an image")
    }
    let profilePicture=null
    let saved = false
    try {
        const oldId = user.profileImage?.public_id 
        const result = await uploadToCloudinary(image.buffer,userName,userId)
        profilePicture = {url: result.secure_url, public_id: result.public_id}
        user.profileImage = profilePicture
        await user.save()
        saved = true
        if(oldId){
            await cloudinary.uploader.destroy(oldId)
        }
    } catch (error) {
        if (!saved && profilePicture) {
            await cloudinary.uploader.destroy(profilePicture.public_id);
        }
        throw error
    }
    res.status(200).json({success: true,msg: 'Profile picture set successfully'})
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
    res.json({profileImage:user.profileImage.url,userName:user.userName,token})
}

const verifyEmail = async(req,res)=>{
    const {email,code} = req.body
    const data = await redis.get(`verify:${email}`)
    if(!data){
        throw new BadRequestError('Verification code Expired')
    }
    const userData = JSON.parse(data)

    if(userData.code !== code){
        throw new UnauthorizedError('Invalid verification Code')
    }
    const user = User.create({name: userData.name,userName: userData.userName,email: userData.email,password: userData.password})
    await redis.del(`verify:${email}`)
    res.status(201).json({success: true, msg: `Account verified and created`})
}

const changePassword = async (req,res)=>{
    const {userId} = req.user
    const {currentPassword,newPassword} = req.body
    if(!newPassword || !currentPassword){
        throw new BadRequestError('Please provide a new password and current password')
    }
    const user = await User.findById(userId)
    if(!user){
        throw new BadRequestError('No account found')
    }
    const isMatch = await user.comparePasswords(currentPassword)
    if(!isMatch){
        throw new BadRequestError('Current password is wrong')
    }
    const samepassword = await user.comparePasswords(newPassword)
    if(samepassword){
        throw new BadRequestError('Use a new password that is different')
    }

    user.password = newPassword
    await user.save()
    res.status(200).json({success:true,msg:'Password Changed Sucessfully'})
}

const forgotPassword = async(req,res) =>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        throw new BadRequestError('Email does not exist')
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await redis.set(`verify-${email}`,JSON.stringify({email,code}),'EX',600)

    await sendPassChange.add('send-password-change-email',{email,code})
    res.status(200).json({success: true,msg: `Code sent to ${email}`})
}

const passReset = async(req,res) =>{
    const {email,code,new_password} = req.body
    if(!email || !code || !new_password){
        throw new BadRequestError('Enter all the details')
    }
    const data = await redis.get(`verify-${email}`)
    if(!data){
        throw new BadRequestError('Code expired or invalid code')
    }
    const newData = JSON.parse(data)
    // console.log(newData)
    if(newData.code !== code){
        throw new UnauthorizedError('Invalid Code')
    }
    const user = await User.findOne({email})
    const samepassword = await user.comparePasswords(new_password)
    if(samepassword){
        throw new BadRequestError('New password cannot be same as old password')
    }
    user.password = new_password
    await user.save()
    await redis.del(`verify-${email}`)
    res.status(200).json({success: true, msg:'Password Changed succesfully'})
}

const resendVerification = async(req,res)=>{
    const {email} = req.body
    if(!email){
        throw new BadRequestError('Please enter an Email')
    }
    const user = await User.findOne({email})
    if(user){
        throw new BadRequestError('User already verified')
    }
    const userInfo = await redis.get(`verify:${email}`)
    if(!userInfo){
        throw new BadRequestError('Verification Code expired, please register again')
    }
    const data = JSON.parse(userInfo)
    const code = Math.floor(100000 + Math.random()*900000).toString()
    await redis.set(`verify:${email}`,JSON.stringify({name: data.name, email: data.email, password: data.password,code}), 'EX', 600)
    await sendEmailQueue.add('send-verification-email',{email,code})
    res.status(200).json({msg: "If Email exists, verification code resent"})
}

const resendVerificationPassword = async(req,res)=>{
    const {email} = req.body
    if(!email){
        throw new BadRequestError('Please enter an email to resend the verification code')
    }
    // const user = await User.findOne({email})
    // if(!user){
    //     throw new BadRequestError(`No ${email} found`)
    // }
    const userInfo = await redis.get(`verify-${email}`)
    if(!userInfo){
        throw new BadRequestError('Please try again')
    }
    const data = JSON.parse(userInfo)
    const code = Math.floor(100000 + Math.random()*900000).toString()
    await redis.set(`verify-${email}`,JSON.stringify({email,code}),'EX',600)
    await sendPassChange.add('send-verification-email',{email,code})
    res.status(200).json({msg: "If Email exists, verification code resent"})
}

const changeUserName = async(req,res)=>{
    const {userId,email} = req.user
    const {new_userName} = req.body
    if(!new_userName){
        throw new BadRequestError('Please enter a new username to continue')
    }
    const user = await User.findById(userId)
    if(!user){
        throw new BadRequestError('No user found')
    }
    const normalizedUsername = new_userName.trim().toLowerCase();
    if(user.userName === normalizedUsername){
        throw new BadRequestError("This is already your user name")
    }
    const existingUserName = await User.findOne({userName:normalizedUsername})
    if(existingUserName){
        throw new BadRequestError('This user name has laready been taken')
    }
    user.userName = new_userName
    await user.save()
    res.status(200).json({success: true,msg: "User Name changed"})
}

module.exports = {register,login,verifyEmail,changePassword,forgotPassword,passReset,resendVerification,setProfileImage, changeUserName, resendVerificationPassword}

