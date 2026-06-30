const {Queue} = require('bullmq')

connection = {
    host: 'localhost',
    port: 6379
}

const sendEmailQueue = new Queue('email-queue',{connection})

const sendPassChange = new Queue('pass-email',{connection})

module.exports = {sendEmailQueue,sendPassChange}