const express = require('express')
const {createContent,getPurchasedContent,getContent,getMyContent, updateContent,deleteContent}= require('../controllers/content')
const upload = require('../middleware/upload')
const router = express.Router()

router.route('/').post(upload.array('images', 5),createContent).get(getContent)
router.route('/me').get(getMyContent)
router.route('/:id').get(getPurchasedContent).patch(upload.array('images', 5),updateContent).delete(deleteContent)

module.exports = router