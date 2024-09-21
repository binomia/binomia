import { useContext, useState } from 'react';
import { VStack, Heading, Text, HStack, Image, Stack } from 'native-base';
import { Dimensions } from 'react-native';
import Button from '@/components/global/Button';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts';
import { account, welcomeSignup } from '@/assets';
import AntDesign from '@expo/vector-icons/AntDesign';
import colors from '@/colors';

type Props = {

}


const { width, height } = Dimensions.get("window");
const AccountCreated: React.FC<Props> = ({ }): JSX.Element => {
    const { setVerificationCode, setVerificationData } = useContext<SessionPropsType>(SessionContext);
    const [loading, setLoading] = useState(false);


    const onPress = () => {
        setLoading(true)
    }


    return (
        <VStack px={"20px"} flex={1} justifyContent={"space-between"} pb={"30px"}>
            <VStack>
                <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} mb={"5px"} mt={"30px"} color={"white"}>Bienvenido</Heading>
                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>
                    ¡Bienvenido! Ahora puedes empezar a gestionar tu dinero de forma segura y rápida.
                </Text>
                <HStack h={"50%"} w={"100%"} alignItems={"center"} justifyContent={"center"} mt={"30px"}>
                    <Stack bg={"white"} borderRadius={100} >
                        <AntDesign name="checkcircle" size={50} color={colors.mainGreen} />
                    </Stack>
                    {/* <Image w={width} h={height / 3} resizeMode="cover" source={welcomeSignup} alt="welcome-screen-image-account" /> */}
                </HStack>
            </VStack>

            <HStack justifyContent={"space-between"} w={"100%"} alignItems={"center"} mb={"50px"}>
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
