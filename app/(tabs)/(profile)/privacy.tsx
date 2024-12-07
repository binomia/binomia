import { StyleSheet, } from 'react-native'
import React, { useState } from 'react'
import { Image, VStack, Text, HStack, Divider, FlatList, Switch } from 'native-base'
import { faceIdIcon } from '@/assets'
import { useDispatch, useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { globalActions } from '@/redux/slices/globalSlice'
import { useMutation } from '@apollo/client'
import { AccountApolloQueries } from '@/apollo/query'
import { privacyScreenData } from '@/mocks'

const PrivacyScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { allowFaceId, account } = useSelector((state: any) => state.globalReducer)
    const [updateAccountPermissions] = useMutation(AccountApolloQueries.updateAccountPermissions())

    const onSwitchChange = async (id: string, allow: boolean) => {        
        try {
            if (id === "allowFaceId") {
                await dispatch(globalActions.setAllowFaceId(allow))

            } else {
                const { data } = await updateAccountPermissions({
                    variables: {
                        data: {
                            [id]: allow
                        }
                    }
                })

                await dispatch(globalActions.setAccount(data.updateAccountPermissions))
            }

        } catch (error) {
            console.error(error);
        }
    }

    

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack w={"100%"} h={"auto"} mt={"50px"}>
                <HStack bg={"lightGray"} w={"100%"} borderRadius={10} space={2} pl={"10px"} py={"8px"} mb={"30px"}>
                    <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"17px"} h={"17px"} source={faceIdIcon} />
                    </HStack>
                    <HStack flex={1} justifyContent={"space-between"} alignItems={"center"}>
                        <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                            <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{"Face ID"}</Text>
                        </HStack>
                        <Switch isChecked={allowFaceId} onChange={() => onSwitchChange("allowFaceId", !allowFaceId)} mr={"10px"} />
                    </HStack>
                </HStack>
                <FlatList
                    bg={"lightGray"}
                    borderRadius={10}
                    pb={"3px"}
                    data={privacyScreenData(account)}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <HStack key={`privacies-${index}-${item.name}`} bg={"lightGray"} w={"100%"} borderRadius={10} h={"50px"} py={"10px"} space={2} pl={"10px"} >
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' resizeMode='contain' tintColor={colors.white} w={"18px"} h={"18px"} source={item.icon} />
                            </HStack>
                            <VStack flex={1}>
                                <HStack justifyContent={"space-between"} alignItems={"center"}>
                                    <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                        <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{item.name}</Text>
                                    </HStack>
                                    <Switch isChecked={item.allow} onChange={(e) => onSwitchChange(item.id, !item.allow)} mr={"10px"} />
                                </HStack>
                                {index !== 4 ? <Divider mt={"7px"} width={"100%"} h={"0.5px"} bg={colors.gray} /> : null}
                            </VStack>
                        </HStack>
                    )} />
            </VStack>
        </VStack>
    )
}

export default PrivacyScreen


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