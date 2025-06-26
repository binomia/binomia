import React from 'react'
import { FormControl, HStack, IInputProps, Input, Text } from 'native-base'
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
    bColor?: string
    searchValue?: string
}


const InputComponent: React.FC<Props> = (props) => {
    const { errorMessage, bColor, isInvalid = false, placeholderTextColor = "rgba(255,255,255,0.2)", fontSize = "14px" } = props

    return (
        <HStack mb={isInvalid ? "10px" : "0px"}>
            <FormControl isInvalid={isInvalid} >
                <Input
                    {...props}
                    borderColor={bColor}
                    variant={"input"}
                    fontSize={fontSize}
                    _focus={{ selectionColor: "white" }}
                    fontWeight={"medium"}
                    color={"white"}
                    placeholderTextColor={placeholderTextColor}

                />
                <FormControl.ErrorMessage
                    w={"85%"}
                    leftIcon={
                        <Feather name="alert-circle" size={24} color={colors.alert} />
                    }>
                    <Text>{errorMessage}</Text>
                </FormControl.ErrorMessage>
            </FormControl>
        </HStack>
    )
}

export default InputComponent
