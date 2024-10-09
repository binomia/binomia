import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VStack, Image } from 'native-base';
import colors from '@/colors';
import { logo, qrIcon } from '@/assets';
import { TouchableOpacity, Dimensions } from 'react-native';
import QRScannerScreen from '@/screens/QRScannerScreen';
import { useState } from 'react';
import ProfileScreen from '@/screens/ProfileScreen';


const { width, height } = Dimensions.get('window')
const ProfileStack: React.FC = () => {
    const Stack = createNativeStackNavigator<any>();


    const headerLeft = () => {
        return (
            <VStack >
                <Image alt='logo-image' w={"115px"} h={"30px"} source={logo} />
            </VStack>
        )
    }

    const headerRight = () => {
        const [showBottomSheet, setShowBottomSheet] = useState(false)

        return (
            <VStack>
                <TouchableOpacity onPress={() => setShowBottomSheet(true)}>
                    <Image alt='logo-image' w={"25px"} h={"25px"} source={qrIcon} />
                </TouchableOpacity>
                <QRScannerScreen open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
            </VStack>
        )
    }


    const headerStyles = {
        headerTitleStyle: { color: colors.white },
        headerShadowVisible: false,
        headerStyle: {
            backgroundColor: colors.primaryBlack,
        }
    }


    return (
        <Stack.Navigator initialRouteName='ProfileScreen' screenOptions={{ headerTintColor: colors.white, headerStyle: {} }} >
            <Stack.Screen name='ProfileScreen' options={{ headerRight, title: '', ...headerStyles }} component={ProfileScreen} />
        </Stack.Navigator >
    )
}


export default ProfileStack

