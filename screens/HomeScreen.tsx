import { StyleSheet, Dimensions, RefreshControl } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Heading, HStack, Image, Pressable, VStack, Text, ScrollView } from 'native-base';
import colors from '@/colors';
import Button from '@/components/global/Button';
import { bagIcon, bills, cars, house, phone, sendIcon } from '@/assets';

import { useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { AccountApolloQueries, UserApolloQueries } from '@/apollo/query';
import { UserAuthSchema } from '@/auth/userAuth';
import { z } from 'zod';
import { globalActions } from '@/redux/slices/globalSlice';
import { FORMAT_CURRENCY } from '@/helpers';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import QRScannerScreen from './QRScannerScreen';
import { SocketContext } from '@/contexts/socketContext';
import { SOCKET_EVENTS } from '@/constants';
import { accountActions } from '@/redux/slices/accountSlice';


const { width } = Dimensions.get('window');
const HomeScreen: React.FC = () => {
    const { account } = useSelector((state: any) => state.accountReducer)
    const dispatch = useDispatch()

    const navigation = useNavigation<any>();
    const [showBottomSheet, setShowBottomSheet] = useState(false)
    const [getAccount] = useLazyQuery(AccountApolloQueries.account());

    const [refreshing, setRefreshing] = useState(false);


    const onPress = async () => {
        
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            const data = await getAccount()
            await dispatch(accountActions.setAccount(data.data.account))
        } catch (error) {
            console.log(error);
        }

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    return (
        <VStack p={"20px"} w={width} bg={colors.darkGray} variant={"body"} flex={1} alignItems={"center"}>
            <ScrollView contentContainerStyle={{ flex: 1 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack w={"100%"} justifyContent={"center"} alignItems={"center"} borderRadius={"10px"}>
                    <VStack bg={colors.lightGray} p={"20px"} w={"100%"} justifyContent={"space-between"} borderRadius={"10px"} h={scale(160)}>
                        <VStack>
                            <Heading size={"lg"} color={"white"}>Balance</Heading>
                            <Heading fontSize={scale(28)} color={"white"}>{FORMAT_CURRENCY(account?.balance || 0)}</Heading>
                        </VStack>
                        <HStack w={"100%"} justifyContent={"space-between"} >
                            <Button
                                leftRender={<Image resizeMode='contain' alt='send-image-icon' w={"20px"} h={"20px"} source={sendIcon} />}
                                w={"49%"}
                                bg={"darkGray"}
                                mt={"20px"}
                                borderRadius={"10px"}
                                title="Enviar"
                                onPress={async () => navigation.navigate("SearchUserScreen")}
                            />
                            <Button
                                leftRender={<Image resizeMode='contain' alt='send-image-icon' w={"20px"} h={"20px"} source={bagIcon} />}
                                w={"49%"}
                                bg={"darkGray"}
                                mt={"20px"}
                                borderRadius={"10px"}
                                title="Depositar" onPress={() => navigation.navigate("BankingScreen")}
                            />
                        </HStack>
                    </VStack>
                </VStack>
                <VStack w={"100%"} pt={"30px"} px={"5px"}>
                    <Heading fontSize={scale(24)} color={"white"}>Servicios</Heading>
                    <HStack mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
                        <Pressable onPress={() => onPress()} _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
                            <Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={phone} />
                            <Text color={"white"}>Recargas</Text>
                        </Pressable>
                        <Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
                            <Image resizeMode='contain' alt='send-image-icon'w={scale(40)} h={scale(40)}source={cars} />
                            <Text color={"white"}>Seguros</Text>
                        </Pressable>
                    </HStack>
                    <HStack mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
                        <Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
                            <Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={house} />
                            <Text color={"white"}>Electricidad</Text>
                        </Pressable>
                        <Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
                            <Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={bills} />
                            <Text color={"white"}>Facturas</Text>
                        </Pressable>
                    </HStack>
                </VStack>
                <QRScannerScreen defaultPage={1} open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
            </ScrollView>
        </VStack>
    )
}

export default HomeScreen
