const Content = require('../models/content')
const Purchase = require('../models/purchase')
const UnauthorizedError = require('../errors/indexError')
const BadRequestError = require('../errors/indexError')
const { deserialize } = require('mongodb')
const uploadToCloudinary = require('../utils/uploadToCloudinary')
const cloudinary = require('../config/cloudinary')
const { tryCatch } = require('bullmq')
const CustomAPIError = require('../errors/customError')
const NotFoundError = require('../errors/NotFoundError')

const createContent = async (req,res) =>{
    const {userId,userName}= req.user
    const {title,description,price} = req.body
    if(!title || !price){
        throw new BadRequestError('Please enter the details')
    }
    if(!req.files || req.files.length === 0){
        throw new BadRequestError('Please upload the images')
    }
    const imageUrls = []
    const content = new Content({title,description,price,uploadedBy: userId})
    try {
        await content.validate()

        for (const file of req.files){
            const result = await uploadToCloudinary(file.buffer,userName,userId)
            imageUrls.push({url:result.secure_url, public_id: result.public_id})
        }
        content.images = imageUrls

        await content.save()
    } catch (error) {
        for(const image of imageUrls){
            try {
                await cloudinary.uploader.destroy(image.public_id)
            } catch (error) {
                console.log(error)
            }
        }
        throw error
    }
    res.status(201).json({success:true,msg: "Upload Successful"})
}

const getPurchasedContent = async(req,res) =>{
    const {userId} = req.user

    const {id} = req.params

    const content = await Content.findById(id).populate('uploadedBy', "userName")

    if(!content){
        throw new BadRequestError(`No content with id ${id} Found`)
    }
    const purchase = await Purchase.findOne({purchasedBy: userId,content:content._id})

    if(!purchase){
        throw new UnauthorizedError('Please finish the payment before accessing the content')
    }

    if(purchase.purchasedBy.toString() !== userId){
        throw new UnauthorizedError('You did not buy this content, please buy the content')
    }

    if(purchase.status !== 'paid'){
        throw new UnauthorizedError('Please finish the payment before accessing the content')
    }
    res.status(200).json({title:content.title,description:content.description,price:content.price,uploadedBy:content.uploadedBy,id:content._id,content: content.images,purchaseId: purchase._id})
}

const getContent = async (req,res) =>{
    queryFields = {}
    const {title,description,minPrice,maxPrice} = req.query
    if(title) {
        queryFields.title = { $regex: title, $options: 'i'}
    }
    if(description){
        queryFields.description = { $regex: description, $options: 'i'}
    }
    if(minPrice || maxPrice){
        queryFields.price = {}
        if(minPrice){
            queryFields.price.$gte = Number(minPrice)
        }
        if(maxPrice){
            queryFields.price.$lte = Number(maxPrice)
        }
    }

    const content = await Content.find(queryFields).select('title description price images uploadedBy').populate('uploadedBy', 'userName profileImage')
        

    const data = content.map((item)=>({
        _id: item._id,
        title: item.title,
        description: item.description,
        price: item.price,
        uploadedBy: {
            profileImage:{
                url: item.uploadedBy.profileImage.url
            },
            _id: item.uploadedBy._id,
            userName: item.uploadedBy.userName
        },
        preview: cloudinary.url(item.images[0].public_id,{
            secure: true,
            transformation:[
                {
                    width: 340,
                    height: 220,
                    crop: 'fill'
                },
                {
                    quality: "auto:low"
                },
                // {
                //     overlay: "watermark_gq3zmr",
                //     gravity: "center",
                //     opacity: 50
                // }
            ]
        })
    }))
    
    res.status(200).json({data,length:data.length})
}

const getSingleContent = async(req,res) =>{
    const {id} = req.params
    const {userId} = req.user
    if(!id){
        throw BadRequestError('Please provide the content id')
    }
    const content = await Content.findById(id).select('title description price images uploadedBy').populate("uploadedBy","userName profileImage")
    if(!content){
        throw new NotFoundError(`The content with ${id} was not found`)
    }
    const contentId = content.uploadedBy._id.toString()

    if(contentId === userId.toString()){
        return res.status(200).json({success: true, content})
    }
    const contentData = content.toObject()
    delete contentData.images
    
    res.status(200).json({success: true, content: contentData})
}


const getMyContent = async(req,res) =>{
    const {userId} = req.user
    const content = await Content.find({uploadedBy:userId}).select('id title description price uploadedBy images').populate('uploadedBy', 'userName profileImage')
    res.status(200).json({content,length: content.length})
}

const updateContent = async(req,res) =>{
    const {userId} = req.user
    const {id} = req.params
    const {title,description,price} = req.body
    // const imageUrls = []
    // if (req.files){
    //     for (const file of req.files){
    //         result = await uploadToCloudinary(file.buffer)
    //         imageUrls.push[{url: result.secure_url, public_id: result.public_id}]
    //     }
    // }

    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (price) updateFields.price = price;
    // if (imageUrls.length > 0) updateFields.images = imageUrls;

    const content = await Content.findOneAndUpdate({uploadedBy:userId,_id:id},updateFields,{ returnDocument: 'after',runValidators: true }).select('_id title description price images')
    if(!content){
        throw new BadRequestError(`No content found to update`)
    }
    res.status(200).json({success: true,updatedContent: content})
}

const deleteContent = async(req,res) =>{
    const {userId} = req.user
    const {id} = req.params

    const content = await Content.findOne({_id:id,uploadedBy: userId})

    if(!content){
        throw new BadRequestError('No content to delete')
    }

    for (const images of content.images){
        await cloudinary.uploader.destroy(images.public_id)
    }

    await Content.findOneAndDelete({_id:id,uploadedBy:userId})

    if(!content){
        throw new BadRequestError('Content not found or not authorized to delete')
    }
    res.status(200).json({success:true})
}

module.exports = {createContent, getPurchasedContent,getContent,getSingleContent, getMyContent,updateContent,deleteContent}