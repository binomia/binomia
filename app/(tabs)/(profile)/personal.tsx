import React from 'react'
import colors from '@/colors'
import { Image, VStack, HStack, FlatList, Heading } from 'native-base'
import { addressIcon } from '@/assets'
import { useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { personalScreenData } from '@/mocks'


const PersonalScreen: React.FC = () => {
    const { user } = useSelector((state: any) => state.accountReducer)

    return (
        <VStack px={"20px"} variant={"body"} h={"100%"}>
            <VStack borderRadius={10} py={"10px"} w={"100%"} h={"auto"} mt={"30px"}>
                <FlatList
                    data={personalScreenData(user)}
                    scrollEnabled={false}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <HStack w={"100%"} h={scale(45)} alignItems={"center"}>
                            <Image alt='logo-image' borderRadius={100} resizeMode='contain' w={scale(35)} h={scale(35)} source={item.icon} />
                            <Heading ml={"10px"} fontSize={scale(15)} textTransform={index === 1 ? "lowercase" : "capitalize"} color={colors.white}>{item.name}</Heading>
                        </HStack>
                    )} />
            </VStack>
            <HStack borderRadius={10} py={"10px"} mt={"30px"}>
                <HStack w={"45px"} h={"45px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <Image alt='logo-image' resizeMode='contain' w={scale(35)} h={scale(35)} source={addressIcon} />
                </HStack>
                <VStack px={"15px"} width={"90%"} borderRadius={10}>
                    <HStack w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                        <Heading textTransform={"capitalize"} numberOfLines={3} fontSize={scale(15)} color={colors.white}>{user.address}</Heading>
                    </HStack>
                </VStack>
            </HStack>
        </VStack>
    )
}

export default PersonalScreen
