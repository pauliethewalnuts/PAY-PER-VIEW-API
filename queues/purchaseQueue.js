const {Queue} = require('bullmq')

const connection = {
  host: 'localhost',
  port: 6379
};

const purchaseQueue = new Queue('purchaseQueue',{connection})

module.exports = purchaseQueue