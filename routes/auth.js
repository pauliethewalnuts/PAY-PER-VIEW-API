const {register,login, getUser, verifyEmail,changePassword, forgotPassword, passReset, resendVerification, setProfileImage, changeUserName, resendVerificationPassword} = require('../controllers/auth')
const authenticationMiddleware = require('../middleware/authentication')
const upload = require('../middleware/upload')

const express = require('express')

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/user').get(authenticationMiddleware,getUser)
router.route('/verify-email').post(verifyEmail)
router.route('/change-password').patch(authenticationMiddleware,changePassword)
router.route('/forgot-password').post(forgotPassword)
router.route('/pass-reset').patch(passReset)
router.route('/resend-verification').post(resendVerification)
router.route('/resend-passChange').post(resendVerificationPassword)
router.route('/profile-image').patch(authenticationMiddleware,upload.single('image'),setProfileImage)
router.route('/change-username').patch(authenticationMiddleware,changeUserName)

module.exports = router