const express = require('express')
const {createContent,getPurchasedContent,getContent,getMyContent, updateContent,deleteContent, getSingleContent, deleteSingleImage, getSinglePreviewContent, getAllPurchasedContent}= require('../controllers/content')
const upload = require('../middleware/upload')
const router = express.Router()

router.route('/').post(upload.array('images', 5),createContent).get(getContent)
router.route('/me').get(getMyContent)
router.route('/owned').get(getAllPurchasedContent)
router.route('/:id').get(getSingleContent).patch(updateContent).delete(deleteContent)
router.route('/:id/preview').get(getSinglePreviewContent)
router.route('/purchase/:id').get(getPurchasedContent)
router.route('/:id/images').patch(deleteSingleImage)
module.exports = router 