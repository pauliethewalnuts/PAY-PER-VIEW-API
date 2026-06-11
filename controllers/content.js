const Content = require('../models/content')
const Purchase = require('../models/purchase')
const UnauthorizedError = require('../errors/indexError')
const BadRequestError = require('../errors/indexError')
const { deserialize } = require('mongodb')

const createContent = async (req,res) =>{
    const {userId,name,role}= req.user
    const {title,description,price,images} = req.body
    // if(role === "Buyer"){
    //     throw new UnauthorizedError('You are not allowed to create content as a Buyer')
    // }
    const content = await Content.create({title,description,price,images,uploadedBy:userId})
    res.status(201).json(content)
}

const getPurchasedContent = async(req,res) =>{
    const {userId,name} = req.user

    const {id} = req.params

    const content = await Content.findById(id)

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
        throw new UnauthorizedError('Pease finish the payment before accessing the content')
    }
    res.status(200).json({title:content.title,description:content.description,price:content.price,uploadedBy:content.uploadedBy,id:content._id,content: content.images,purchaseId: purchase._id})
}

const getContent = async (req,res) =>{
    const content = await Content.find({}).select('title description price uploadedBy')
    // const new_content = content.map((item)=>({
    //     id: item._id,
    //     title: item.title,
    //     description: item.description,
    //     price: item.price,
    //     uploadedBy: item.uploadedBy
    // }))
    res.status(200).json({content,length:content.length})
}

const getMyContent = async(req,res) =>{
    const {userId} = req.user
    const content = await Content.find({uploadedBy:userId}).select('_id title description price images')
    res.status(200).json({content,length: content.length})
}

const updateContent = async(req,res) =>{
    const {userId} = req.user
    const {id} = req.params
    const {title,description,price,images} = req.body

    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (price) updateFields.price = price;
    if (images) updateFields.images = images;

    const content = await Content.findOneAndUpdate({uploadedBy:userId,_id:id},updateFields,{ returnDocument: 'after',runValidators: true }).select('_id title description price images')
    if(!content){
        throw new BadRequestError(`No content found to update`)
    }
    res.status(200).json({updatedContent: content})
}

const deleteContent = async(req,res) =>{
    const {userId} = req.user
    const {id} = req.params

    const content = await Content.findOneAndDelete({_id:id,uploadedBy:userId})
    if(!content){
        throw new BadRequestError('Content not found or not authorized to delete')
    }
    res.status(200).json({success:true})
}

module.exports = {createContent, getPurchasedContent,getContent,getMyContent,updateContent,deleteContent}