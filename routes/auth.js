const {register,login,verifyEmail,changePassword, forgotPassword, passReset, resendVerification} = require('../controllers/auth')
const authenticationMiddleware = require('../middleware/authentication')

const express = require('express')

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/verify-email').post(verifyEmail)
router.route('/change-password').patch(authenticationMiddleware,changePassword)
router.route('/forgot-password').post(forgotPassword)
router.route('/pass-reset').patch(passReset)
router.route('/resend-verification').post(resendVerification)

module.exports = router