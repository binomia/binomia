import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VStack, Image } from 'native-base';
import colors from '../colors';
import SignUpScreen from '../screens/SignUpScreen';
import { logo } from '../assets';
import { NavigationContainer } from '@react-navigation/native';
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

    const headerStyles = {
        headerBackTitle: '',
        headerTitleStyle: { color: colors.white },
        headerStyle: {
            backgroundColor: colors.primaryBlack,
            headerShadowVisible: false
        }
    }


    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='SignUpScreen' >
                <Stack.Screen name='SignUpScreen' options={{ headerLeft, headerRight, title: '', ...headerStyles, headerShadowVisible: false }} component={SignUpScreen} />
            </Stack.Navigator >
        </NavigationContainer>
    )
}


export default SignUpStack

