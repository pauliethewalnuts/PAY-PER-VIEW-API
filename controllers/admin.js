const {deleteFailedPurchasesQueue} = require('../queues/purchaseQueue')

const start = async(req,res)=>{
    await deleteFailedPurchasesQueue.add('cleanup',{})
    res.status(200).json({success: true,msg: 'Deleted purchases'})
}

module.exports = start