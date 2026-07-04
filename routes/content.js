const express = require('express')
const {createContent,getPurchasedContent,getContent,getMyContent, updateContent,deleteContent, getSingleContent}= require('../controllers/content')
const upload = require('../middleware/upload')
const router = express.Router()

router.route('/').post(upload.array('images', 5),createContent).get(getContent)
router.route('/me').get(getMyContent)
router.route('/:id').get(getSingleContent).patch(updateContent).delete(deleteContent)
router.route('/purchase/:id').get(getPurchasedContent)

module.exports = router