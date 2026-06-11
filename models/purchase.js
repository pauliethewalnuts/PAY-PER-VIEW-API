const mongoose = require('mongoose')

const PurchaseSchema = mongoose.Schema({
    purchasedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true,'Please provide the user']
    },
    name:{
        type: String,
        required: [true,'Please provide the name']
    },
    content:{
        type:mongoose.Types.ObjectId,
        ref: 'Content',
        required: [true,'Please provide the content to be purchased']
    },
    status:{
        type: String,
        enum: ['pending','paid','failed'],
        default: 'pending'
    }
})

module.exports = mongoose.model('Purchase',PurchaseSchema)