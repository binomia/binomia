import React, { useState } from 'react'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, Stack } from 'native-base'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { Dimensions, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet from '../global/BottomSheet'
import * as Constants from "expo-constants"
import AntDesign from '@expo/vector-icons/AntDesign';
import moment from 'moment'
import { FORMAT_CURRENCY } from '@/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { deleteIcon, depositIcon, editIcon, withdrawIcon } from '@/assets'
import { globalActions } from '@/redux/slices/globalSlice'
import AddOrEditCard from './AddOrEditCard'


type Props = {
    open?: boolean
    onCloseFinish?: () => void
}


const { height } = Dimensions.get('window')

const CardModification: React.FC<Props> = ({ open = false, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch()
    const { card } = useSelector((state: any) => state.globalReducer)
    const [showEditCard, setShowEditCard] = useState<boolean>(false)


    const handleMakeTransaction = async (title: string) => {

    }

    const onClose = async () => {
        await dispatch(globalActions.setCard({}))
        onCloseFinish()
        setShowEditCard(false)
    }


    const onEditCard = () => {
        // onCloseFinish()
        setShowEditCard(true)
    }


    return (
        <BottomSheet openTime={300} height={height * 0.4} onCloseFinish={onClose} open={open}>
            {showEditCard ? <AddOrEditCard open={true} onCloseFinish={() => setShowEditCard(false)} /> :
                <VStack variant={"body"} h={"100%"}>
                    <Pressable w={"100%"} _pressed={{ opacity: 0.5 }} flexDirection={"row"} px={"15px"} py={"10px"} borderRadius={10} mt={"15px"} mr={"10px"} alignItems={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={{ uri: card?.logo }} />
                        <VStack ml={"10px"}>
                            <Heading fontSize={scale(15)} color={colors.white}>{card?.brand} {card?.last4Digits}</Heading>
                            <Text fontSize={scale(15)} color={colors.pureGray}>{card?.bankName}</Text>
                        </VStack>
                    </Pressable>
                    <HStack borderRadius={10} w={"100%"} mt={"20px"} space={2} justifyContent={"space-between"}>
                        <Pressable onPress={() => handleMakeTransaction("Deposito")} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(120)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                            <Image alt='logo-image' resizeMode='contain' w={scale(30)} h={scale(30)} source={deleteIcon} />
                            <Heading mt={"5px"} fontWeight={"600"} fontSize={scale(14)} color={colors.red}>Eliminar</Heading>
                        </Pressable>
                        <Pressable onPress={() => onEditCard()} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(120)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                            <Image alt='logo-image' resizeMode='contain' w={scale(30)} h={scale(30)} source={editIcon} />
                            <Heading fontSize={scale(14)} mt={"5px"} color={colors.mainGreen}>Editar</Heading>
                        </Pressable>
                    </HStack>
                </VStack>
            }
        </BottomSheet>
    )
}

export default CardModification