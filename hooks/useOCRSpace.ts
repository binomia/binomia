import { OCR_SPACE_API_KEY } from "@/constants"
import { FORMAT_CEDULA, FORMAT_DATE } from "@/helpers"


export const useOCRSpace = () => {
    const extractTextFromImage = async (image: string) => {
        const api_url = `https://api.ocr.space/parse/imageurl?apikey=${OCR_SPACE_API_KEY}&url=${image}&language=spa&isOverlayRequired=true&detectOrientation=true&scale=true&OCREngine=2`


        return fetch(api_url).then(response => response.json()).then(data => {
            const response = data.ParsedResults[0].ParsedText
            return response

        }).catch(error => {
            console.error(error)
        })
    }

    const validateIDImage = async (imageurl: string) => {
        const text: string = await extractTextFromImage(imageurl)

        const idNumberMatch = text.match(/(\d{3}-\d{7}-\d)/);
        const placeOfBirthMatch = text.match(/LUGAR DE NACIMIENTO[:;]?\s*(.*)/i);
        const dateOfBirthMatch = text.match(/FECHA DE NACIMIENTO[:;]?\s*(.*)/i);
        const dateOfExpirationMatch = text.match(/FECHA DE EXPIRACI(?:Ó|O)N[:;]?\s*(.*)/i);
        const occupationMatch = text.match(/OCUPACI(?:Ó|O)N[:;]?\s*(.*)/i);
        const maritalStatusMatch = text.match(/ESTADO CIVIL[:;]?\s*(.*)/i);
        const genderMatch = text.match(/SEXO[:;]*\s*([a-zA-Z])\s/);
        const bloodTypeMatch = text.match(/SANGRE[:;]*\s*(.*)/i);

        const idNumber = idNumberMatch ? idNumberMatch[0] : null
        const placeOfBirth = placeOfBirthMatch ? placeOfBirthMatch[1].toLowerCase() : null
        const dateOfBirth = dateOfBirthMatch ? dateOfBirthMatch[1] : null
        const dateOfExpiration = dateOfExpirationMatch ? dateOfExpirationMatch[1] : null
        const occupation = occupationMatch ? occupationMatch[1].toLowerCase() : null
        const maritalStatus = maritalStatusMatch ? maritalStatusMatch[1].toLowerCase() : null
        const gender = genderMatch ? genderMatch[1].toLowerCase() : null


        const bloodTypeArray = bloodTypeMatch ? bloodTypeMatch[0].trim().split(" ") : null
        let bloodType

        if (bloodTypeArray) {
            if (bloodTypeArray[2] === "-" || bloodTypeArray[2] === "+")
                bloodType = String(bloodTypeArray[1] + bloodTypeArray[2]).replaceAll("0", "O")

            else
                bloodType = String(bloodTypeArray[1]).replaceAll("0", "O")
        }

        const nameIndex = dateOfExpiration ? text.split("\n").indexOf(dateOfExpiration) : null
        const name = nameIndex ? text.split("\n").slice(nameIndex + 1).join(" ").trim().toLowerCase() : null
        return {
            name,
            idNumber: FORMAT_CEDULA(idNumber || ""),
            placeOfBirth,
            dateOfBirth: FORMAT_DATE(dateOfBirth?.toLowerCase() || ""),
            dateOfExpiration: FORMAT_DATE(dateOfExpiration?.toLowerCase() || ""),
            occupation,
            maritalStatus,
            gender,
            bloodType,
        }
    }

    return {
        extractTextFromImage,
        validateIDImage
    }
}