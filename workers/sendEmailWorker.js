require('dotenv').config()
const {Worker} = require('bullmq')
const transporter = require('../utils/transporter')
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});
new Worker('email-queue',async(job) =>{
    const {email,code} = job.data
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Use this code to verify your account',
        text: `the code to verify your account is ${code}`
    })
    console.log('Email Sent')
},{connection})


new Worker('pass-email',async(job)=>{
    const {email,code} = job.data
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Use this code to change the email',
        text:`code: ${code}`
    })
    console.log('Email sent')
},{connection})