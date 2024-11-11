import React, { useCallback, useState } from 'react'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, Stack, ScrollView } from 'native-base'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { Dimensions, RefreshControl, SafeAreaView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import { globalActions } from '@/redux/slices/globalSlice'
import { useDispatch, useSelector } from 'react-redux'
import { FlagsList } from 'aws-sdk/clients/guardduty'
import AntDesign from '@expo/vector-icons/AntDesign';
import { CardType } from '@/types'
import { mastercardLogo, noCard, visaLogo } from '@/assets'
import CardModification from '@/components/cards/CardModification'
import Button from '@/components/global/Button'
import { router } from 'expo-router'
import AddOrEditCard from '@/components/cards/AddOrEditCard'
import BottomSheet from '@/components/global/BottomSheet'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CardApolloQueries } from '@/apollo/query/cardQuery'
import { CardAuthSchema } from '@/auth/cardAuth'

type Props = {
    open?: boolean
    justSelecting?: boolean
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')

const Cards: React.FC<Props> = ({ open = false, onCloseFinish = () => { }, justSelecting = false }) => {
    const [createCard] = useMutation(CardApolloQueries.createCard())
    const [fetchCards] = useLazyQuery(CardApolloQueries.cards())
    const ref = React.useRef<FlagsList>(null);
    const dispatch = useDispatch()
    const [showCardModification, setShowCardModification] = useState<boolean>(false)
    const [refreshing, setRefreshing] = useState(false);
    const [showAddCard, setShowAddCard] = useState<boolean>(false)
    const { cards }: { cards: CardType[] } = useSelector((state: any) => state.globalReducer)

    const onPressCard = async (card: any) => {
        await dispatch(globalActions.setCard(card))

        // if (justSelecting) {
        //     onCloseFinish()
        // } else {
        // }
        setShowCardModification(true)
    }

    const renderCardLogo = (brand: string) => {
        switch (brand) {
            case "visa":
                return <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={visaLogo} />

            case "mastercard":
                return <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={mastercardLogo} />

            default:
                return null
        }
    }

    const onCreateCard = async (cardData: any) => {
        try {
            const validatedCardData = await CardAuthSchema.createCard.parseAsync(cardData)            
            const { data } = await createCard({ variables: { data: validatedCardData } })

            await dispatch(globalActions.setCards([...cards, data.createCard]))
            setShowAddCard(false)

        } catch (error) {
            console.log({
                onCreateCard: error
            });
            throw error
        }
    }

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);

            const { data } = await fetchCards()
            await dispatch(globalActions.setCards(data.cards))

        } catch (error) {
            console.log({
                onRefreshCards: error
            });
        }

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);

    }, []);


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <HStack alignItems={"center"} justifyContent={"space-between"}>
                <Pressable w={"50px"} alignItems={"flex-start"} px={"5px"} _pressed={{ opacity: 0.5 }} onPress={() => router.back()}>
                    <Ionicons name="chevron-back-outline" size={30} color="white" />
                </Pressable>
                <Stack>
                    <Heading size={"sm"} color={colors.white} textAlign={"center"}>Tarjetas</Heading>
                </Stack>
                <Pressable _pressed={{ opacity: 0.5 }} w={"50px"} alignItems={"center"} onPress={() => setShowAddCard(true)}>
                    <AntDesign name="pluscircle" size={25} color="white" />
                </Pressable>
            </HStack>
            <VStack variant={"body"} justifyContent={"space-between"}>
                {cards.length > 0 ? (
                    <ScrollView mt={"50px"} flex={1} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                        <HStack justifyContent={"space-between"} alignItems={"center"}>
                            <Heading size={"xl"} color={colors.white}>Tarjetas</Heading>
                        </HStack>
                        <FlatList
                            ref={ref}
                            mt={"10px"}
                            data={cards}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            renderItem={({ item, index }) => (
                                <Pressable onPress={() => onPressCard(item)} w={"100%"} key={`card-${index}-${item.last4Number}`} _pressed={{ opacity: 0.5 }} flexDirection={"row"} p={"15px"} borderRadius={10} bg={colors.lightGray} mt={"15px"} mr={"10px"} alignItems={"center"}>
                                    {renderCardLogo(item.brand)}
                                    <VStack ml={"10px"}>
                                        <Heading textTransform={"capitalize"} fontSize={scale(15)} color={colors.white}>{item.brand} {item.last4Number}</Heading>
                                        <Text textTransform={"capitalize"} fontSize={scale(15)} color={colors.pureGray}>{item.alias}</Text>
                                    </VStack>
                                </Pressable>
                            )}
                        />
                    </ScrollView>
                ) : (
                    <VStack variant={"body"} py={"30px"} px={"10px"} justifyContent={"space-between"}>
                        <ScrollView mt={"50px"} flex={1} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                            <VStack mt={"10px"}>
                                <Image alt='logo-image' h={height / 3} resizeMode='contain' w={"100%"} source={noCard} />
                                <Heading fontSize={scale(20)} color={colors.white} textAlign={"center"}>No Tienes Tarjetas Agregadas</Heading>
                                <Text textAlign={"center"} fontSize={scale(15)} color={colors.pureGray}>Necesitas mínimo una tarjeta para realizar transacciones</Text>
                            </VStack>
                        </ScrollView>
                        <HStack h={"55px"} w={"100%"} justifyContent={"center"}>
                            <Button w={"80%"} onPress={() => setShowAddCard(true)} title="Añadir Tarjeta" bg={colors.mainGreen} />
                        </HStack>
                    </VStack>
                )}
            </VStack>
            <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
            <BottomSheet open={showAddCard} height={height * 0.9}>
                <AddOrEditCard open={showCardModification} onPress={onCreateCard} />
            </BottomSheet>
        </SafeAreaView>
    )
}

export default Cards