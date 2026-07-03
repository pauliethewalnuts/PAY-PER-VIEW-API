const {Queue} = require('bullmq')

const connection = {
  host: 'localhost',
  port: 6379
};

const purchaseQueue = new Queue('purchaseQueue',{connection})

const purchaseExpireQueue = new Queue('purchaseExpireQueue',{connection})

module.exports = {purchaseQueue, purchaseExpireQueue}