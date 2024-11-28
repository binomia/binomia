import React from 'react'
import { Image, VStack, Text, HStack, Divider, FlatList } from 'native-base'
import { addressIcon } from '@/assets'
import { useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { personalScreenData } from '@/mocks'


const PersonalScreen: React.FC = () => {
    const { user } = useSelector((state: any) => state.globalReducer)

    return (
        <VStack  px={"20px"} variant={"body"} h={"100%"}>
            <VStack borderRadius={10} bg={"lightGray"} py={"10px"} w={"100%"} h={"auto"} mt={"50px"}>
                <FlatList
                    data={personalScreenData(user)}
                    scrollEnabled={false}                    
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <VStack  w={"100%"} h={"50px"} justifyContent={"center"}>
                            <HStack key={`personal${item.name}`} space={2} pl={"10px"} justifyContent={"space-between"} alignItems={"center"}>
                                <HStack bg={"gray"} w={scale(35)} h={scale(35)} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                    <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={item.icon} />
                                </HStack>
                                <HStack width={"90%"} h={"100%"} borderRadius={10} px={"10px"} justifyContent={"space-between"} >
                                    <HStack width={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                                        <Text textTransform={"capitalize"} fontSize={scale(15)} color={colors.white}>{item.name}</Text>
                                    </HStack>
                                </HStack>
                            </HStack>
                            <HStack w={"100%"} justifyContent={"flex-end"}>
                                {index !== 3 ? <Divider mt={"7px"} width={"80%"} h={"0.5px"} bg={colors.gray} /> : null}
                            </HStack>
                        </VStack>
                    )} />
            </VStack>
            <HStack borderRadius={10} bg={"lightGray"} space={2} pl={"10px"} py={"10px"} mt={"30px"}>
                <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={addressIcon} />
                </HStack>
                <VStack width={"90%"} borderRadius={10}>
                    <HStack pr={"10px"} w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                        <Text textTransform={"capitalize"} numberOfLines={3} fontSize={scale(15)} color={colors.white}>{user.address}</Text>
                    </HStack>
                </VStack>
            </HStack>
        </VStack>
    )
}

export default PersonalScreen
