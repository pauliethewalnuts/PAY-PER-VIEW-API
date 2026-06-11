const express = require('express')
const authRouter = require('./routes/auth')
const contentRouter = require('./routes/content')
const purchaseRouter = require('./routes/purchase')
const notFound = require('./middleware/notFound')
const errorHandlerMiddleware = require('./middleware/errorhandler')
const authenticationMiddleware = require('./middleware/authentication')
const connectDB = require('./db/connect')

require('dotenv').config()

const app = express()


app.get('/',(req,res)=>{
    res.send('Pay-Per-View API')
})
app.use(express.json())
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/content',authenticationMiddleware,contentRouter)
app.use('/api/v1/purchase',authenticationMiddleware,purchaseRouter)


app.use(errorHandlerMiddleware)
app.use(notFound)

const port = 3000


const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port,()=>{
            console.log(`Listening on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()