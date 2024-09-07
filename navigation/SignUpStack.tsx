import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VStack, Image, Text } from 'native-base';
import colors from '@/colors';
import { SignUpScreen, WelcomeScreen } from '@/screens';
import { logo } from '@/assets';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

const SignUpStack: React.FC = () => {
    const Stack = createNativeStackNavigator<any>();

    const headerLeft = () => {
        return (
            <VStack >
                <Image w={"115px"} h={"30px"} source={logo} />
            </VStack>
        )
    }

    const headerRight = () => {

        return (

            <TouchableOpacity>
                <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
        )
    }

    const welcomeReaderRight = () => {

        return (
            <TouchableOpacity>
                <Text fontWeight={"bold"} color={"mainGreen"}>Iniciar Sesión</Text>
            </TouchableOpacity>
        )
    }

    const headerStyles = {
        headerBackTitle: '',
        headerTitleStyle: { color: colors.white },
        headerStyle: {
            backgroundColor: colors.primaryBlack,
            headerShadowVisible: false
        }
    }


    return (
        <Stack.Navigator initialRouteName='WelcomeScreen' >
            <Stack.Screen name='WelcomeScreen' options={{ headerLeft, headerRight: welcomeReaderRight, title: '', ...headerStyles, headerShadowVisible: false }} component={WelcomeScreen} />
            <Stack.Screen name='SignUpScreen' options={{ headerLeft, headerRight, title: '', ...headerStyles, headerShadowVisible: false }} component={SignUpScreen} />
        </Stack.Navigator >
    )
}


export default SignUpStack

