import React, { } from 'react'
import colors from '@/colors'
import { SafeAreaView, Dimensions } from 'react-native'
import { HStack, Skeleton, VStack } from 'native-base'


const { } = Dimensions.get('window')
const TransactionSkeleton: React.FC = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <VStack variant="body" w="100%" pt={30}>
                <VStack w="100%" maxW="400" space={2} overflow="hidden" rounded="md">
                    <Skeleton fadeDuration={0.5} w="100%" h={"225px"} rounded={"15px"} startColor={colors.lightGray} />
                    <Skeleton fadeDuration={0.5} w="30%" h={"15px"} rounded={"15px"} mt={"20px"} startColor={colors.lightGray} />
                    <HStack justifyContent={"space-between"} >
                        {new Array(4).fill(0).map((_, index) => (
                            <VStack key={`transaction-skeleton-${index}`}>
                                <Skeleton fadeDuration={0.5} w={"80px"} h={"80px"} rounded={"full"} my={4} startColor={colors.lightGray} />
                                <Skeleton.Text lines={1} fadeDuration={0.5} rounded={"full"} startColor={colors.lightGray} />
                            </VStack>
                        ))}
                    </HStack>
                    <Skeleton.Text lines={1} fadeDuration={0.5} py={"10px"} mt={"50px"} mb={"20px"} w={"50%"} rounded={"full"} startColor={colors.lightGray} />
                    {new Array(5).fill(0).map((_, index) => (
                        <HStack key={`transaction-skeleton-${index}`} justifyContent={"space-between"} alignItems={"center"} space={2} >
                            <HStack alignItems={"center"}>
                                <Skeleton mr={"10px"} fadeDuration={0.5} w={"80px"} h={"80px"} rounded={"full"} startColor={colors.lightGray} />
                                <Skeleton.Text lines={2} fadeDuration={0.5} w={"50%"} rounded={"full"} startColor={colors.lightGray} />
                            </HStack>
                            <Skeleton.Text lines={1} fadeDuration={0.5} w={"10%"} rounded={"full"} startColor={colors.lightGray} />
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        </SafeAreaView>
    )
}

export default TransactionSkeleton
