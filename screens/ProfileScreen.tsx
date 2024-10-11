import { StyleSheet, } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Heading, Image, VStack, Text, HStack, Divider, FlatList, Pressable, ZStack, Spinner } from 'native-base'
import DefaultIcon from 'react-native-default-icon'
import { useDispatch, useSelector } from 'react-redux'
import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import Feather from '@expo/vector-icons/Feather';
import Button from '@/components/global/Button'
import { SessionContext } from '@/contexts/sessionContext'
import { useNavigation } from '@react-navigation/native'
import Fontisto from '@expo/vector-icons/Fontisto';
import * as ImagePicker from 'expo-image-picker';
import { useCloudinary } from '@/hooks/useCloudinary'
import { useMutation } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { globalActions } from '@/redux/slices/globalSlice'
import ImageView from "react-native-image-viewing";
import { profileScreenData } from '@/mocks'


const ProfileScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((state: any) => state.globalReducer)
    const navigation = useNavigation<any>()
    const { onLogout } = useContext(SessionContext)
    const { uploadImage } = useCloudinary()
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [updateUser] = useMutation(UserApolloQueries.updateUser())
    const [visible, setIsVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);


    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setIsLoading(true)
            const url = await uploadImage(result.assets[0].uri)
            const updatedUser = await updateUser({
                variables: {
                    data: {
                        profileImageUrl: url
                    }
                }
            })

            await dispatch(globalActions.setUser(updatedUser.data.updateUser))

            setProfileImage(url);
            setIsLoading(false)
        }
    };

    const onOpenPreviewImage = () => {
        setIsVisible(true);
        setPreviewImage(profileImage)
    };
    const onClosePreviewImage = () => {
        setIsVisible(false);
        setPreviewImage(null)
    };

    useEffect(() => {
        setProfileImage(user?.profileImageUrl)
    }, [])


    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack>
                <VStack mt={"30px"} alignItems={"center"} >
                    <ZStack w={scale(100)} h={scale(100)} borderRadius={100} justifyContent={"flex-end"} alignItems={"flex-end"}>
                        {profileImage ?
                            <Pressable onPress={() => onOpenPreviewImage()} _pressed={{ opacity: 0.5 }}>
                                <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(100)} h={scale(100)} source={{ uri: profileImage }} />
                            </Pressable>
                            :
                            <DefaultIcon
                                value={user?.fullName}
                                contentContainerStyle={[styles.contentContainerStyle, { width: scale(100), height: scale(100), backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(user?.fullName || "") }]}
                                textStyle={styles.textStyle}
                            />
                        }
                        {isLoading ?
                            <HStack pl={"10px"} pt={"10px"} justifyContent={"center"} alignItems={"center"} w={scale(100)} h={scale(100)}>
                                <Spinner size={"lg"} color={colors.mainGreen} />
                            </HStack>
                            : null
                        }
                        <Pressable onPress={() => pickImage()} _pressed={{ opacity: 0.5 }} w={"35px"} h={"35px"} borderRadius={100} bg={"lightGray"} justifyContent={"center"} alignItems={"center"}>
                            <Fontisto name="camera" size={18} color="white" />
                        </Pressable>
                    </ZStack>
                    <VStack mt={"10px"} ml={"10px"} alignItems={"center"} justifyContent={"center"}>
                        <Heading textTransform={"capitalize"} fontSize={scale(28)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(user?.fullName || "")}</Heading>
                        <Text fontSize={scale(18)} color={colors.lightSkyGray}>{user?.username}</Text>
                    </VStack>
                </VStack>
                <VStack px={"10px"} borderRadius={10} w={"100%"} h={"auto"} mt={"50px"} bg={"lightGray"}>
                    <FlatList
                        data={profileScreenData}
                        scrollEnabled={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <Pressable _pressed={{ opacity: 0.5 }} onPress={() => navigation.navigate(item.path)}>
                                <HStack key={`personal${item.name}`} space={2} pl={"10px"} py={"8px"} alignItems={"center"}>
                                    <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                        <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={item.icon} />
                                    </HStack>
                                    <VStack width={"90%"} h={"30px"} borderRadius={10}>
                                        <HStack pr={"10px"} justifyContent={"space-between"} alignItems={"center"}>
                                            <Text textTransform={"capitalize"} fontSize={scale(15)} color={colors.white}>{item.name}</Text>
                                            <Feather name="chevron-right" size={24} color="white" />
                                        </HStack>
                                        {index !== 4 ? <Divider mt={"10px"} width={"100%"} h={"0.5px"} bg={colors.gray} /> : null}
                                    </VStack>
                                </HStack>
                            </Pressable>
                        )} />
                </VStack>
            </VStack>
            <HStack mb={"30px"} justifyContent={"center"}>
                <Button fontWeight={"bold"} bg={"lightGray"} color='red' title='Cerrar Sesion' onPress={onLogout} w={'80%'} />
            </HStack>
            {previewImage ?
                <ImageView
                    images={[{ uri: previewImage }]}
                    imageIndex={0}
                    visible={visible}
                    onRequestClose={onClosePreviewImage}
                />
                : null
            }
        </VStack>
    )
}

export default ProfileScreen


const styles = StyleSheet.create({
    contentContainerStyle: {
        width: 55,
        height: 55,
        borderRadius: 100
    },
    textStyle: {
        fontSize: 50,
        color: 'white',
        marginBottom: 2,
        textTransform: 'capitalize',
        fontWeight: 'bold',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
})