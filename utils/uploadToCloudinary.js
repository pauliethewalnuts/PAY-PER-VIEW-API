const cloudinary = require('../config/cloudinary')

const uploadToCloudinary = (buffer,name,userId) =>{
    return new Promise ((resolve,reject) =>{
        cloudinary.uploader.upload_stream(
            {folder:`content-api/${name}-${userId}`},
            (error,result) =>{
                if(error){
                    return reject(error)
                }
                resolve(result)
            }
        ).end(buffer)
    })
}

module.exports = uploadToCloudinary