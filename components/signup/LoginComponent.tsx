import { useContext, useState } from 'react';
import { VStack, Heading, HStack, Text } from 'native-base';
import { SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SessionContext } from '@/contexts';
import { SessionPropsType } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Input, Button } from '@/components';
import colors from '@/colors';

const LoginComponent: React.FC = (): JSX.Element => {
    const { onLogin } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack w={"100%"} px={"20px"} variant={"body"} mt={"50px"} justifyContent={"space-between"} h={"100%"}>
                    <VStack alignItems={"center"}>
                        <VStack w={"100%"} mb={"50px"}>
                            <Heading size={"xl"} mb={"5px"} color={"white"}>Iniciar Sesión</Heading>
                            <Text w={"80%"} color={"white"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                        </VStack>
                        <Input
                            onChangeText={(e) => setEmail(e)}
                            placeholder="Correo Electronico*"
                        />
                        <Input
                            secureTextEntry={!showPassword}
                            onChangeText={(e) => setPassword(e)}
                            placeholder="Contraseña*"
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <HStack mr={"15px"}>
                                        <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={24} color={showPassword ? "white" : "gray"} />
                                    </HStack>
                                </TouchableOpacity>
                            }
                        />
                        <TouchableOpacity style={{ alignSelf: "flex-end" }}>
                            <Text underline alignSelf={"flex-end"} fontWeight={"medium"} mt={"10px"} textAlign={"right"} color={"white"}>Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>
                    </VStack>
                    <VStack alignItems={"center"} mb={"25px"}>
                        <Button style={{ mb: "10px" }} onPress={() => onLogin({ email, password })} title={"Iniciar Sesión"} />
                    </VStack>
                </VStack>
            </TouchableWithoutFeedback>
        </SafeAreaView>

    );
}


export default LoginComponent