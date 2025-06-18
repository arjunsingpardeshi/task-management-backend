import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs"
dotenv.config();
// console.log("Cloudinary config", {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET ? "*****" : undefined,
// });
// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath) => {
    console.log("inside uploadcloudnary function localfile path = ", localFilePath);
    
    try {
        if (!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);
        return response


    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed
        console.log("error in clodinary function is = ", error);
        
        return null
    }
}

export {uploadOnCloudinary}