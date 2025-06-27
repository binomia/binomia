import { StyleSheet } from 'react-native'
import React, { useRef } from 'react'
import { Camera, DrawableFrame, useCameraDevice, useSkiaFrameProcessor } from 'react-native-vision-camera'
import { Face, FaceDetectionOptions, useFaceDetector } from 'react-native-vision-camera-face-detector'
import { ZStack } from 'native-base'
import { Worklets } from 'react-native-worklets-core'
import { PaintStyle, Skia } from '@shopify/react-native-skia'
import colors from '@/colors'


const CameraFaceMask: React.FC = () => {
	const ref = useRef<Camera>(null);

	const device = useCameraDevice("front");
	const faceDetectionOptions = useRef<FaceDetectionOptions>({}).current
	const { detectFaces } = useFaceDetector(faceDetectionOptions)


	const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[]) => {
		if (faces.length > 0) {
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

			const dotPaint = Skia.Paint()
			dotPaint.setColor(Skia.Color(colors.pureGray))
			dotPaint.setStyle(PaintStyle.Fill)

			const linePaint = Skia.Paint()
			linePaint.setColor(Skia.Color(colors.gray))
			linePaint.setStrokeWidth(1)
			linePaint.setPathEffect(Skia.PathEffect.MakeDash([10, 6], 0))

			const points: { x: number; y: number }[] = []
			const numOuterPoints = 12
			const numInnerPoints = 12

			const rotatePoint = (px: number, py: number) => {
				const dx = px - centerX
				const dy = py - centerY
				const rotatedX = centerX + dx * Math.cos(-Math.PI / 2) - dy * Math.sin(-Math.PI / 2)
				const rotatedY = centerY + dx * Math.sin(-Math.PI / 2) + dy * Math.cos(-Math.PI / 2)
				return { x: rotatedX, y: rotatedY }
			}

			for (let i = 0; i < numOuterPoints; i++) {
				const angle = (2 * Math.PI * i) / numOuterPoints

				const dynamicFactor = Math.sin(angle) * 0.2

				const radiusX = (width / 2) * (0.6 + dynamicFactor * 0.3)
				const radiusY = (height / 2) * (1.2 + Math.cos(angle) * 0.1) // Increased from 0.95 to 1.2
				const yOffsetFactor = Math.sin(angle)
				const adjustedRadiusY = radiusY * (1 + 0.2 * yOffsetFactor)

				const px = centerX + radiusX * Math.cos(angle)
				const py = centerY - height * 0.15 + adjustedRadiusY * Math.sin(angle)

				const rotated = rotatePoint(px, py)
				points.push(rotated)
			}

			for (let i = 0; i < numInnerPoints; i++) {
				const angle = 2 * Math.PI * Math.random()
				const radiusX = (width / 2) * (0.35 + 0.25 * Math.random())
				const radiusY = (height / 2) * (0.45 + 0.35 * Math.random())

				const px = centerX + radiusX * Math.cos(angle)
				const py = centerY + radiusY * Math.sin(angle)

				const rotated = rotatePoint(px, py)
				points.push(rotated)
			}

			for (const pt of points) {
				frame.drawCircle(pt.x, pt.y, 3, dotPaint)
			}

			for (let i = 0; i < points.length; i++) {
				const ptA = points[i]
				for (let j = i + 1; j < points.length; j++) {
					const ptB = points[j]
					const distance = Math.hypot(ptA.x - ptB.x, ptA.y - ptB.y)
					if (distance < 160 && Math.random() < 0.3) {
						frame.drawLine(ptA.x, ptA.y, ptB.x, ptB.y, linePaint)
					}
				}
			}
		}

		handleDetectedFaces(faces)
	}, [])






	return (
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
