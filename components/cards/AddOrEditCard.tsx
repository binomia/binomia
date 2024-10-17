import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { HStack, VStack } from 'native-base'
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { CreditCardView } from 'react-native-credit-card-input';
import { cardBackHolder, cardHolder } from '@/assets';
import BottomSheet from '../global/BottomSheet';
import Button from '../global/Button';
import Input from '../global/Input';
import colors from '@/colors';


type Props = {
    open?: boolean
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')
const AddOrEditCard: React.FC<Props> = ({ open, onCloseFinish: onClose }: Props = {}) => {
    const [number, setNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvc, setCvc] = useState("")
    const [name, setName] = useState("")
    const [focusedField, setFocusedField] = useState("")
    const [disabledButton, setDisabledButton] = useState(true)

    const cardPlaceholders = {
        number: "0000 0000 0000 0000",
        expiry: "MM/YY",
        cvc: "CVC",
        name: "Nombre Completo",
    }

    const identifyCardType = (cardNumber: string): string | undefined => {
        // Remove spaces or dashes
        cardNumber = cardNumber.replace(/[\s-]/g, "");

        // Define card type patterns with relaxed digit checking
        const cardPatterns: { [key: string]: RegExp } = {
            "visa": /^4/,                                    // Visa: starts with 4
            "mastercard": /^5[1-5]/,                         // MasterCard: starts with 51-55
            "american-express": /^3[47]/,                    // Amex: starts with 34 or 37
            "jcb": /^(?:2131|1800|35)/,                      // JCB: starts with 2131, 1800, or 35
            "discover": /^6(?:011|5)/,                       // Discover: starts with 6011 or 65
            "diners-club": /^3(?:0[0-5]|[689])/,             // Diners Club: starts with 300-305, 3095, or 36/38
        };

        // Identify the card type based on the initial digits
        for (const cardType in cardPatterns) {
            if (cardPatterns[cardType].test(cardNumber))
                return cardType;
        }

        return undefined;  // Return undefined if no match is found
    };

    const formatExpirationDate = (input: string): string => {
        // Check if the input is exactly 4 digits
        if (/^\d{4}$/.test(input)) {
            // Use regex to capture the first two and last two digits
            return input.replace(/(\d{2})(\d{2})/, '$1/$2');
        }

        // If input is not 4 digits, return it as-is
        return input;
    }

    const onChangeText = (text: string, type: string) => {
        if (type === "number") {
            setNumber(text)

        } else if (type === "expiry") {
            setExpiry(formatExpirationDate(text))
            console.log(text.length);

        } else if (type === "cvc") {
            setCvc(text)

        } else if (type === "name") {
            setName(text)
        }
    }

    const isValidCardLength = (cardNumber: string): boolean => {
        // Identify the card type
        const cardType = identifyCardType(cardNumber);
        if (!cardType) return false; // Invalid card type

        // Define valid lengths for each card type
        const cardLengths: { [key: string]: number[] } = {
            "visa": [13, 16, 19],
            "mastercard": [16],
            "american-express": [15],
            "jcb": [15, 16],
            "discover": [16],
            "diners-club": [14],
        };

        // Get the length of the card number
        const length = cardNumber.replace(/[\s-]/g, "").length; // Remove spaces and dashes, then get length

        // Check if the length is valid for the identified card type
        return cardLengths[cardType].includes(length);
    };

    const isExpiryValidExpiredDate = (expiryDate: string): boolean => {
        // Validate format using a regular expression for MM/YY format
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;

        // Split the expiry date into month and year
        const [month, year] = expiryDate.split('/').map(Number);

        // Check if month is valid (01-12)
        if (month < 1 || month > 12) return false;

        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear() % 100; // Last two digits of the current year
        const currentMonth = now.getMonth() + 1; // Months are zero-based, so add 1

        // Check if the expiry date is in the future or current month/year
        if (year > currentYear || (year === currentYear && month >= currentMonth)) {
            return true; // Expiry date is valid (not expired)
        }

        return false; // Expired
    };

    const isValidCVC = (cvc: string, cardNumber: string): boolean => {
        // Identify the card type
        const cardType = identifyCardType(cardNumber);
        if (!cardType) return false; // Invalid card type

        // Define valid CVC lengths for each card type
        const cvcLengths: { [key: string]: number } = {
            "visa": 3,
            "mastercard": 3,
            "american-express": 4,
            "discover": 3,
            "diners-club": 3,
            "jcb": 3, // JCB typically uses 3 digits
        };

        // Get the expected CVC length for the identified card type
        const expectedLength = cvcLengths[cardType];

        // Validate CVC length
        return cvc.length === expectedLength;
    };

    useEffect(() => {
        const isValidCard = isValidCardLength(number)
        const isValidExpiry = isExpiryValidExpiredDate(expiry)
        const isValidCvc = isValidCVC(cvc, number)


        if (isValidCard && isValidExpiry && isValidCvc && name) {
            setDisabledButton(false)

        } else {
            setDisabledButton(true)
        }

    }, [number, expiry, cvc, name])

    return (
        <KeyboardAvoidingScrollView scrollEnabled={!Keyboard.isVisible()}>
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <BottomSheet openTime={300} height={height * 0.90} onCloseFinish={onClose} open={open}>
                    <VStack h={"100%"} justifyContent={"space-between"}>
                        <VStack p={"20px"} variant={"body"} w={"100%"} alignItems={"center"}>
                            <HStack bg={colors.lightGray} w={"100%"} py={"20px"} px={"40px"} borderRadius={10}>
                                <CreditCardView
                                    imageFront={cardHolder}
                                    imageBack={cardBackHolder}
                                    name={name}
                                    number={number.match(/.{1,4}/g)?.join(" ") || ""}
                                    expiry={expiry}
                                    cvc={cvc}                                    
                                    placeholders={cardPlaceholders}
                                    focusedField={focusedField as any}
                                    type={identifyCardType(number) as any}
                                />
                            </HStack>
                            <VStack mt={"20px"}>
                                <Input onFocus={() => setFocusedField("name")} placeholder='Nombre De La Tarjeta' onChangeText={(text) => onChangeText(text, "name")} />
                                <Input onFocus={() => setFocusedField("number")} keyboardType="number-pad" placeholder='Numero De La Tarjeta' maxLength={19} onChangeText={(text) => onChangeText(text, "number")} />
                                <HStack w={"100%"} justifyContent={"space-between"}>
                                    <HStack w={"48%"}>
                                        <Input textAlign={"center"} maxLength={5} value={expiry} onFocus={() => setFocusedField("expiry")} keyboardType='number-pad' w={"100%"} placeholder='Expiracion' onChangeText={(text) => onChangeText(text, "expiry")} />
                                    </HStack>
                                    <HStack w={"48%"}>
                                        <Input textAlign={"center"} onFocus={() => setFocusedField("cvc")} keyboardType='number-pad' w={"100%"} maxLength={4} placeholder='CVV' onChangeText={(text) => onChangeText(text, "cvc")} />
                                    </HStack>
                                </HStack>
                            </VStack>
                        </VStack>
                        <HStack h={"100px"} justifyContent={"center"} mb={"50px"} >
                            <Button
                                opacity={disabledButton ? 0.5 : 1}
                                disabled={disabledButton}
                                bg={disabledButton ? "lightGray" : "mainGreen"}
                                color={disabledButton ? colors.mainGreen : colors.white}
                                title={"Confirmar"}
                                onPress={onClose}
                            />
                        </HStack>
                    </VStack>
                </BottomSheet>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingScrollView>
    )
}

export default AddOrEditCard

const styles = StyleSheet.create({})
