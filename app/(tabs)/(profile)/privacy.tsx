import React from 'react'
import colors from '@/colors'
import { StyleSheet, } from 'react-native'
import { Image, VStack, Text, HStack, Divider, Switch, FlatList, Heading } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { globalActions } from '@/redux/slices/globalSlice'
import { useMutation } from '@apollo/client'
import { AccountApolloQueries } from '@/apollo/query'
import { privacyScreenData } from '@/mocks'
import { accountActions } from '@/redux/slices/accountSlice'

const PrivacyScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { account } = useSelector((state: any) => state.accountReducer)
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

                await dispatch(accountActions.setAccount(data.updateAccountPermissions))
            }

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} pb={"5px"} mt={"50px"}>
                <FlatList
                    data={privacyScreenData(account)}
                    scrollEnabled={false}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item: permit, index }) => (
                        <HStack justifyContent={"space-between"} key={`privacies-${index}-${permit.id}${permit.name}`} w={"100%"} borderRadius={10} h={scale(45)} py={"10px"} space={2} >
                            <HStack h={scale(35)}  justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' borderRadius={2000} resizeMode='contain' w={scale(35)} h={scale(35)} source={permit.icon} />
                                <Heading ml={"10px"} borderRadius={"100px"} fontSize={scale(15)} textTransform={"capitalize"} color={colors.white}>{permit.name}</Heading>
                            </HStack>
                            <Switch isChecked={permit.allow} onChange={(e) => onSwitchChange(permit.id, !permit.allow)} mr={"10px"} />
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