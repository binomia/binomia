import { View } from 'react-native'
import React from 'react'
import { Input, StyledProps } from 'native-base'

type Props = {
    onChangeText: (value: string) => void
    placeholder: string
    style?: StyledProps
    rightElement?: JSX.Element
    leftElement?: JSX.Element
    secureTextEntry?: boolean
}

const InputComponent: React.FC<Props> = ({ onChangeText, placeholder, style, rightElement, leftElement, secureTextEntry = false }) => {
    return (
        <View>
            <Input
                rightElement={rightElement}
                leftElement={leftElement}
                secureTextEntry={secureTextEntry}
                {...style}
                variant={"input"}
                fontSize={"14px"}
                _focus={{ selectionColor: "white" }}
                fontWeight={"medium"}
                color={"white"}
                onChangeText={(e) => onChangeText(e)}
                placeholder={placeholder}
            />
        </View>
    )
}

export default InputComponent
