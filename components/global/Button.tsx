import { Dimensions } from 'react-native'
import React from 'react'
import { Text, HStack, Button, StyledProps } from 'native-base';


type Props = {
    buttonStyles?: StyledProps
    contsinerStyles?: StyledProps
    textStyles?: StyledProps
    title: string
    onPress?: () => void
}

const { width } = Dimensions.get("screen");
const GlobalButton: React.FC<Props> = ({ title, onPress = () => { }, textStyles = { fontWeight: "bold", fontSize: "16px" }, buttonStyles = {}, contsinerStyles = {} }): JSX.Element => {
    return (
        <HStack {...contsinerStyles} h="55px" width={"100%"}>
            <Button mt={"5px"} {...buttonStyles} onPress={onPress} color={"amber.300"} variant={"button"} width={"100%"}>
                <Text {...textStyles} color={"white"}>{title}</Text>
            </Button>
        </HStack>
    )
}


export default GlobalButton