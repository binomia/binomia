import React from 'react'
import { VStack, Text, HStack, FlatList, ZStack } from 'native-base'
import { useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import CircularProgress from 'react-native-circular-progress-indicator';
import { limitsScreenData } from '@/mocks'


const LimitsScreen: React.FC = () => {
    const { account } = useSelector((state: any) => state.globalReducer)

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} h={"auto"} mt={"50px"}>
                <FlatList
                    bg={"lightGray"}
                    borderRadius={10}
                    px={"10px"}
                    data={limitsScreenData(account)}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item }) => (
                        <HStack bg={"lightGray"} w={"100%"} space={2} pl={"10px"} py={"18px"} >
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <CircularProgress
                                    radius={25}
                                    showProgressValue={false}
                                    value={Number(item.percentage)}
                                    title={`${item.percentage}%`}
                                    titleStyle={{ color: colors.white, fontSize: 10, fontWeight: "bold" }}
                                    circleBackgroundColor={colors.lightGray}
                                    inActiveStrokeColor={colors.mainGreen}
                                    inActiveStrokeOpacity={0.2}
                                    activeStrokeWidth={5}
                                />
                            </HStack>
                            <VStack flex={1} px={"10px"}>
                                <HStack justifyContent={"space-between"} alignItems={"center"}>
                                    <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                        <Text numberOfLines={3} fontSize={scale(13)} color={colors.white}>{item.title}</Text>
                                    </HStack>
                                </HStack>
                                <ZStack w={"100%"} h={"7px"} bg={colors.darkGray} borderRadius={10}>
                                    <HStack w={`${item.percentage}%`} h={`100%`} borderRadius={10} bg={colors.mainGreen} />
                                </ZStack>
                            </VStack>
                        </HStack>
                    )} />
            </VStack>
        </VStack>
    )
}

export default LimitsScreen