import { StyleSheet } from 'react-native'
import React, { useContext } from 'react'
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts/sessionContext';
import { Heading, HStack, Image, Pressable, VStack, Text } from 'native-base';
import colors from '@/colors';
import Button from '@/components/global/Button';
import { bills, cars, house, phoneIcon, receiveIcon, sendIcon } from '@/assets';
import Feather from '@expo/vector-icons/Feather';
import { gql, useLazyQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { UserApolloQueries } from '@/apollo/query';


const testQuery = gql`
    query Test{
        test
    }
`
const HomeScreen: React.FC = () => {
    const state = useSelector((state: any) => state.globalReducer)
    const { onLogout } = useContext<SessionPropsType>(SessionContext);
    const [getUser] = useLazyQuery(UserApolloQueries.user());



    return (
        <VStack bg={colors.darkGray} variant={"body"} flex={1}>
            {/* <Button onPress={onLogout} title="Logout" /> */}
            <VStack mt={"50px"} p={"20px"} bg={colors.lightGray} w={"100%"} justifyContent={"space-between"} borderRadius={"10px"} h={"200px"}>
                <VStack>
                    <Heading size={"lg"} color={"white"}>Balance</Heading>
                    <Heading size={"2xl"} color={"white"}>$2,345.67</Heading>
                </VStack>
                <HStack w={"100%"} justifyContent={"space-between"} >
                    <Button

                        leftRender={<Image resizeMode='contain' alt='send-image-icon' w={"20px"} h={"20px"} source={sendIcon} />}
                        w={"49%"} bg={"darkGray"}
                        mt={"20px"}
                        borderRadius={"10px"}
                        title="Enviar"
                        onPress={async () => {
                            const data = await getUser({

                                context: {
                                    headers: {
                                        "session-auth-identifier": state.applicationId,
                                        "authorization": `Bearer ${state.jwt}`,
                                    }
                                }
                            })
                            console.log(JSON.stringify(state, null, 2));
                        }}
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
            <VStack w={"100%"} h={"100%"} px={"5px"} pt={"30px"}>
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