import React, { useRef, useState } from 'react'
import { VStack, Text, HStack, Heading, Image, Pressable } from 'native-base'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { Dimensions } from 'react-native'
import BottomSheet from '../global/BottomSheet'
import { useDispatch, useSelector } from 'react-redux'
import { deleteIcon, editIcon, mastercardLogo, visaLogo } from '@/assets'
import { globalActions } from '@/redux/slices/globalSlice'
import AddOrEditCard from './AddOrEditCard'
import PagerView from 'react-native-pager-view'


type Props = {
    open?: boolean
    onCloseFinish?: () => void
}


const { height } = Dimensions.get('window')

const CardModification: React.FC<Props> = ({ open = false, onCloseFinish = () => { } }) => {
    const ref = useRef<PagerView>(null);
    const dispatch = useDispatch()
    const { card } = useSelector((state: any) => state.globalReducer)
    const [bottomSheetHeight, setBottomSheetHeight] = useState<number>(height * 0.42)
    const [errorMessage, setErrorMessage] = useState<string>("")

    const onClose = async () => {
        await dispatch(globalActions.setCard({}))
        onCloseFinish()
        setBottomSheetHeight(height * 0.4)
        ref.current?.setPage(0)
    }


    const onEditCard = () => {
        setBottomSheetHeight(height * 0.9)
        ref.current?.setPage(1)
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
        <BottomSheet openTime={300} height={bottomSheetHeight} onCloseFinish={onClose} open={open}>
            <PagerView ref={ref} initialPage={2} style={{ flex: 1 }}>
                <VStack key={"AddOrEditCard-2"} variant={"body"}>
                    <HStack w={"100%"} mt={"20px"} alignItems={"center"}>
                        {renderCardLogo(card?.brand)}
                        <VStack ml={"10px"}>
                            <Heading textTransform={"capitalize"} fontWeight={"600"} fontSize={scale(15)} color={colors.white}>{card?.brand} {card?.last4Number}</Heading>
                            <Text fontSize={scale(15)} color={colors.pureGray}>{card?.alias}</Text>
                        </VStack>
                    </HStack>
                    <HStack borderRadius={10} w={"100%"} mt={"20px"} space={2} justifyContent={"space-between"}>
                        <Pressable onPress={() => { }} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(125)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                            <Image alt='logo-image' resizeMode='contain' w={scale(30)} h={scale(30)} source={deleteIcon} />
                            <Heading mt={"5px"} fontWeight={"600"} fontSize={scale(14)} color={colors.red}>Eliminar</Heading>
                        </Pressable>
                        <Pressable onPress={() => onEditCard()} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(125)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                            <Image alt='logo-image' resizeMode='contain' w={scale(30)} h={scale(30)} source={editIcon} />
                            <Heading fontSize={scale(14)} mt={"5px"} color={colors.mainGreen}>Editar</Heading>
                        </Pressable>
                    </HStack>
                </VStack>
                <AddOrEditCard key={"AddOrEditCard-1"} open={true} onPress={async (card: any) => { }} />                
            </PagerView>
        </BottomSheet>
    )
}

export default CardModification