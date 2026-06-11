const express = require('express')
const {purchase,myPurchase} = require('../controllers/purchase')
const {payment,status} = require('../controllers/payment')


const router = express.Router()

router.route('/:id').post(purchase)
router.route('/:id/pay').post(payment)
router.route('/:id/status').get(status)
router.route('/myPurchases').get(myPurchase)

module.exports = router