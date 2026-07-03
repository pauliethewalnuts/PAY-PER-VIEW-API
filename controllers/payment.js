const UnauthorizedError = require('../errors/indexError')
const BadRequestError = require('../errors/indexError')
const Purchase = require('../models/purchase')
const purchaseQueue = require('../queues/purchaseQueue')

const payment = async (req,res) =>{
    const {userId} = req.user
    const {id} = req.params
    const {paymentCode} = req.body
    if(!id){
        throw new BadRequestError('Please provide a purchase Id')
    }
    if(!paymentCode){
        throw new UnauthorizedError("There is no payment code provided")
    }
    if(paymentCode !== '1234'){
        const purchase = await Purchase.findOneAndUpdate({purchasedBy:userId,content:id},{status: 'failed'})
        throw new UnauthorizedError('Payment code is invalid')
    }
    const purchase = await Purchase.findOne({purchasedBy:userId,content:id})

    if(!purchase){
        throw new BadRequestError('No purchase found')
    }
    if(purchase.status == 'paid'){
        throw new BadRequestError(`You have already purchased the content with contentID ${purchase.content}`)
    }
    await purchaseQueue.add('process-payment',{purchaseId: purchase._id})
    res.status(200).send('Payment Processing....')
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