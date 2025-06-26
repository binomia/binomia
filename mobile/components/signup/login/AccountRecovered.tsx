import { useContext, useState } from 'react';
import { VStack, Heading, Text, HStack, Image } from 'native-base';
import { Dimensions } from 'react-native';
import Button from '@/components/global/Button';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts/sessionContext';
import { account } from '@/assets';


type Props = {
    cancelBottomSheet: () => void
}


const { width, height } = Dimensions.get("window");
const AccountRecovered: React.FC<Props> = ({ cancelBottomSheet }: Props): JSX.Element => {
    const { setVerificationCode, setVerificationData } = useContext<SessionPropsType>(SessionContext);
    const [loading, setLoading] = useState(false);


    const onPress = () => {
        setLoading(true)
        setVerificationCode("")
        setVerificationData({ token: "", signature: "", email: "" })
        cancelBottomSheet()
        setLoading(false)
    }


    return (
        <VStack px={"20px"} flex={1} justifyContent={"space-between"} pb={"30px"}>
            <VStack>
                <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} mb={"5px"} mt={"30px"} color={"white"}>Felicidades</Heading>
                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>
                    Ahora puedes iniciar sesión con tu correo electrónico y tu nueva contraseña.
                </Text>
                <HStack w={"100%"} justifyContent={"center"} mt={"30px"}>
                    <Image w={width} h={height / 3} resizeMode="cover" source={account} alt="welcome-screen-image-account" />
                </HStack>
            </VStack>

            <HStack justifyContent={"space-between"} w={"100%"} alignItems={"center"} mb={"50px"}>
                <Button
                    spin={loading}
                    bg={"mainGreen"}
                    color={"white"}
                    w={"100%"}
                    onPress={onPress}
                    title={"Iniciar Sesiónn"}
                />
            </HStack>
        </VStack>
    );
}


export default AccountRecovered
