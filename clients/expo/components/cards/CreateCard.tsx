import React, { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../global/Button';
import Input from '../global/Input';
import colors from '@/colors';
import PagerView from 'react-native-pager-view';
import { Dimensions, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { HStack, Pressable, Image, VStack, Text, Heading } from 'native-base'
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { CreditCardView, CreditCardFormData, CreditCardInput } from 'react-native-credit-card-input';
import { cardBackHolder, cardHolder, noCard } from '@/assets';
import { scale } from 'react-native-size-matters';
import { MaterialIcons } from '@expo/vector-icons';
import { TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { CreditCardFormField, CreditCardIssuer } from 'react-native-credit-card-input/lib/typescript/src/useCreditCardForm';
import { useLazyQuery } from '@apollo/client';
import { CardApolloQueries } from '@/apollo/query/cardQuery';
import { useDispatch, useSelector } from 'react-redux';
import { CardType } from '@/types';
import { accountActions } from '@/redux/slices/accountSlice';


type Props = {
    openToEdit?: boolean
    setOpenToEdit?: (_: boolean) => void
    onPress?: (_: any) => Promise<void>
    onClose?: () => void
}

const { height } = Dimensions.get('window')
const CreateCard: React.FC<Props> = ({ onPress = async (_: any) => { }, onClose = () => { }, openToEdit = false }: Props) => {
    const ref = useRef<PagerView>(null);
    const [fetchCards] = useLazyQuery(CardApolloQueries.cards())
    const [fetchCard] = useLazyQuery(CardApolloQueries.card())
    const dispatch = useDispatch()
    const { card }: { card: CardType } = useSelector((state: any) => state.accountReducer)

    const [number, setNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvc, setCvc] = useState("")
    const [name, setName] = useState("")
    const [alias, setAlias] = useState("")
    const [focusedField, setFocusedField] = useState("")
    const [disabledButton, setDisabledButton] = useState(true)
    const [isValidCard, setIsValidCard] = useState(true)
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
            await dispatch(accountActions.setCards(data.cards))

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

            setIsLoading(false)
            setName("")
            setNumber("")
            setExpiry("")
            setCvc("")
            setAlias("")

            await onRefreshCards()
            onClose()

        } catch (error: any) {
            setErrorMessage(error.message)
            setIsLoading(false)
            ref.current?.setPage(1)
        }
    }

    const onCardChange = ({ values, status }: CreditCardFormData) => {
        setNumber(values.number.replaceAll(" ", ""))
        setExpiry(values.expiry)
        setCvc(values.cvc)
        setType(values.type)
        setIsValidCard(Boolean(status.cvc === "valid" && status.expiry === "valid" && status.number === "valid"))
    }

    const fetchDecryptedCard = async () => {
        try {
            const { data } = await fetchCard({
                variables: {
                    cardId: card.id
                }
            })

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

    const onPressPrimary = async () => {
        setAsPrimary(!asPrimary)
        setFocusedField("")
    }

    const StickyFooter: React.FC = () => {
        return (
            <HStack w={"100%"} px={"20px"} mt={"40px"} py={"10px"} bg={colors.darkGray} justifyContent={"space-between"}>
                <Button
                    w={"49%"}
                    bg={colors.mainGreen}
                    color={colors.white}
                    title={"Atras"}
                    onPress={onClose}
                />
                <Button
                    w={"49%"}
                    spin={isLoading}
                    opacity={disabledButton ? 0.5 : 1}
                    disabled={disabledButton}
                    bg={disabledButton ? "lightGray" : "mainGreen"}
                    color={disabledButton ? colors.mainGreen : colors.white}
                    title={"Confirmar"}
                    onPress={handleOnPress}
                />
            </HStack>
        )
    }

    useEffect(() => {
        setDisabledButton(!Boolean(name && alias && isValidCard))

    }, [alias, name, isValidCard])


    useEffect(() => {
        if (openToEdit)
            fetchDecryptedCard()

    }, [openToEdit])

    return (
        <PagerView style={{ flex: 0.95 }} initialPage={0} ref={ref}>
            <KeyboardAvoidingScrollView>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <VStack flex={1} p={"20px"}>
                        <HStack alignItems={"center"} bg={colors.lightGray} w={"100%"} py={scale(height * 0.015)} borderRadius={10}>
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
                        <VStack mt={"10px"} w={"100%"} bg={colors.lightGray} borderRadius={10} py={"10px"}>
                            <HStack px={"10px"} justifyContent={"space-between"}>
                                <Input bg={colors.darkGray} value={name} onFocus={() => setFocusedField("name")} h={scale(45)} placeholder='Nombre De La Tarjeta' onChangeText={(text) => setName(text)} />
                            </HStack>
                            <CreditCardInput placeholders={cardPlaceholders} onChange={onCardChange} onFocusField={(field: CreditCardFormField) => setFocusedField(field)} placeholderColor={colors.placeholderTextColor} style={{ width: "100%", borderRadius: 10, backgroundColor: colors.lightGray }} labelStyle={{ display: "none" }} inputStyle={{ color: colors.white, fontSize: scale(14), paddingHorizontal: 10, borderRadius: 10, borderBottomColor: colors.darkGray, height: scale(45), backgroundColor: colors.darkGray }} />
                            <HStack px={"10px"} justifyContent={"space-between"}>
                                <Input bg={colors.darkGray} value={alias} onFocus={() => setFocusedField("alias")} h={scale(45)} placeholder='Nombre Del Banco' onChangeText={(text) => setAlias(text)} />
                            </HStack>
                        </VStack>
                        <HStack alignItems={"center"} w={"100%"} mt={"20px"}>
                            <Pressable onPress={onPressPrimary}>
                                <MaterialIcons style={{ marginTop: 3 }} name={asPrimary ? "check-box" : "check-box-outline-blank"} size={28} color={colors.mainGreen} />
                            </Pressable>
                            <Text mx={"5px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"100%"} color={"white"}>
                                Agregue tarjeta como principal.
                            </Text>
                        </HStack>
                        <StickyFooter />
                    </VStack>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingScrollView>
            <VStack key={"error-CreditCardView-1"}>
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

export default CreateCard