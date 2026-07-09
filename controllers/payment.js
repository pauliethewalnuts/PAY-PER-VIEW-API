const UnauthorizedError = require('../errors/indexError')
const BadRequestError = require('../errors/indexError')
const Purchase = require('../models/purchase')
const {purchaseQueue} = require('../queues/purchaseQueue')

const payment = async (req,res) =>{
    const {userId} = req.user
    const {id} = req.params
    const {paymentCode} = req.body
    if(!id){
        throw new BadRequestError('Please provide a purchase Id')
    }
    const purchase = await Purchase.findOne({purchasedBy:userId,_id:id})
    if(!purchase){
        throw new BadRequestError('No purchase found')
    }
    if(purchase.status !== 'pending'){
        throw new BadRequestError(`This purchase cannot be completed as the status is ${purchase.status} `)
    }
    if(!paymentCode){
        throw new UnauthorizedError("There is no payment code provided")
    }
    if(paymentCode !== '1234'){
        purchase.paymentAttempts +=1
        if(purchase.paymentAttempts >= 3){
            purchase.status = 'failed'
        }
        await purchase.save()
        if(purchase.status === 'failed'){
            throw new BadRequestError('You have entered the wrong code more than 3 times the payment has failed, please create a new payment')
        }
        throw new UnauthorizedError('Payment code is invalid, please try again')
    }
    purchase.status = 'processing'
    await purchase.save()
    await purchaseQueue.add('process-payment',{purchaseId: purchase._id})
    res.status(200).json({success: true, msg: 'Payment Processing....'})
}

const status = async (req,res)=>{
    const {userId} = req.user
    const {id} = req.params
    const purchase = await Purchase.findOne({purchasedBy:userId,_id:id})
    if(!purchase){
        throw new BadRequestError('No purchase found')
    }
    res.status(200).json({status: purchase.status})
}

module.exports = {payment,status}