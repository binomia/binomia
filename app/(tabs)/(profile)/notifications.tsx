import React from 'react'
import { Image, VStack, Text, HStack, Divider, FlatList, Switch } from 'native-base'
import { whatsappIcon } from '@/assets'
import { useDispatch, useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { globalActions } from '@/redux/slices/globalSlice'
import useAsyncStorage from '@/hooks/useAsyncStorage'
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
                <HStack bg={"lightGray"} w={"100%"} borderRadius={10} space={2} pl={"10px"} py={"8px"} mb={"30px"}>
                    <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"17px"} h={"17px"} source={whatsappIcon} />
                    </HStack>
                    <HStack flex={1} justifyContent={"space-between"} alignItems={"center"}>
                        <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                            <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{"Whatsapp"}</Text>
                        </HStack>
                        <Switch isChecked={whatsappNotifications} onChange={() => onSwitchChange("whatsapp", !whatsappNotifications)} mr={"10px"} />
                    </HStack>
                </HStack>
                <FlatList
                    bg={"lightGray"}
                    borderRadius={10}
                    pb={"3px"}
                    data={notificationsScreenData({ pushNotifications, emailNotifications, smsNotifications })}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <HStack key={`privacies-${index}-${item.name}`} bg={"lightGray"} w={"100%"} borderRadius={10} h={"50px"} py={"10px"} space={2} pl={"10px"} >
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={item.icon} />
                            </HStack>
                            <VStack flex={1}>
                                <HStack justifyContent={"space-between"} alignItems={"center"}>
                                    <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                        <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{item.name}</Text>
                                    </HStack>
                                    <Switch isChecked={item.allow} defaultIsChecked onChange={(e) => onSwitchChange(item.name, !item.allow)} mr={"10px"} />
                                </HStack>
                                {index !== 2 ? <Divider mt={"7px"} width={"100%"} h={"0.5px"} bg={colors.gray} /> : null}
                            </VStack>
                        </HStack>
                    )} />
            </VStack>
        </VStack>
    )
}

export default NotificationsScreen
