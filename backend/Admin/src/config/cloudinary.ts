import cloudinary from "cloudinary";

export const setupcloudinary = () => {
 try {
     cloudinary.v2.config({
    cloud_name: process.env.Cloud_name as string,
    api_key: process.env.Cloud_Api_Key as string,
    api_secret: process.env.Cloud_Api_Secret as string,
  });
 } catch (error) {
    console.log("cloudinary error",error)
 }
  
};
