import { CLOUDINARY, CLOUDINARY_API_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_ID_UPLOAD_PRESET, CLOUDINARY_VIDEO_UPLOAD_PRESET } from "@/constants";
import axios from "axios"
import { useState } from "react";


type UseCloudinaryType = {
    uploadImage: (image: any) => Promise<any>;
    uploadImages: (images: any) => Promise<any>;
    uploadTransactionImages: (images: any) => Promise<any>;
    uploadVideo: (audioUri: string) => Promise<any>;
    setUploadedData: (image: any) => void;
    uploadedData: any
}


export const useCloudinary = (): UseCloudinaryType => {
    const [uploadedData, setUploadedData] = useState<any>({})


    const uploadImages = async (images: any) => {
        try {
            if (images.length > 0) {
                const uploadResponses = await Promise.all(
                    images.map((image: string) => {
                        return uploadImage(image)
                    })
                );

                const urls = uploadResponses.map((url: any) => url)
                return urls
            }

        } catch (_: any) {
            return null
        }
    }

    

    const uploadTransactionImages = async (imageUri: string): Promise<any> => {
        try {
            if (!imageUri) return false;

            const imageData: any = {
                uri: imageUri,
                type: "image/png",
                name: `${Date.now()}.png`
            }

            const data = new FormData()
            data.append("file", imageData)
            data.append("upload_preset", CLOUDINARY.TRANSACTIONS_IMAGES_PRESET)
            data.append("cloud_name", CLOUDINARY_CLOUD_NAME)
            data.append("public_id", `${Date.now()}`)

            const response = await axios.post(CLOUDINARY_API_URL, data)
            setUploadedData(response.data)

            return response.data?.secure_url

        } catch (error) {
            console.error(error, "uploadImage");
            return null
        }
    }
    const uploadImage = async (imageUri: string): Promise<any> => {
        try {
            if (!imageUri) return false;

            const imageData: any = {
                uri: imageUri,
                type: "image/png",
                name: `${Date.now()}.png`
            }

            const data = new FormData()
            data.append("file", imageData)
            data.append("upload_preset", CLOUDINARY_ID_UPLOAD_PRESET)
            data.append("cloud_name", CLOUDINARY_CLOUD_NAME)
            data.append("public_id", `${Date.now()}`)

            const response = await axios.post(CLOUDINARY_API_URL, data)
            setUploadedData(response.data)

            return response.data?.secure_url

        } catch (error) {
            console.error(error, "uploadImage");
        }
    }

    const uploadVideo = async (audioUri: string): Promise<any> => {
        try {
            if (audioUri) {
                const audio: any = {
                    uri: audioUri,
                    type: "video/mp4",
                    name: audioUri
                }

                const data = new FormData()
                data.append("file", audio)
                data.append("upload_preset", CLOUDINARY_VIDEO_UPLOAD_PRESET)
                data.append("cloud_name", CLOUDINARY_CLOUD_NAME)
                data.append("public_id", `${Date.now()}`)

                const response = await axios.post(CLOUDINARY_API_URL, data)
                setUploadedData(response.data)

                return response.data?.secure_url
            }

        } catch (error: any) {
            throw error
        }
    }


    return {
        uploadImage,
        uploadImages,
        uploadVideo,
        setUploadedData,
        uploadTransactionImages,
        uploadedData
    }
}

