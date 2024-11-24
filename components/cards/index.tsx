import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet from '../global/BottomSheet'
import CardModification from './CardModification'
import AntDesign from '@expo/vector-icons/AntDesign';
import Button from '../global/Button'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, Stack } from 'native-base'
import { scale } from 'react-native-size-matters'
import { Dimensions, SafeAreaView, TouchableOpacity } from 'react-native'
import { globalActions } from '@/redux/slices/globalSlice'
import { useDispatch, useSelector } from 'react-redux'
import { FlagsList } from 'aws-sdk/clients/guardduty'
import { CardType } from '@/types'
import { mastercardLogo, noCard, visaLogo } from '@/assets'

type Props = {
    open?: boolean
    justSelecting?: boolean
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')

const Cards: React.FC<Props> = ({ open = false, onCloseFinish = () => { }, justSelecting = false }) => {
    const ref = React.useRef<FlagsList>(null);
    const dispatch = useDispatch()
    const [showCardModification, setShowCardModification] = useState<boolean>(false)
    const { cards }: { cards: CardType[] } = useSelector((state: any) => state.globalReducer)

    const onPressCard = async (card: any) => {
        await dispatch(globalActions.setCard(card))

        if (justSelecting) {
            onCloseFinish()
        } else {
            setShowCardModification(true)
        }
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

    return (
        <BottomSheet openTime={300} height={height * 0.9} onCloseFinish={() => onCloseFinish()} open={open}>
            <SafeAreaView style={{ flex: 1 }}>
                <VStack variant={"body"} flex={1}>
                    <HStack justifyContent={"flex-end"}>                        
                        <Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} onPress={() => { }}>
                            <AntDesign name="pluscircle" size={scale(25)} color="white" />
                        </Pressable>
                    </HStack>
                    <VStack flex={0.95}>
                        <HStack justifyContent={"space-between"} alignItems={"center"}>
                            <Heading fontSize={scale(24)} color={colors.white}>Tarjetas</Heading>
                        </HStack>
                        {cards.length > 0 ? (
                            <FlatList
                                ref={ref}
                                mt={"10px"}
                                data={cards}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                                scrollEnabled={true}
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
                        ) : (
                            <VStack px={"10px"} flex={1}>
                                <Image alt='logo-image' resizeMode='contain' w={"100%"} h={"100%"} source={noCard} />
                                <Button onPress={() => { }} title="Añadir Tarjeta" bg={colors.mainGreen} />
                            </VStack>
                        )}

                    </VStack>
                    <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
                </VStack>

            </SafeAreaView>
        </BottomSheet>
    )
}

export default Cards