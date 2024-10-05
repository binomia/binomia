import { StyleSheet, Dimensions, View, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts/sessionContext';
import { Heading, HStack, Image, Pressable, VStack, Text, Stack } from 'native-base';
import colors from '@/colors';
import Button from '@/components/global/Button';
import { bills, cars, house, phoneIcon, receiveIcon, sendIcon } from '@/assets';
import Feather from '@expo/vector-icons/Feather';
import { gql, useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { UserApolloQueries } from '@/apollo/query';
import Entypo from '@expo/vector-icons/Entypo';
import Carousel from 'react-native-reanimated-carousel';
import { UserAuthSchema } from '@/auth/userAuth';
import { z } from 'zod';
import { globalActions } from '@/redux/slices/globalSlice';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FORMAT_CURRENCY } from '@/helpers';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';




const { width } = Dimensions.get('window');
const HomeScreen: React.FC = () => {
    const dispatch = useDispatch()
    const navigation = useNavigation<any>();
    const state = useSelector((state: any) => state.globalReducer)
    const { onLogout } = useContext<SessionPropsType>(SessionContext);
    const [getUser] = useLazyQuery(UserApolloQueries.user());
    const [getSessionUser] = useLazyQuery(UserApolloQueries.sessionUser());

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
    const [account, setAccount] = useState<z.infer<typeof UserAuthSchema.accountsData>>()


    const fetchUser = async () => {
        try {
            const user = await getSessionUser()

            const userProfileData = await UserAuthSchema.userProfileData.parseAsync(user.data.sessionUser)
            const kycData = await UserAuthSchema.kycData.parseAsync(user.data.sessionUser.kyc)
            const accountsData = await UserAuthSchema.accountsData.parseAsync(user.data.sessionUser.account)

            setAccount(accountsData)
            await dispatch(globalActions.setSession({
                accounts: accountsData,
                user: userProfileData,
                kyc: kycData
            }))

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])



    return (
        <VStack p={"20px"} w={width} bg={colors.darkGray} variant={"body"} flex={1} alignItems={"center"}>
            <VStack w={"100%"} justifyContent={"center"} alignItems={"center"} borderRadius={"10px"}>
                <VStack bg={colors.lightGray} p={"20px"} w={"100%"} justifyContent={"space-between"} borderRadius={"10px"} h={"200px"}>
                    <VStack>
                        <Heading size={"lg"} color={"white"}>Balance</Heading>
                        <Heading fontSize={`${scale(28)}px`} color={"white"}>{FORMAT_CURRENCY(account?.balance || 0)}</Heading>
                    </VStack>
                    <HStack w={"100%"} justifyContent={"space-between"} >
                        <Button
                            leftRender={<Image resizeMode='contain' alt='send-image-icon' w={"20px"} h={"20px"} source={sendIcon} />}
                            w={"49%"} bg={"darkGray"}
                            mt={"20px"}
                            borderRadius={"10px"}
                            title="Enviar"
                            onPress={async () => navigation.navigate("SearchUserScreen")}
                        />
                        <Button
                            leftRender={<Image resizeMode='contain' alt='send-image-icon' w={"20px"} h={"20px"} source={receiveIcon} />}
                            w={"49%"} bg={"darkGray"}
                            mt={"20px"}
                            borderRadius={"10px"}
                            title="Recibir" onPress={() => onLogout()}
                        />
                    </HStack>
                </VStack>
            </VStack>

            <VStack w={"100%"} pt={"30px"} px={"5px"}>
                <Heading size={"xl"} color={"white"}>Servicios</Heading>
                <HStack mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
                    <Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={"150px"} justifyContent={"center"} alignItems={"center"}>
                        <Image resizeMode='contain' alt='send-image-icon' w={"50px"} h={"50px"} source={phoneIcon} />
                        <Text color={"white"}>Recargas</Text>
                    </Pressable>
                    <Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={"150px"} justifyContent={"center"} alignItems={"center"}>
                        <Image resizeMode='contain' alt='send-image-icon' w={"50px"} h={"50px"} source={cars} />
                        <Text color={"white"}>Seguros</Text>
                    </Pressable>
                </HStack>
                <HStack mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
                    <Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={"150px"} justifyContent={"center"} alignItems={"center"}>
                        <Image resizeMode='contain' alt='send-image-icon' w={"50px"} h={"50px"} source={house} />
                        <Text color={"white"}>Electricidad</Text>
                    </Pressable>
                    <Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={"150px"} justifyContent={"center"} alignItems={"center"}>
                        <Image resizeMode='contain' alt='send-image-icon' w={"50px"} h={"50px"} source={bills} />
                        <Text color={"white"}>Facturas</Text>
                    </Pressable>
                </HStack>
            </VStack>
        </VStack>
    )
}

export default HomeScreen

const styles = StyleSheet.create({})