require('dotenv').config()

const {Queue} = require('bullmq')

const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL);

const sendEmailQueue = new Queue('email-queue',{connection})

const sendPassChange = new Queue('pass-email',{connection})

module.exports = {sendEmailQueue,sendPassChange}