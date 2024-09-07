import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

import LoginComponent from '../components/signup/LoginComponent'
import RegisterComponent from '../components/signup/RegisterComponent'
import { VStack } from 'native-base'

const SignUpContainer: React.FC = (): JSX.Element => {
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

export default SignUpContainer

const styles = StyleSheet.create({})