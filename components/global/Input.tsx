import React from 'react'
import { FormControl, HStack, IInputProps, Input } from 'native-base'
import Feather from '@expo/vector-icons/Feather';
import colors from '@/colors';

interface Props extends IInputProps {
    onChangeText: (value: string) => void
    placeholder: string
    rightElement?: JSX.Element
    leftElement?: JSX.Element
    secureTextEntry?: boolean
    isInvalid?: boolean
    errorMessage?: string
}


const InputComponent: React.FC<Props> = (props) => {
    const { errorMessage, isInvalid = false, fontSize = "14px" } = props

    return (
        <HStack mb={isInvalid ? "10px" : "0px"}>
            <FormControl isInvalid={isInvalid} >
                <Input
                    {...props}
                    variant={"input"}
                    fontSize={fontSize}
                    _focus={{ selectionColor: "white" }}
                    fontWeight={"medium"}
                    color={"white"}
                    placeholderTextColor={"rgba(255,255,255,0.2)"}
                />
                <FormControl.ErrorMessage
                    leftIcon={
                        <Feather name="alert-circle" size={24} color={colors.alert} />
                    }>
                    {errorMessage}
                </FormControl.ErrorMessage>
            </FormControl>
        </HStack>
    )
}

export default InputComponent
