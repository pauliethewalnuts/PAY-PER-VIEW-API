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
        enum: ['pending','paid','failed','expired','processing'],
        default: 'pending'
    },
    paymentAttempts:{
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Purchase',PurchaseSchema)