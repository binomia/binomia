import React from 'react'
import { Text, StyledProps, Pressable, Spinner } from 'native-base';
import { INPUT_HEIGHT } from '@/constants';


interface Props extends StyledProps {
    title: string
    color?: string
    disabled?: boolean
    spin?: boolean
    onPress?: () => void
}

const Button: React.FC<Props> = (props): JSX.Element => {
    const { spin = false, color = "white", title, onPress = () => { }, disabled = false } = props

    return (
        <Pressable _pressed={{ opacity: 0.5 }} {...props} borderRadius={"25px"} alignItems={"center"} justifyContent={"center"} h={`${INPUT_HEIGHT}px`} disabled={disabled} onPress={onPress}>
            {spin ?
                <Spinner color={color} />
                :
                <Text width={"100%"} fontWeight={"bold"} fontSize={"16px"} textAlign={"center"} color={color}>{title}</Text>
            }
        </Pressable>
    )
}


export default Button