import { StyleSheet } from 'react-native'
import React, { useRef } from 'react'
import { Camera, DrawableFrame, useCameraDevice, useSkiaFrameProcessor } from 'react-native-vision-camera'
import { Face, FaceDetectionOptions, useFaceDetector } from 'react-native-vision-camera-face-detector'
import { ZStack } from 'native-base'
import { Worklets } from 'react-native-worklets-core'
import { PaintStyle, Skia } from '@shopify/react-native-skia'


const CameraFaceMask: React.FC = () => {
    const ref = useRef<Camera>(null);

    const device = useCameraDevice("front");
    const faceDetectionOptions = useRef<FaceDetectionOptions>({}).current
    const { detectFaces } = useFaceDetector(faceDetectionOptions)



    const handleDetectedFaces = Worklets.createRunOnJS(async (faces: Face[]) => {
        if (faces.length > 0) {
            const face = faces[0]
            console.log("Detected faces: ", face.bounds);
        }
    });

    const frameProcessor = useSkiaFrameProcessor((frame: DrawableFrame) => {
        'worklet'
        frame.render()
      
        const faces = detectFaces(frame)
        if (faces.length > 0) {
          const face = faces[0]
          const { x, y, width, height } = face.bounds
      
          const centerX = x + width / 2
          const centerY = y + height / 2
          const radius = Math.min(width, height) / 2.2
      
          const paint = Skia.Paint()
          paint.setColor(Skia.Color('cyan'))
          paint.setStrokeWidth(3)
          paint.setStyle(PaintStyle.Stroke)
      
          // Circle around the face
          frame.drawCircle(centerX, centerY, radius, paint)
      
          // Eye line (horizontal)
          const eyeY = centerY - height * 0.2
          frame.drawLine(x + width * 0.2, eyeY, x + width * 0.8, eyeY, paint)
      
          // Nose line (vertical)
          frame.drawLine(centerX, y + height * 0.2, centerX, y + height * 0.75, paint)
      
          // Chin arc (bottom semi-circle)
          const arcRect = Skia.XYWHRect(
            x + width * 0.2,
            y + height * 0.6,
            width * 0.6,
            height * 0.4
          )
          const arcPath = Skia.Path.Make()
          arcPath.addArc(arcRect, 0, 180)
          frame.drawPath(arcPath, paint)
        }
      
        handleDetectedFaces(faces)
      }, [])
      

    // const onPress = () => {
    //   setPlace({
    //     x: place.x + 10,
    //     y: place.y + 10
    //   })
    // }

    return (
        // <>
        //   <Button bg={"mainGreen"} title='click' onPress={onPress} />
        //   <Animated.View style={animatedStyle} />
        // </>
        device &&
        <ZStack flex={1}>
            <Camera
                preview={true}
                ref={ref}
                photo={true}
                video={true}
                style={StyleSheet.absoluteFillObject}
                device={device}
                frameProcessor={frameProcessor}
                pixelFormat="rgb"
                isActive
            />


        </ZStack>

    )
}

export default CameraFaceMask
