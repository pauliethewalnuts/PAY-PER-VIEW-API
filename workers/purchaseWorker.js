const connectDB = require('../db/connect')
const Purchase = require('../models/purchase')
require('dotenv').config()
const {Worker} = require('bullmq')

const connection = {
    host: 'localhost',
    port: 6379
}

const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        console.log('worker connected To DB')
    } catch (error) {
        console.log(error)
    }
    new Worker('purchaseQueue', async (job)=>{
        try {
            const {purchaseId} = job.data
            await new Promise(resolve =>
                setTimeout(resolve, 5000)
            );
            const purchase = await Purchase.findByIdAndUpdate(purchaseId,{status:'paid'},{new:true})
        } catch (error) {
            console.log(error)
        }
        
    }, {connection})
}

start()

// new Worker('purchaseQueue', async (job)=>{
//     try {
//         const {purchaseId} = job.data
//         const purchase = await Purchase.findByIdAndUpdate(purchaseId,{status:'paid'},{new:true})
//         console.log(purchase)
//     } catch (error) {
//         console.log(error)
//     }
    
// }, {connection})

// worker.on('completed',(job)=>{
//     console.log(`Job ${job.id} completed`)
// })

// worker.on('failed',(job,err)=>{
//     console.log(`Job ${job.id} Failed`)
//     console.log(err,message)
// })