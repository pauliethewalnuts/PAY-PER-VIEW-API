const mongoose = require('mongoose')

const ContentSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true,'Please provide a title'],
        maxlength: 50
    },
    description:{
        type: String,
        maxlength: 100,
        default:"Content"
    },
    price:{
        type: Number,
        required: [true,"Please provide the price you want to charge"]
    },
    images:{
        type: [String],
        required: [true, "Please provide the image"]
    },
    uploadedBy:{
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: [true,'Please provide the user']
    }
})

module.exports = mongoose.model('Content',ContentSchema)