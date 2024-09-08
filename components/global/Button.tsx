import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, HStack, StyledProps } from 'native-base';


interface Props extends StyledProps {
    title: string
    color?: string
    disabled?: boolean
    onPress?: () => void
}

const Button: React.FC<Props> = (props): JSX.Element => {
    const {color = "white", title, onPress = () => { }, disabled = false} = props
    
    return (
        <TouchableOpacity disabled={disabled} style={{ width: "100%" }} onPress={onPress}>
            <HStack  {...props} borderRadius={"25px"}  alignItems={"center"} justifyContent={"center"} h="55px">
                <Text width={"100%"} fontWeight={"bold"} fontSize={"16px"} textAlign={"center"} color={color}>{title}</Text>
            </HStack>
        </TouchableOpacity>
    )
}


export default Button