const express = require('express')
const content = require('../controllers/content')
const router = express.Router()

router.route('/premcontent').get(content)

module.exports = router