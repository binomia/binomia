import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { UserAuthSchema } from '@/auth/userAuth'
import { z } from 'zod'
import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT } from '@/helpers'
import { useSqlite } from '@/hooks/useSqlite';



const SearchUserScreen: React.FC = () => {
	const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
	const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
	const { getSearchedUsers, insertSearchedUser, deleteSearchedUser } = useSqlite()


	const handleSearch = async (value: string) => {
		try {
			const { data } = await searchUser({
				variables: {
					"limit": 5,
					"search": {
						"username": value,
						"fullName": value,
						"email": value,
						"dniNumber": value
					}
				}
			})

			setUsers(data.searchUsers || [])

			if (data.searchUsers.length > 0) {
				// await deleteSearchedUser(data.searchUsers[0].id)
				await insertSearchedUser(data.searchUsers[0])
			}
			// await getSearchedUsers()

		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		(async () => {
			const searchedUsers = await getSearchedUsers()			
			setUsers(searchedUsers)
		})()
	}, [])

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
				<VStack px={"20px"} pt={"20px"}>
					<VStack w={"100%"} alignItems={"center"}>
						<Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} bColor={colors.lightGray} />
					</VStack>
					<Heading mt={"40px"} size={"lg"} color={"white"}>Recomendados</Heading>
					<FlatList
						h={"100%"}
						mt={"10px"}
						data={users}
						renderItem={({ item, index }) => (
							<TouchableOpacity key={`search_user_${index}-${item.username}`} onPress={() => console.log(item.username)}>
								<HStack alignItems={"center"} my={"10px"} borderRadius={10}>
									{item.profileImageUrl ?
										<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: item.profileImageUrl }} />
										:
										<DefaultIcon
											value={item.fullName}
											contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.fullName) }]}
											textStyle={styles.textStyle}
										/>
									}
									<VStack ml={"10px"} justifyContent={"center"}>
										<Heading size={"md"} color={"white"}>Kamari Chizimu</Heading>
										<Text color={colors.lightSkyGray}>$sclerotic_carrot_54</Text>
									</VStack>
								</HStack>
							</TouchableOpacity>
						)}
					/>
				</VStack>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	)
}

export default SearchUserScreen


const styles = StyleSheet.create({
	contentContainerStyle: {
		width: 55,
		height: 55,
		borderRadius: 100
	},
	textStyle: {
		fontSize: 30,
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