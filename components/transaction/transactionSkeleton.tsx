import React, { } from 'react'
import colors from '@/colors'
import { SafeAreaView, Dimensions } from 'react-native'
import { Center, HStack, Skeleton, VStack } from 'native-base'


const { } = Dimensions.get('window')
const TransactionSkeleton: React.FC = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <Center w="100%">
                <VStack w="90%" maxW="400" space={2} overflow="hidden" rounded="md">
                    <Skeleton fadeDuration={0.5} h="50px" rounded={"15px"} mt={"20px"} startColor={colors.lightGray} />
                    <HStack space={2} >
                        <Skeleton fadeDuration={0.5} w={"80px"} h={"80px"} rounded={"full"} my={4} startColor={colors.lightGray} />
                        <Skeleton fadeDuration={0.5} w={"80px"} h={"80px"} rounded={"full"} my={4} startColor={colors.lightGray} />
                    </HStack>
                    <Skeleton.Text lines={1} fadeDuration={0.5} py={"10px"} mt={"50px"} mb={"20px"} w={"50%"} rounded={"full"} startColor={colors.lightGray} />
                    {new Array(5).fill(0).map((_, index) => (
                        <VStack key={`transaction-skeleton-${index}`} space={2} >
                            <HStack alignItems={"center"}>
                                <Skeleton mr={"10px"} fadeDuration={0.5} w={"80px"} h={"80px"} rounded={"full"} startColor={colors.lightGray} />
                                <Skeleton.Text lines={3} fadeDuration={0.5} w={"50%"} rounded={"full"} startColor={colors.lightGray} />
                            </HStack>
                        </VStack>
                    ))}
                </VStack>
            </Center>
        </SafeAreaView>
    )
}

export default TransactionSkeleton
