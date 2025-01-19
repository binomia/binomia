import React from 'react'
import useAsyncStorage from '@/hooks/useAsyncStorage'
import colors from '@/colors'
import { Image, VStack, Text, HStack, Divider, Switch, Heading } from 'native-base'
import { whatsappIcon } from '@/assets'
import { useDispatch, useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { globalActions } from '@/redux/slices/globalSlice'
import { notificationsScreenData } from '@/mocks'

const NotificationsScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { setItem } = useAsyncStorage()
    const { smsNotifications, whatsappNotifications, emailNotifications, pushNotifications } = useSelector((state: any) => state.globalReducer)

    const onSwitchChange = async (name: string, allow: boolean) => {
        try {
            if (name === "whatsapp") {
                await setItem("whatsappNotification", allow ? "true" : "false")
                await dispatch(globalActions.setWhatsappNotification(allow))

            } else if (name === "Notificaciónes Mobil") {
                await setItem("pushNotification", allow ? "true" : "false")
                await dispatch(globalActions.setPushNotification(allow))

            } else if (name === "Correo Electrónico") {
                await setItem("emailNotification", allow ? "true" : "false")
                await dispatch(globalActions.setEmailNotification(allow))

            } else if (name === "Mensajes SMS") {
                await setItem("smsNotification", allow ? "true" : "false")
                await dispatch(globalActions.setSmsNotification(allow))
            }

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack w={"100%"} h={"auto"} mt={"50px"}>               
                <HStack justifyContent={"space-between"} w={"100%"} borderRadius={10} h={scale(45)} py={"10px"} space={2} >
                    <HStack h={scale(35)} justifyContent={"center"} alignItems={"center"}>
                        <Image alt='logo-image' borderRadius={2000} resizeMode='contain' w={scale(35)} h={scale(35)} source={whatsappIcon} />
                        <Heading ml={"10px"} borderRadius={"100px"} fontSize={scale(15)} textTransform={"capitalize"} color={colors.white}>{"Whatsapp"}</Heading>
                    </HStack>
                    <Switch isChecked={whatsappNotifications} onChange={() => onSwitchChange("whatsapp", !whatsappNotifications)} mr={"10px"} />
                </HStack>
                <VStack borderRadius={10} pb={"3px"}>
                    {notificationsScreenData({ pushNotifications, emailNotifications, smsNotifications }).map((item, index) => (
                        <HStack justifyContent={"space-between"} key={`privacies-${index}-${item.name}`} w={"100%"} borderRadius={10} h={scale(45)} py={"10px"} space={2} >
                            <HStack h={scale(35)} justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' borderRadius={2000} resizeMode='contain' w={scale(35)} h={scale(35)} source={item.icon} />
                                <Heading ml={"10px"} borderRadius={"100px"} fontSize={scale(15)} textTransform={index === 2 ? undefined : "capitalize"} color={colors.white}>{item.name}</Heading>
                            </HStack>
                            <Switch isChecked={item.allow} defaultIsChecked onChange={(e) => onSwitchChange(item.name, !item.allow)} mr={"10px"} />
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        </VStack>
    )
}

export default NotificationsScreen
