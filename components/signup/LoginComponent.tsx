import { useContext, useState } from 'react';
import { VStack, Input, Heading, HStack, Text, Pressable } from 'native-base';
import { SafeAreaView } from 'react-native';
import GlobalButton from '../global/Button';
import { SessionContext } from '../../contexts';
import { SessionPropsType } from '../../types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const LoginComponent: React.FC = (): JSX.Element => {
    const { onLogin } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);




    return (
        <SafeAreaView>
            <VStack variant={"body"} mt={"30%"}  >
                <VStack alignItems={"center"}>
                    <Heading size={"xl"} mb={"20px"} color={"white"}>Iniciar Sesion</Heading>
                    <Input
                        variant={"input"}
                        fontSize={"14px"}
                        _focus={{ selectionColor: "white" }}
                        color={"white"}
                        onChangeText={(e) => setEmail(e)}
                        placeholder="Correo Electronico*"
                    />
                    <Input
                        variant={"input"}
                        fontSize={"14px"}
                        _focus={{ selectionColor: "white" }}
                        color={"white"}
                        secureTextEntry={!showPassword}
                        onChangeText={(e) => setPassword(e)}
                        placeholder="Contraseña*"
                        rightElement={
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <HStack mr={"15px"}>
                                    <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={24} color={showPassword ? "white" : "gray"} />
                                </HStack>
                            </Pressable>
                        }
                    />
                    <Pressable mb={"20px"} alignSelf={"flex-end"}>
                        <Text fontWeight={"medium"} mt={"10px"} textAlign={"right"} color={"white"}>Olvidaste tu contraseña?</Text>
                    </Pressable>
                    <GlobalButton onPress={() => onLogin({ email, password })} contsinerStyles={{ mt: "35px" }} title={"Iniciar Sesion"} />
                    <VStack alignItems={"center"} mt={"50px"}>
                        <Text fontWeight={"medium"} color={"white"}>No tienes una cuenta?</Text>
                        <Pressable>
                            <Heading size={"sm"} color={"mainGreen"}>Registrate</Heading>
                        </Pressable>
                    </VStack>
                </VStack>
            </VStack>
        </SafeAreaView>

    );
}


export default LoginComponent