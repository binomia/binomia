import moment from "moment";



(async () => {
    console.log(moment("2024-12-29").format("lll"));
    const user = {
        "id": 2,
        "fullName": "brayhan de aza",
        "username": "$brayhandeaza",
        "phone": "8098027293",
        "email": "brayhandeaza@gmail.com",
        "password": "$2b$10$kUaQs7RkJ40yBwK2gqURiuzYNJLjbBRB8Q8hRoWJiI/dLEA2eET7G",
        "dniNumber": "000-0000000-1",
        "profileImageUrl": null,
        "allowEmailNotification": true,
        "allowPushNotification": true,
        "allowSmsNotification": true,
        "allowWhatsappNotification": true,
        "userAgreementSigned": true,
        "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
        "status": "active",
        "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
        "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
        "address": "test",
        "account": {
            "id": 2,
            "balance": 700,
            "allowReceive": true,
            "allowWithdraw": true,
            "allowSend": true,
            "allowRequestMe": true,
            "allowDeposit": true,
            "status": "active",
            "sendLimit": 50000,
            "receiveLimit": 50000,
            "withdrawLimit": 50000,
            "depositLimit": 50000,
            "hash": "3AugGYc7dj9NdEMj4hQcD5",
            "currency": "DOP",
            "createdAt": "1737379356807",
            "updatedAt": "1737639803321",
            "transactions": null,
            "__typename": "AccountTypeWithTransactions"
        },
        "cards": [
            {
                "id": 4,
                "last4Number": "0002",
                "isPrimary": true,
                "hash": "11ed9eece6dca2522cc9c035ebb0b1b776788287773c9af784fb2a0abd1c19d1",
                "brand": "american-express",
                "alias": "Banco Popular",
                "data": "1c39f94b7646180a3e5c81c4951db02d:3b183892804209c29dc5b7ff100e21b2057057b0c39af3f96b2b1814ba26b1db6f22064f2a392721ed9390aa9ae4bb186397c0c51ad9cb809507f63136d091d6aed17a3f28c54c5c41ff3b223c26ee236d70b83b54f63b51afa440f1c4b45159640405ca6cacf466f9de8c38250379f5319c82f0e393bf31ca4d2f9700d3d4cbd29fdea2c737bdbc24c129933f7da94ad9380892cd55727c966559722c505cf4",
                "user": null,
                "createdAt": "1737553024011",
                "updatedAt": "1737553024011",
                "__typename": "OnlyCardType"
            }
        ],
        "kyc": {
            "id": 2,
            "dniNumber": "000-0000000-1",
            "dob": "1673308800000",
            "status": "validated",
            "expiration": "1673308800000",
            "occupation": null,
            "gender": null,
            "maritalStatus": null,
            "bloodType": null,
            "createdAt": "1737379356809",
            "updatedAt": "1737379356809",
            "__typename": "OnlyKYCType"
        },
        "createdAt": "1737379356801",
        "updatedAt": "1737379356801",
        "__typename": "UserType"
    }


})()