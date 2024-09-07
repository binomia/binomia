import { StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { LoginComponent, RegisterComponent } from '@/components'
import { VStack } from 'native-base'

const SignUpScreen: React.FC = (): JSX.Element => {
    const [isLogin, setIsLogin] = useState<boolean>(true)
    return (
        isLogin ?
            <VStack variant={"body"} justifyContent={"space-between"} alignItems={"center"}>
                <LoginComponent isLogin={isLogin} setIsLogin={setIsLogin} />
            </VStack>
            :
            <VStack variant={"body"} justifyContent={"space-between"}>
                <RegisterComponent isLogin={isLogin} setIsLogin={setIsLogin} />
            </VStack>
    )
}

export default SignUpScreen

const styles = StyleSheet.create({})