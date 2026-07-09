const {Queue} = require('bullmq')

const connection = {
  host: 'localhost',
  port: 6379
};

const purchaseQueue = new Queue('purchaseQueue',{connection})

const purchaseExpireQueue = new Queue('purchaseExpireQueue',{connection})

const deleteFailedPurchasesQueue = new Queue('deleteFailedPurchases', {connection})

module.exports = {purchaseQueue, purchaseExpireQueue, deleteFailedPurchasesQueue}