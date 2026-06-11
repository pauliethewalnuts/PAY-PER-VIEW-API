const express = require('express')
const {createContent,getPurchasedContent,getContent,getMyContent, updateContent,deleteContent}= require('../controllers/content')
const router = express.Router()

router.route('/').post(createContent).get(getContent)
router.route('/me').get(getMyContent)
router.route('/:id').get(getPurchasedContent).patch(updateContent).delete(deleteContent)

module.exports = router