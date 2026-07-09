const start = require('../controllers/admin')

const express = require('express')
const router = express.Router()

router.route('/delete-purchases').post(start)

module.exports = router