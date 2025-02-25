import React from 'react'
import colors from '@/colors'
import { HStack, Skeleton, VStack, ZStack } from 'native-base'
import { scale } from 'react-native-size-matters'


const HomeSkeleton: React.FC = () => {
    return (
        <VStack variant={"body"} w="100%" pt={"20px"} flex={1} space={2} bg={colors.darkGray} >
            <HStack w={"100%"} h={"250px"}>
                <ZStack w={"100%"}>
                    <Skeleton fadeDuration={0.1} h="220px" borderRadius={"15px"} startColor={colors.lightGray} />
                    <HStack space={2} px={"20px"} w={"100%"} alignItems={"flex-end"} h={"200px"} >
                        <Skeleton fadeDuration={0.1} w={"50%"} h={"50px"} rounded={"15px"} my={4} startColor={colors.darkGray} />
                        <Skeleton fadeDuration={0.3} w={"50%"} h={"50px"} rounded={"15px"} my={4} startColor={colors.darkGray} />
                    </HStack>
                </ZStack>
            </HStack>
            <Skeleton.Text lines={1} fadeDuration={0.5} py={"10px"} mt={"30px"} w={"50%"} rounded={"full"} startColor={colors.lightGray} />
            <HStack space={2} w={"100%"}>
                {new Array(4).fill(0).map((_, index) => (
                    <ZStack key={`${index}-skeleton-0`} alignItems={"center"} w={"49%"} h={scale(125)}>
                        <Skeleton mr={"10px"} fadeDuration={0.1} w={"100%"} h={"100%"} rounded={"10px"} startColor={colors.lightGray} />
                        <VStack space={2} alignItems={"center"} justifyContent={"center"} w={"100%"} h={"100%"} rounded={"10px"}>
                            <Skeleton fadeDuration={0.3} w={scale(60)} h={scale(60)} rounded={"full"} startColor={colors.lightGray} />
                            <Skeleton.Text lines={2} w={"50%"} fadeDuration={0.3} startColor={colors.lightGray} />
                        </VStack>
                    </ZStack>
                ))}
            </HStack>
            <HStack space={2} w={"100%"}>
                {new Array(4).fill(0).map((_, index) => (
                    <ZStack key={`${index}-skeleton-1`} alignItems={"center"} w={"49%"} h={scale(125)}>
                        <Skeleton mr={"10px"} fadeDuration={0.1} w={"100%"} h={"100%"} rounded={"10px"} startColor={colors.lightGray} />
                        <VStack space={2} alignItems={"center"} justifyContent={"center"} w={"100%"} h={"100%"} rounded={"10px"}>
                            <Skeleton fadeDuration={0.3} w={scale(60)} h={scale(60)} rounded={"full"} startColor={colors.lightGray} />
                            <Skeleton.Text lines={2} w={"50%"} fadeDuration={0.3} startColor={colors.lightGray} />
                        </VStack>
                    </ZStack>
                ))}
            </HStack>
        </VStack>
    )
}

export default HomeSkeleton
