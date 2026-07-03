const connectDB = require('../db/connect')
const BadRequestError = require('../errors/badReqError')
const NotFoundError = require('../errors/NotFoundError')
const Purchase = require('../models/purchase')
require('dotenv').config()
const {Worker, tryCatch} = require('bullmq')

const connection = {
    host: 'localhost',
    port: 6379
}

const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        console.log('Purchase worker connected To DB')
    } catch (error) {
        console.log(error)
    }
    new Worker('purchaseQueue', async (job)=>{
        try {
            const {purchaseId} = job.data
            const purchase = await Purchase.findById(purchaseId)
            if(!purchase){
                console.log(`Purchase with id ${purchaseId} not found`)
            }
            if(purchase.status !== 'processing'){
                return
            }
            await new Promise((resolve)=>{
                setTimeout(resolve,5000)
            })
            purchase.status = 'paid'
            await purchase.save()    
        } catch (error) {
            purchase.status = 'failed'
            await purchase.save()
            throw error;
        }
        
    }, {connection})
}

const startExpire = async()=>{
    try{
        await connectDB(process.env.MONGO_URI)
        console.log('Purchase Expire Worker Connected to DB')
    }catch(error){
        console.log(error)
    }
    new Worker('purchaseExpireQueue',async (job)=>{
        const {purchaseId} = job.data
        const purchase = await Purchase.findById(purchaseId)
        if(!purchase){
            console.log(`Purchase with id ${purchaseId} not found`)
        }
        if(purchase.status === 'pending'){
            purchase.status = 'expired'
            await purchase.save()
        }
    }, {connection})
}

start()
startExpire()