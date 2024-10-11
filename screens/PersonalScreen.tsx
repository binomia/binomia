import { StyleSheet, } from 'react-native'
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
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} h={"auto"} mt={"50px"}>
                <FlatList
                    bg={"lightGray"}
                    data={personalScreenData(user)}
                    borderRadius={10}
                    pb={"5px"}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <HStack bg={"lightGray"} w={"100%"} borderRadius={10} h={"50px"} py={"10px"} space={2} pl={"10px"} >
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={item.icon} />
                            </HStack>
                            <VStack flex={1}>
                                <HStack justifyContent={"space-between"} alignItems={"center"}>
                                    <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                        <Text textTransform={index === 0 ? "capitalize" : "lowercase"} numberOfLines={3} fontSize={scale(15)} color={colors.white}>{item.name}</Text>
                                    </HStack>
                                </HStack>
                                {index !== 3 ? <Divider mt={"7px"} width={"100%"} h={"0.5px"} bg={colors.gray} /> : null}
                            </VStack>
                        </HStack>
                    )} />
                <HStack borderRadius={10} bg={"lightGray"} space={2} pl={"10px"} py={"8px"} mt={"30px"}>
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
        </VStack>
    )
}

export default PersonalScreen


const styles = StyleSheet.create({
    contentContainerStyle: {
        width: 55,
        height: 55,
        borderRadius: 100
    },
    textStyle: {
        fontSize: 30,
        color: 'white',
        marginBottom: 2,
        textTransform: 'capitalize',
        fontWeight: 'bold',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
})