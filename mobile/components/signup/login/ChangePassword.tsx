import { useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack } from 'native-base';
import { SafeAreaView, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import colors from '@/colors';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Input from '@/components/global/Input';
import Button from '@/components/global/Button';


type Props = {
    nextPage: () => void
    prevPage: () => void
    cancelBottomSheet: () => void
}

const ChangePassword: React.FC<Props> = ({ nextPage, cancelBottomSheet }: Props): JSX.Element => {

    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);


    const onPress = async () => {
        try {
            setLoading(true)
            if (password === confirmPassword) {
                nextPage()
                setLoading(false)
            }

        } catch (error: any) {
            console.error(error);
            setLoading(false)
        }
    }



    useEffect(() => {
        setDisabledButton(true)

        if (password && confirmPassword && password === confirmPassword && password.length >= 6) {
            setDisabledButton(false)
        }

    }, [password, confirmPassword])


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack borderRadius={"10px"} w={"100%"} px={"20px"} variant={"body"} mt={"30px"} justifyContent={"space-between"} h={"100%"}>
                    <VStack alignItems={"center"}>
                        <VStack w={"100%"} mb={"50px"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 10}px`} mb={"5px"} color={"white"}>Cambiar Contraseña</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>No comparta tu contraseña con nadie. Tu contraseña debe ser de al menos 6 caracteres.</Text>
                        </VStack>
                        <Input
                            h={`${INPUT_HEIGHT}px`}
                            secureTextEntry={!showPassword}
                            onChangeText={(e) => setPassword(e)}
                            placeholder="Nueva Contraseña*"
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <HStack mr={"15px"}>
                                        <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "gray"} />
                                    </HStack>
                                </TouchableOpacity>
                            }
                        />
                        <Input
                            h={`${INPUT_HEIGHT}px`}
                            secureTextEntry={!showConfirmPassword}
                            onChangeText={(e) => setConfirmPassword(e)}
                            placeholder="Confirmar Contraseña*"
                            rightElement={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <HStack mr={"15px"}>
                                        <MaterialCommunityIcons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color={confirmPassword === password && confirmPassword ? colors.mainGreen : confirmPassword ? colors.alert : "gray"} />
                                    </HStack>
                                </TouchableOpacity>
                            }
                        />
                    </VStack>
                    <HStack justifyContent={"space-between"} w={"100%"} alignItems={"center"} mb={"40px"}>
                        <Button
                            bg={"lightGray"}
                            color={"alert"}
                            w={"48%"}
                            onPress={cancelBottomSheet}
                            title={"Cancelar"}
                        />
                        <Button
                            spin={loading}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            w={"48%"}
                            onPress={onPress}
                            title={"Cambiar"}
                        />
                    </HStack>
                </VStack>
            </TouchableWithoutFeedback>
        </SafeAreaView>

    );
}


export default ChangePassword
