require('dotenv').config()

const {Queue} = require('bullmq')

const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL);

const purchaseQueue = new Queue('purchaseQueue',{connection})

const purchaseExpireQueue = new Queue('purchaseExpireQueue',{connection})

const deleteFailedPurchasesQueue = new Queue('deleteFailedPurchases', {connection})

module.exports = {purchaseQueue, purchaseExpireQueue, deleteFailedPurchasesQueue}