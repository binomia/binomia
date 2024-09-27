import { useContext, useState } from 'react';
import { VStack, Heading, Text, HStack, Image } from 'native-base';
import { Dimensions } from 'react-native';
import Button from '@/components/global/Button';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { GlobalContextType, SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts';
import { welcomeSignup, pendingVerification } from '@/assets';
import { GlobalContext } from '@/contexts/globalContext';
import { registerActions } from '@/redux/slices/registerSlice';
import { useDispatch, useSelector } from 'react-redux';

type Props = {

}


const { width, height } = Dimensions.get("window");
const AccountCreated: React.FC<Props> = ({ }): JSX.Element => {
    const state = useSelector((state: any) => state)
    const { } = useContext<GlobalContextType>(GlobalContext);
    const { setVerificationCode, setVerificationData } = useContext<SessionPropsType>(SessionContext);
    const [loading, setLoading] = useState(false);

    const onPress = () => {
        // setLoading(true)
        console.log(JSON.stringify(state, null, 2));
    }


    return (
        <VStack px={"20px"} flex={1} justifyContent={"space-between"} pb={"30px"}>
            <VStack h={"80%"}>
                <VStack h={"20%"}>
                    <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} mb={"5px"} mt={"30px"} color={"white"}>Bienvenido</Heading>
                    <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>
                        ¡Bienvenido! Ahora puedes empezar a gestionar tu dinero de forma segura y rápida.
                    </Text>
                </VStack>
                <HStack w={"100%"} h={"80%"} alignItems={"center"} justifyContent={"center"}>
                    <Image w={width} resizeMode="contain" source={welcomeSignup} alt="welcome-screen-image-account" />
                </HStack>
            </VStack>

            <HStack px={"20px"} w={"100%"} alignItems={"flex-end"}>
                <Button
                    spin={loading}
                    bg={"mainGreen"}
                    color={"white"}
                    w={"100%"}
                    onPress={onPress}
                    title={"Continuar"}
                />
            </HStack>
        </VStack>
    );
}


export default AccountCreated
