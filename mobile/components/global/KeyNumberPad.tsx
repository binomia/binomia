import React from 'react'
import { Text, StyledProps, Pressable, FlatList, VStack, Heading } from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import colors from '@/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { FORMAT_CURRENCY } from '@/helpers';
import { scale } from 'react-native-size-matters';
import * as Haptics from 'expo-haptics';


interface Props extends StyledProps {
    onChange?: (value: string) => void
    maxAmount?: number
}


const { height } = Dimensions.get("window")
const KeyNumberPad: React.FC<Props> = ({ onChange = (_: string) => { }, maxAmount = 1e6 }): JSX.Element => {
    const [value, setValue] = React.useState<string>("0")
    const [valueScale, setValueScale] = React.useState<number>(0)

    const delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

    const onInputChange = async (number: string) => {
        if (value.length === 0 && number === "0" || number === "." && value.includes(".")) {
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            )

            return
        }


        if (number === "x") {
            const lastValue = value[value.length - 1] === "."
            const newValue = value.slice(0, value.length - (lastValue ? 2 : 1))
            const newValueParseed = isNaN(Number.parseFloat(newValue)) ? "0" : parseFloat(newValue).toFixed(2)

            setValue(newValue)
            onChange(newValueParseed)

        } else {
            const newValue = value + number
            const newValueParseed = parseFloat(newValue).toFixed(2)
            const decimalValue = newValue.split(".")[1]


            if (decimalValue && decimalValue.length > 2 && decimalValue[1] || decimalValue && decimalValue[1] === "0" || Number(newValue) > maxAmount) {
                setValueScale(5)
                await delay(100)
                setValueScale(0)

                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                )
                return
            }

            setValue(newValue)
            onChange(newValueParseed)
        }
    }

    return (
        <VStack>
            <Heading mb={"40px"} fontSize={scale(38 + valueScale)} color={"mainGreen"} textAlign={"center"}>{FORMAT_CURRENCY(Number(value))}</Heading>
            <FlatList columnWrapperStyle={styles.ColumnWrapperStyle} contentContainerStyle={{ alignItems: "center", justifyContent: "center" }} data={["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "x"]} numColumns={3} renderItem={({ item }) => (
                item === "x" ?
                    <Pressable key={`number-key-pad-key-${item}`} onPress={() => onInputChange(item)} style={styles.OuterButton} _pressed={styles.OuterButtonPressed}>
                        <FontAwesome6 name="delete-left" size={22} color={colors.white} />
                    </Pressable>
                    :
                    <Pressable key={`number-key-pad-key-${item}`} onPress={() => onInputChange(item)} style={styles.OuterButton} _pressed={styles.OuterButtonPressed}>
                        <Text fontWeight={"extrabold"} opacity={1} fontSize={"20px"} textAlign={"center"} color={colors.white}>{item}</Text>
                    </Pressable>
            )} />
        </VStack>

    )
}


export default KeyNumberPad

const styles = StyleSheet.create({
    OuterButton: {
        width: height * 0.10,
        height: height * 0.10,
        margin: 10,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.lightGray,
    },
    OuterButtonPressed: {
        opacity: 0.8,
    },
    ColumnWrapperStyle: {
        gap: 25
    }
})