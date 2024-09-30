import AWS from 'aws-sdk';



export const useAzureFaceAPI = () => {
    AWS.config.update({
        region: 'your-region', // e.g., 'us-west-2'
        accessKeyId: 'your-access-key-id',
        secretAccessKey: 'your-secret-access-key'
    });

    const rekognition = new AWS.Rekognition();


    const indexFaceInCollection = async (imageBase64: string, collectionId: string) => {
        const params = {
            CollectionId: collectionId, // Collection ID you created earlier
            Image: {
                Bytes: Buffer.from(imageBase64, 'base64'), // The base64 image of the person
            },
            DetectionAttributes: ['ALL'],
            ExternalImageId: 'personName', // You can use a unique identifier for the person (e.g., their name)
        };

        try {
            const response = await rekognition.indexFaces(params).promise();
            console.log('Face indexed:', response);
        } catch (error) {
            console.error('Error indexing face:', error);
        }
    };




    const detectFaces = async (imageBase64: string) => {
        const params = {
            Image: {
                Bytes: Buffer.from(imageBase64, 'base64'),
            },
            Attributes: ['ALL'], // You can use 'DEFAULT' or specify attributes like 'ALL'
        };

        try {
            const response = await rekognition.detectFaces(params).promise();
            console.log(response); // This contains face details like bounding box, emotions, etc.
        } catch (error) {
            console.log('Error detecting faces:', error);
        }
    };


    const recognizePerson = async (imageBase64: string, collectionId: string = "arn:aws:dynamodb:us-east-1:211125537659:table/dinero_faces") => {
        const params = {
            CollectionId: collectionId, // Your collection ID
            Image: {
                Bytes: Buffer.from(imageBase64, 'base64'), // The base64 image of the person to recognize
            },
            MaxFaces: 1, // Set to the number of faces you want to match
            FaceMatchThreshold: 95, // Confidence level for matching
        };

        try {
            const response = await rekognition.searchFacesByImage(params).promise();

            if (response.FaceMatches) {
                if (response.FaceMatches.length > 0) {
                    const match = response.FaceMatches[0];
                    console.log('Person recognized:', match);

                } else {
                    console.log('No matching face found');
                }

            }
        } catch (error) {
            console.error('Error recognizing face:', error);
        }
    };


    return {
        indexFaceInCollection,
        detectFaces,
        recognizePerson
    };
}