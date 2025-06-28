import React from 'react'
import colors from '@/colors'
import BottomSheet from '@/components/global/BottomSheet';
import * as Sharing from 'expo-sharing';
import { Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, ZStack } from 'native-base'
import { FORMAT_CREATED_DATE, FORMAT_CURRENCY, FORMAT_PHONE_NUMBER } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { cancelIcon, checked, pendingClock, waiting } from '@/assets';
import { TEXT_HEADING_FONT_SIZE } from '@/constants';
import { transactionStatus } from '@/mocks';
import { Entypo } from '@expo/vector-icons';

type Props = {
    topup: any
    open: boolean
    onClose: (_: boolean) => void
}

const { height } = Dimensions.get('window')
const SingleTopTup: React.FC<Props> = ({ topup, open, onClose }: Props) => {
    const onCloseFinish = async () => {
        onClose(false)
    }

    const StatuIcon: React.FC<{ status: string }> = ({ status }: { status: string }) => {
        const _w = "35px"
        const _h = "35px"
        if (status === "completed") {
            return (
                <ZStack w={_w} h={_h} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
                    <HStack w={"80%"} h={"80%"} bg={colors.mainGreen} borderRadius={100} />
                    <Image borderRadius={100} tintColor={colors.lightGray} alt='logo-image1' w={"100%"} h={"100%"} source={checked} />
                </ZStack>
            )
        } else if (status === "cancelled") {
            return (
                <ZStack w={_w} h={_h} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
                    <HStack w={"80%"} h={"80%"} bg={colors.white} borderRadius={100} />
                    <Image borderRadius={100} alt='logo-image2' w={"100%"} h={"100%"} source={cancelIcon} />
                </ZStack>
            )

        } else if (status === "pending" || status === "waiting") {
            return (
                <ZStack w={"50px"} h={"50px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
                    <HStack w={"100%"} h={"100%"} bg={colors.lightGray} borderRadius={100} />
                    <Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={waiting} />
                </ZStack>
            )
        } else if (status === "requested") {
            return (
                <ZStack w={_w} h={_h} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
                    <HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100} />
                    <Image borderRadius={100} alt='logo-image4' w={"100%"} h={"100%"} source={pendingClock} />
                </ZStack>
            )
        }
    }

    const handleShare = async () => {
        const isAvailableAsync = await Sharing.isAvailableAsync()
        if (!isAvailableAsync) return

        await Sharing.shareAsync("http://test.com")
    }

    return (
        <BottomSheet height={height * 0.50} open={open} onCloseFinish={onCloseFinish}>
            <VStack px={"20px"} pt={"30px"} w={"100%"} h={"80%"}>
                <HStack alignItems={"center"} justifyContent={"space-between"}>
                    <HStack>
                        <Image borderRadius={"100px"} w={"55px"} h={"55px"} alt={"top-images"} resizeMode='contain' source={{ uri: topup.company?.logo }} />
                        <VStack ml={"10px"} justifyContent={"center"}>
                            <Heading fontSize={scale(16)} color={colors.pureGray} textTransform={"capitalize"}>{topup.phone?.fullName}</Heading>
                            <Text fontWeight={"semibold"} fontSize={scale(12)} color={colors.pureGray}>{FORMAT_PHONE_NUMBER(topup.phone?.phone || "")}</Text>
                        </VStack>
                    </HStack>
                    <Pressable onPress={handleShare} _pressed={{ opacity: 0.5 }} w={scale(35)} h={scale(35)} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
                        <Entypo name="share" size={24} color={colors.mainGreen} />
                    </Pressable>
                </HStack>
                <VStack alignItems={"center"} justifyContent={"space-between"} h={"90%"} mt={"30px"} borderRadius={10} p={"20px"}>
                    <VStack alignItems={"center"} >
                        <Heading textTransform={"capitalize"} fontSize={scale(TEXT_HEADING_FONT_SIZE)} color={colors.red}>{FORMAT_CURRENCY(topup?.amount)}</Heading>
                        <Text mb={"10px"} color={colors.lightSkyGray}>{FORMAT_CREATED_DATE(topup?.createdAt)}</Text>
                    </VStack>
                    <VStack mb={"20px"} ml={"10px"} alignItems={"center"} justifyContent={"center"}>
                        <StatuIcon status={topup.status} />
                        <Text ml={"3px"} textAlign={"center"} fontSize={scale(16)} color={colors.lightSkyGray}>{transactionStatus(topup.status)}</Text>
                    </VStack>
                </VStack>
            </VStack>
        </BottomSheet>
    )
}

export default SingleTopTup
