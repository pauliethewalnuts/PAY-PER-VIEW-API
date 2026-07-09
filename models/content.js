const mongoose = require('mongoose')

const ContentSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true,'Please provide a title'],
        maxlength: 50
    },
    description:{
        type: String,
        maxlength: 90,
        default:"Content"
    },
    price:{
        type: Number,
        required: [true,"Please provide the price you want to charge"]
    },
    images:
        [{
            url: String,
            public_id: String
        }],
    uploadedBy:{
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: [true,'Please provide the user']
    }
})

ContentSchema.index({ uploadedBy: 1 });
ContentSchema.index({ price: 1 });

module.exports = mongoose.model('Content',ContentSchema)