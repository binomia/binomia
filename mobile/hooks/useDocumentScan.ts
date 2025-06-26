import { Alert, PermissionsAndroid, Platform } from 'react-native'
import { useState } from "react"
import DocumentScanner from 'react-native-document-scanner-plugin'



export const useDocumentScanner = () => {
    const [scannedImages, setScannedImages] = useState<string[]>([]);

    const scanDocument = async () => {
        if (Platform.OS === 'android') {
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)

            if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Error', 'User must grant camera permissions to use document scanner.')
                return
            }
        }

        const image = await DocumentScanner.scanDocument({
            maxNumDocuments: 1,
            croppedImageQuality: 100,

        })

        if (image.status === "success") {
            if (image.scannedImages) {
                setScannedImages([...scannedImages, ...image.scannedImages])
                return image.scannedImages[0]
            }
        }

    }

    return {
        scanDocument,
        setScannedImages,
        document: scannedImages,
        images: scannedImages
    }
}

