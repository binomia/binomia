import { useContext, useRef, useState } from 'react';
import { VStack, Input, Heading, HStack, Text } from 'native-base';
import { StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import Button from '../global/Button';
import { SessionContext } from '../../contexts';
import { SessionPropsType } from '../../types';
import PagerView from 'react-native-pager-view';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
    isLogin: boolean
    setIsLogin: (value: boolean) => void
}

const RegisterComponent: React.FC<Props> = ({ isLogin, setIsLogin }): JSX.Element => {
    const ref = useRef<PagerView>(null);
    const { onLogin } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);




    return (
        <SafeAreaView>
            <VStack w={"100%"} px={"15px"} mt={"15%"} h={"90%"} >
                <PagerView ref={ref} style={styles.container} initialPage={0}>
                    <VStack key={"1"} bg={"darkGray"} w={"100%"} alignItems={"center"}>
                        <HStack w={"100%"} alignItems={"flex-start"}>
                            <Heading size={"xl"} mb={"10px"} color={"white"}>Crear Nueva Cuenta</Heading>
                        </HStack>
                        <HStack mt={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading size={"xs"}  color={"white"}>Correo*</Heading>
                        </HStack>
                        <Input
                            variant={"input"}
                            fontSize={"14px"}
                            _focus={{ selectionColor: "white" }}
                            color={"white"}
                            onChangeText={(e) => setEmail(e)}
                            placeholder="Ingrese Correo Electronico*"
                        />
                    </VStack>
                    <VStack key={"2"} bg={"darkGray"} w={"100%"} alignItems={"center"}>
                        <HStack w={"100%"} alignItems={"flex-start"}>
                            <Heading size={"lg"} mb={"10px"} color={"white"}>Crear Nueva Cuenta 2</Heading>
                        </HStack>
                        <Input
                            variant={"input"}
                            fontSize={"14px"}
                            _focus={{ selectionColor: "white" }}
                            color={"white"}
                            onChangeText={(e) => setPassword(e)}
                            placeholder="Correo Electronico*"
                        />
                    </VStack>
                </PagerView>
                <VStack mb={"25px"} alignItems={"center"}>
                    <Button style={{ mb: "10px" }} onPress={() => { }} title={"Siguiente"} />
                    <Text fontWeight={"medium"} color={"white"}>Ya tienes una cuenta?</Text>
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                        <Text fontSize={"16px"} fontWeight={"medium"} underline color={"mainGreen"}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                </VStack>
            </VStack>
        </SafeAreaView>
    );
}


export default RegisterComponent


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    page: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});