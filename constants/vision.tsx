import FaceDetection, { FaceDetectorContourMode, FaceDetectorLandmarkMode, FaceContourType, FaceLandmarkType } from "react-native-face-detection";
import { Camera } from 'react-native-vision-camera-v3-face-detection';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { useCameraDevice } from "react-native-vision-camera";




export async function App() {
    const [faces, setFaces] = useState(null)

    const device = useCameraDevice("front")

    if (!device) return null

    return (
        <Camera
            isActive
            options={{
                performanceMode: 'fast',
            }}
            callback={(data: any) => setFaces(data)}
            style={StyleSheet.absoluteFill}
            device={device}
        />
    )

}