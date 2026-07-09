const BadRequestError = require('../errors/indexError')
const NotFoundError = require('../errors/NotFoundError')
const Content = require('../models/content')
const Purchase = require('../models/purchase')
const {purchaseQueue} = require('../queues/purchaseQueue')
const {purchaseExpireQueue} = require('../queues/purchaseQueue')

const purchase = async (req,res) =>{
    const {id} = req.params
    const {userId,name}= req.user 
    const content = await Content.findById({_id:id})
    if(!content){
        throw new BadRequestError(`Can't purchase as no content with id ${id} has been found`)
    }
    if(content.uploadedBy.toString() === userId){
        throw new BadRequestError(`Cannot purchase own content`)
    }
    const existingPurchase = await Purchase.findOne({purchasedBy:userId,content:id,status:{$in: ['pending', 'paid', 'processing']}})

    if(existingPurchase?.status === 'paid'){
        throw new BadRequestError('Content already purchased')
    }
    if(existingPurchase?.status === 'pending'){
        return res.status(200).json({purchaseId: existingPurchase._id, status: existingPurchase.status,msg: 'You already have a pending payment'})
    }

    const purchase = await Purchase.create({purchasedBy: userId,name,content: content._id})
    await purchaseExpireQueue.add('expire-purchase',{purchaseId: purchase._id},{delay: 30* 60 *1000})

    // purchaseID: purchase._id,status: purchase.status,contentID: purchase.content
    res.status(200).json({success: true, msg: `Purchsed the content with Id ${id} your purchase id is ${purchase._id} and the status of this purchase is ${purchase.status}`, purchaseId: purchase._id})
}

const myPurchase = async(req,res) =>{
    const {userId} = req.user
    const purchase = await Purchase.find({purchasedBy: userId}).select('_id content status')
    if(!purchase){
        throw new NotFoundError('No purchase found')
    }
    res.status(200).json({purchase,length: purchase.length})
}

module.exports = {purchase,myPurchase}