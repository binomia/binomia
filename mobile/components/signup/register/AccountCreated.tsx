import { VStack, Heading, Text, HStack, Image } from 'native-base';
import { Dimensions } from 'react-native';
import Button from '@/components/global/Button';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { welcomeSignup } from '@/assets';
import * as Updates from 'expo-updates';



const { width } = Dimensions.get("window");
const AccountCreated: React.FC = (): JSX.Element => {
    const onPress = async () => {
        await Updates.reloadAsync();
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
