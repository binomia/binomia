import colors from '@/colors';
import Input from '@/components/global/Input';
import Button from '@/components/global/Button';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Pressable } from 'native-base';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, Dimensions, View } from 'react-native';
import { FORMAT_CEDULA } from '@/helpers';
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import { registerActions } from '@/redux/slices/registerSlice';
import { useDispatch } from 'react-redux';
import AntDesign from '@expo/vector-icons/AntDesign';


type Props = {
    nextPage: () => void
    prevPage: () => void

}


const { width, height } = Dimensions.get("window");

const IDData: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const dispatch = useDispatch()

    const [showDNIError, setShowDNIError] = useState<boolean>(false);
    const [showDNIErroreMessage, setShowDNErrorMessage] = useState<string>("");
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [isInvalid, setIsInvalid] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [exp, setExp] = useState<string>("");
    const [dob, setDob] = useState<string>("");
    const [id, setId] = useState<string>("");
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [hasExpError, setHasExpError] = useState(false)
    const [openedDateTitle, setOpenedDateTitle] = useState("")
    const [isInvalidDate, setIsInvalidDate] = useState<string>("")


    const validateCedula = async () => {
        setIsInvalid(true)
        try {
            await axios.get(`https://api.digital.gob.do/v3/cedulas/${id.replace(/-/g, '')}/validate`)
            setIsInvalid(false)
            checkIfDNIExists()

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setIsInvalid(true)
            setShowDNErrorMessage("La Cedula Ingresada No Es Valida")
        }
    }

    const checkIfDNIExists = async () => {
        try {

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setShowDNIError(false)
            setShowDNErrorMessage("Error Al Validar La Cedula")
        }
    }

    const onOpenDate = (title: string) => {
        setOpenedDateTitle(title)
        setOpen(true)
    }

    const onConfirmDate = (date: Date) => {
        setDate(date)
        setIsInvalidDate("")
        setHasExpError(false)
        const dateString: string = moment(date).format("YYYY-MM-DD")


        if (openedDateTitle === "exp") {
            if (moment(dateString).isBefore(moment())) {
                setIsInvalidDate("Lo sentimos, no podemos procesar cédulas cuya fecha de vigencia haya expirado.")
                setDisabledButton(true)
                setHasExpError(true)
            }
            setExp(dateString)
            dispatch(registerActions.setDniExpiration(dateString))
        }
        else if (openedDateTitle === "dob") {
            setDob(dateString)
            dispatch(registerActions.setDniDOB(dateString))
        }
        setOpen(false)
    }

    const onChangeText = (value: string) => {
        setId(value)
        dispatch(registerActions.setDni(value))
    }

    useEffect(() => {
        setIsInvalid(false)

        if (id.length === 13) {
            setIsInvalid(false)
            validateCedula()
            setDisabledButton(false)
        }

    }, [id])

    useEffect(() => {
        setDisabledButton(true)

        if (id.length === 13 && !isInvalid && exp && dob) {
            setDisabledButton(false)
        }

    }, [dob, exp, id])

    return (
        <KeyboardAvoidingScrollView >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ width, height: height - 130, display: "flex", justifyContent: "space-between" }} >
                    <VStack mt={"30px"} w={"100%"} alignItems={"center"}>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} color={"white"}>Datos De Cédula</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Para continuar con el proceso, ingrese los datos de su cédula.
                            </Text>
                        </VStack>
                        <VStack w={"100%"} px={"20px"} mt={"30px"} >
                            <Input
                                isInvalid={isInvalid}
                                errorMessage={showDNIErroreMessage}
                                h={`${INPUT_HEIGHT}px`}
                                autoComplete="off"
                                maxLength={12}
                                style={id.length === 13 && !isInvalid && !showDNIError ? styles.InputsSucess : (id && !isInvalid || isInvalid) ? styles.InputsFail : {}}
                                onChangeText={(value) => onChangeText(FORMAT_CEDULA(value.replace(/-/g, '')))}
                                keyboardType="number-pad"
                                value={id}
                                placeholder="Numero De Cédula*"
                            />
                            <Pressable borderColor={"mainGreen"} borderWidth={dob ? 1 : 0} my={"5px"} px={"20px"} h={`${INPUT_HEIGHT}px`} borderRadius={"10px"} bg={"lightGray"} justifyContent={"center"} onPress={() => onOpenDate("dob")}>
                                <Text color={dob ? "white" : colors.placeholderTextColor}>{dob ? moment(dob).format("ll") : "Fecha De Nacimiento*"}</Text>
                            </Pressable>
                            <Pressable borderColor={hasExpError ? "red" : "mainGreen"} borderWidth={exp ? 1 : 0} my={"5px"} px={"20px"} h={`${INPUT_HEIGHT}px`} borderRadius={"10px"} bg={"lightGray"} justifyContent={"center"} onPress={() => onOpenDate("exp")}>
                                <Text color={exp ? "white" : colors.placeholderTextColor}>{exp ? moment(exp).format("ll") : "Fecha De Expiración*"}</Text>
                            </Pressable>
                        </VStack>
                        {isInvalidDate ? <HStack space={2} w={"100%"} mt={"10px"} justifyContent={"center"}>
                            <AntDesign style={{ marginTop: 5 }} name="exclamationcircleo" size={24} color={colors.red} />
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>{isInvalidDate} </Text>
                        </HStack> : null}
                    </VStack>
                    <HStack bg={"red.100"} px={"20px"} w={"100%"} justifyContent={"space-between"}>
                        <Button
                            w={"49%"}
                            bg={"lightGray"}
                            color={"mainGreen"}
                            mb="10px"
                            onPress={prevPage}
                            title={"Atras"}
                        />
                        <Button
                            spin={loading}
                            w={"49%"}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            mb="10px"
                            onPress={async () => {
                                setLoading(true)
                                nextPage()
                                setLoading(false)
                            }}
                            title={"Siguiente"}
                        />
                    </HStack>
                </View>
            </TouchableWithoutFeedback>
            <DatePicker
                locale='es'
                confirmText='Confirmar'
                cancelText='Cancelar'
                modal
                open={open}
                date={date}
                mode="date"
                onConfirm={onConfirmDate}
                onCancel={() => {
                    setOpen(false)
                    setOpenedDateTitle("")
                }}
            />
        </KeyboardAvoidingScrollView>
    );
}


export default IDData


const styles = StyleSheet.create({
    InputsSucess: {
        borderColor: colors.mainGreen,
        borderWidth: 1,
        borderRadius: 10,
    },
    InputsFail: {
        borderColor: colors.alert,
        borderWidth: 1,
        borderRadius: 10,
    }
});