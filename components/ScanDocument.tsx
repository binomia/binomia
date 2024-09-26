import React, { useRef } from "react"
import Scanner from "react-native-rectangle-scanner"

const DocumentScanner = () => {
	const camera = useRef<any>();

	const onCapture = () => {
		if (camera?.current.capture) return
		camera?.current?.capture();

		console.log("Captured");
	}


	return (
		<Scanner
			onPictureProcessed={onCapture}
			ref={camera}
			style={{ flex: 1 }}
		/>
	);

}


export default DocumentScanner