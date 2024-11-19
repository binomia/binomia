import React, { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../global/Button';
import Input from '../global/Input';
import colors from '@/colors';
import PagerView from 'react-native-pager-view';
import valid from "card-validator";
import { Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { HStack, Pressable, Stack, Image, VStack, Text, Heading } from 'native-base'
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { CreditCardView } from 'react-native-credit-card-input';
import { cardBackHolder, cardHolder, noCard } from '@/assets';
import { scale } from 'react-native-size-matters';
import { MaterialIcons } from '@expo/vector-icons';
import { TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { CreditCardIssuer } from 'react-native-credit-card-input/lib/typescript/src/useCreditCardForm';
import { useLazyQuery } from '@apollo/client';
import { CardApolloQueries } from '@/apollo/query/cardQuery';
import { useDispatch, useSelector } from 'react-redux';
import { globalActions } from '@/redux/slices/globalSlice';
import { CardType } from '@/types';


type Props = {
    open?: boolean
    openToEdit?: boolean
    setOpenToEdit?: (_: boolean) => void
    onPress?: (_: any) => Promise<void>
}

const { height } = Dimensions.get('window')
const AddOrEditCard: React.FC<Props> = ({ onPress = async (_: any) => { }, openToEdit = false, setOpenToEdit = (_: boolean) => { } }: Props) => {
    const ref = useRef<PagerView>(null);
    const [fetchCards] = useLazyQuery(CardApolloQueries.cards())
    const [fetchCard] = useLazyQuery(CardApolloQueries.card())
    const dispatch = useDispatch()
    const { card }: { card: CardType } = useSelector((state: any) => state.globalReducer)


    const [number, setNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvc, setCvc] = useState("")
    const [name, setName] = useState("")
    const [alias, setAlias] = useState("")
    const [focusedField, setFocusedField] = useState("")
    const [disabledButton, setDisabledButton] = useState(true)
    const [asPrimary, setAsPrimary] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [type, setType] = useState<CreditCardIssuer>()



    const cardPlaceholders = {
        number: "0000 0000 0000 0000",
        expiry: "MM/YY",
        cvc: "CVC",
        name: "Nombre Completo",
    }


    const onRefreshCards = useCallback(async () => {
        try {
            const { data } = await fetchCards()
            await dispatch(globalActions.setCards(data.cards))

        } catch (error) {
            console.log({
                onRefreshCards: error
            });
        }

    }, []);

    const handleOnPress = async () => {
        try {

            setIsLoading(true)
            await onPress({
                "cardHolderName": name,
                "cardNumber": number,
                "isPrimary": asPrimary,
                "cvv": cvc,
                "expirationDate": expiry,
                "alias": alias
            })

            await onRefreshCards()

            setIsLoading(false)
            setName("")
            setNumber("")
            setExpiry("")
            setCvc("")
            setAlias("")

        } catch (error: any) {
            setErrorMessage(error.message)
            setIsLoading(false)
            ref.current?.setPage(1)
        }
    }

    const identifyCardType = (cardNumber: string): string | undefined => {
        cardNumber = cardNumber.replace(/[\s-]/g, "");

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
            const { card } = valid.number(text)
            setNumber(text)
            setType(card?.type as CreditCardIssuer)

        } else if (type === "expiry") {
            setExpiry(formatExpirationDate(text))

        } else if (type === "cvc") {
            setCvc(text)

        } else if (type === "name") {
            setName(text)

        } else {
            setAlias(text)
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


    const fetchDecryptedCard = async () => {
        try {
            const { data } = await fetchCard({
                variables: {
                    cardId: card.id
                }
            })

            console.log({ fetchDecryptedCard: data });


            if (data?.card) {
                setName(data.card.cardHolderName)
                setNumber(data.card.cardNumber)
                setExpiry(data.card.expirationDate)
                setCvc(data.card.cvv)
                setAlias(data.card.alias)
                setAsPrimary(data.card.isPrimary)
                setFocusedField("number")
            }

        } catch (error: any) {
            console.log({ fetchDecryptedCard: error });
        }
    }


    useEffect(() => {
        const isValidCard = isValidCardLength(number)
        const isValidExpiry = isExpiryValidExpiredDate(expiry)
        const isValidCvc = isValidCVC(cvc, number)


        if (isValidCard && isValidExpiry && isValidCvc && name && alias) {
            setDisabledButton(false)

        } else {
            setDisabledButton(true)
        }

    }, [number, expiry, cvc, name, alias])

    useEffect(() => {
        console.log({ openToEdit });

        if (openToEdit)
            fetchDecryptedCard()
    }, [openToEdit])

    return (
        <PagerView style={{ flex: 1 }} initialPage={0} ref={ref}>
            <KeyboardAvoidingScrollView scrollEnabled={!Keyboard.isVisible()}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <VStack key={"CreditCardView-0"} flex={1} mb={"30px"} justifyContent={"space-between"}>
                        <VStack p={"20px"} w={"100%"}>
                            <HStack alignItems={"center"} bg={colors.lightGray} justifyContent={"center"} w={"100%"} py={scale(height * 0.015)} borderRadius={10}>
                                <CreditCardView
                                    imageFront={cardHolder}
                                    imageBack={cardBackHolder}
                                    name={name}
                                    number={number.match(/.{1,4}/g)?.join(" ") || ""}
                                    expiry={expiry}
                                    cvc={cvc}
                                    placeholders={cardPlaceholders}
                                    focusedField={focusedField as any}
                                    type={type as any}
                                />
                            </HStack>
                            <VStack mt={"20px"}>
                                <Input value={number} onFocus={() => setFocusedField("number")} h={scale(45)} keyboardType="number-pad" placeholder='Numero De La Tarjeta' maxLength={19} onChangeText={(text) => onChangeText(text, "number")} />
                                <Input value={name} onFocus={() => setFocusedField("name")} h={scale(45)} placeholder='Nombre De La Tarjeta' onChangeText={(text) => onChangeText(text, "name")} />
                                <HStack w={"100%"} justifyContent={"space-between"}>
                                    <HStack w={"48%"}>
                                        <Input textAlign={"center"} h={scale(45)} maxLength={5} value={expiry} onFocus={() => setFocusedField("expiry")} keyboardType='number-pad' w={"100%"} placeholder='Expiracion' onChangeText={(text) => onChangeText(text, "expiry")} />
                                    </HStack>
                                    <HStack w={"48%"}>
                                        <Input value={cvc} textAlign={"center"} h={scale(45)} onFocus={() => setFocusedField("cvc")} keyboardType='number-pad' w={"100%"} maxLength={4} placeholder='CVV' onChangeText={(text) => onChangeText(text, "cvc")} />
                                    </HStack>
                                </HStack>
                                <Input value={alias} h={scale(45)} onFocus={() => setFocusedField("")} placeholder='Alias De La Tarjeta' onChangeText={(text) => onChangeText(text, "alias")} />
                            </VStack>
                            <HStack alignSelf={"flex-end"} alignItems={"center"} w={"100%"} mt={"20px"}>
                                <Pressable onPress={() => setAsPrimary(!asPrimary)}>
                                    <MaterialIcons style={{ marginTop: 3 }} name={asPrimary ? "check-box" : "check-box-outline-blank"} size={28} color={colors.mainGreen} />
                                </Pressable>
                                <Text mx={"5px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"90%"} color={"white"}>
                                    Agregue tarjeta como método de pago principal.
                                </Text>
                            </HStack>
                        </VStack>
                        <Stack mb={"20px"} px={"20px"} justifyContent={"center"}>
                            <Button
                                spin={isLoading}
                                opacity={disabledButton ? 0.5 : 1}
                                disabled={disabledButton}
                                bg={disabledButton ? "lightGray" : "mainGreen"}
                                color={disabledButton ? colors.mainGreen : colors.white}
                                title={"Confirmar"}
                                onPress={handleOnPress}
                            />
                        </Stack>
                    </VStack>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingScrollView>
            <VStack key={"error-CreditCardView-1"} variant={"body"}>
                <VStack py={"30px"} px={"10px"} mb={"30px"} justifyContent={"space-between"} flex={1}>
                    <VStack mt={"10px"}>
                        <Image alt='logo-image' h={height / 3} resizeMode='contain' w={"100%"} source={noCard} />
                        <Heading textTransform={"capitalize"} fontSize={scale(20)} color={colors.white} textAlign={"center"}>{errorMessage}</Heading>
                        <Text textAlign={"center"} fontSize={scale(15)} color={colors.pureGray}>Por favor, añada una tarjeta  que no esté ya vinculada a su cuenta.</Text>
                    </VStack>
                    <Button onPress={() => ref.current?.setPage(0)} title="Añadir Tarjeta" bg={colors.mainGreen} />
                </VStack>
            </VStack>
        </PagerView>

    )
}

export default AddOrEditCard