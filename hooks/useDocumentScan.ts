import { Alert, PermissionsAndroid, Platform } from 'react-native'
import { useState } from "react"
import  DocumentScanner, { ScanDocumentOptions } from 'react-native-document-scanner-plugin'



export const useDocumentScanner = () => {
    const [scannedImages, setScannedImages] = useState<any>([]);

    const scanDocument = async () => {
        const options: ScanDocumentOptions = {
            maxNumDocuments: 1, 
        }


        if (Platform.OS === 'android') {
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)

            if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Error', 'User must grant camera permissions to use document scanner.')
                return
            }
        }

        const image = await DocumentScanner.scanDocument(options)
        if (image.status === "success") {
            image.scannedImages
            if (image.scannedImages) {
                setScannedImages([...scannedImages, ...image.scannedImages])
            }
        }
    }

    return {
        scanDocument,
        setScannedImages,
        document: scannedImages[0],
        images: scannedImages
    }
}

