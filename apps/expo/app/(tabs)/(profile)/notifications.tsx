import React from 'react'
import colors from '@/colors'
import { Image, VStack, HStack, Switch, Heading } from 'native-base'
import { allIcon } from '@/assets'
import { useDispatch, useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { notificationsScreenData } from '@/mocks'
import { useMutation } from '@apollo/client'
import { AccountApolloQueries } from '@/apollo/query'
import { accountActions } from '@/redux/slices/accountSlice'

const NotificationsScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { account } = useSelector((state: any) => state.accountReducer)
    const { allowWhatsappNotification, allowPushNotification, allowEmailNotification, allowSmsNotification } = account

    const [updateAccountPermissions] = useMutation(AccountApolloQueries.updateAccountPermissions())
    const [allNotifications, setAllNotifications] = React.useState<{ id: string, allow: boolean, icon: any }>({
        id: "all",
        allow: true,
        icon: allIcon
    })


    const onSwitchChange = async (id: string, allow: boolean) => {
        try {
            if (id === "all") {
                const { data } = await updateAccountPermissions({
                    variables: {
                        data: {
                            "allowEmailNotification": allow,
                            "allowPushNotification": allow,
                            "allowSmsNotification": allow,
                            "allowWhatsappNotification": allow
                        }
                    }
                })

                await dispatch(accountActions.setAccount(data.updateAccountPermissions))
                setAllNotifications(Object.assign({}, allNotifications, { allow }))

            } else {
                const { data } = await updateAccountPermissions({
                    variables: {
                        data: {
                            [id]: allow
                        }
                    }
                })

                await dispatch(accountActions.setAccount(data.updateAccountPermissions))

                const { allowEmailNotification, allowPushNotification, allowSmsNotification, allowWhatsappNotification } = data.updateAccountPermissions
                setAllNotifications(Object.assign({}, allNotifications, {
                    allow: allowEmailNotification && allowPushNotification && allowSmsNotification && allowWhatsappNotification ? true : false
                }))
            }

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack w={"100%"} h={"auto"} mt={"50px"}>
                <HStack justifyContent={"space-between"} w={"100%"} mb={"30px"} borderRadius={10} h={scale(45)} py={"10px"} space={2} >
                    <HStack h={scale(35)} justifyContent={"center"} alignItems={"center"}>
                        <Image alt='logo-image' borderRadius={2000} resizeMode='contain' w={scale(35)} h={scale(35)} source={allNotifications.icon} />
                        <Heading ml={"10px"} borderRadius={"100px"} fontSize={scale(15)} textTransform={"capitalize"} color={colors.white}>Todas</Heading>
                    </HStack>
                    <Switch disabled={account.status !== "active"} isChecked={allNotifications.allow && account.status === "active"} onChange={() => onSwitchChange(allNotifications.id, !allNotifications.allow)} mr={"10px"} />
                </HStack>
                <VStack borderRadius={10} pb={"3px"}>
                    {notificationsScreenData({ allowWhatsappNotification, allowPushNotification, allowEmailNotification, allowSmsNotification }).map((item, index) => (
                        <HStack justifyContent={"space-between"} key={`privacies-${index}-${item.name}`} w={"100%"} borderRadius={10} h={scale(45)} py={"10px"} space={2} >
                            <HStack h={scale(35)} justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' borderRadius={2000} resizeMode='contain' w={scale(35)} h={scale(35)} source={item.icon} />
                                <Heading ml={"10px"} borderRadius={"100px"} fontSize={scale(15)} textTransform={index === 2 ? undefined : "capitalize"} color={colors.white}>{item.name}</Heading>
                            </HStack>
                            <Switch isChecked={item.allow} defaultIsChecked onChange={() => onSwitchChange(item.id, !item.allow)} mr={"10px"} />
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        </VStack>
    )
}

export default NotificationsScreen
