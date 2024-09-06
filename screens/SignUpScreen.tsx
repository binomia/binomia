import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useContext, useEffect } from 'react';
import * as Application from 'expo-application';
import { SessionContext } from '../contexts';
import { VStack } from 'native-base';
import LoginComponent from '../components/signup/LoginComponent';




const SignUpScreen: React.FC = (): JSX.Element => {
    const { onLogin, jwt, onLogout }: any = useContext(SessionContext);

    useEffect(() => {
        (async () => {
            const status = await Application.getIosIdForVendorAsync();
            console.log({ status, jwt });
        })()
    }, [])


    return (
        <VStack variant={"body"} justifyContent={"center"} alignItems={"center"}>
            {jwt ?
                <Button title="Logout" onPress={onLogout} />
                :
                <LoginComponent />
            }
        </VStack>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});


export default SignUpScreen