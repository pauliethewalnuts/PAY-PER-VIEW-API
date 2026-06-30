const BadRequestError = require('../errors/indexError')
const Content = require('../models/content')
const Purchase = require('../models/purchase')
const purchaseQueue = require('../queues/purchaseQueue')

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
    const existingPurchase = await Purchase.findOne({purchasedBy:userId,content:id,status:"paid"})

    if(existingPurchase){
        throw new BadRequestError('Content already Purchased')
    }

    const purchase = await Purchase.create({purchasedBy: userId,name,content: content._id})
    // await purchaseQueue.add('process-payment',{purchaseId: purchase._id})

    res.status(200).json({purchaseID: purchase._id,status: purchase.status,contentID: purchase.content})
}

const myPurchase = async(req,res) =>{
    const {userId} = req.user
    const purchase = await Purchase.find({purchasedBy: userId}).select('_id content status')
    res.status(200).json({purchase,length: purchase.length})
}

module.exports = {purchase,myPurchase}