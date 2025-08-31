import { drizzle } from "drizzle-orm/expo-sqlite";
import {  useSQLiteContext } from "expo-sqlite/next";
import { searchedUsersSchema } from "@/db/schemas/usersSchema";
import { z } from "zod";
import { UserAuthSchema } from "@/auth/userAuth";
import { eq, desc } from "drizzle-orm";
import { useEffect } from "react";
import { useSelector } from "react-redux";



export const useSqlite = () => {
    const dbContext = useSQLiteContext();
    const { user } = useSelector((state: any) => state.accountReducer);
    const db = drizzle(dbContext);

    const getOneSearchedUser = async (id: number) => {
        try {

            const response = await db.select().from(searchedUsersSchema).where(eq(searchedUsersSchema.id, id)).limit(1)
            if (response.length === 0) return null

            const user = await UserAuthSchema.singleSearchUserData.parseAsync(response[0])
            return user

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    const getSearchedUsers = async () => {
        try {
            const response = await db.select().from(searchedUsersSchema).orderBy(desc(searchedUsersSchema.id)).limit(15)
            if (response.length === 0) return []

            const users = await UserAuthSchema.searchUserData.parseAsync(response)
            return users

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    const insertSearchedUser = async (userData: z.infer<typeof UserAuthSchema.singleSearchUserData>): Promise<void> => {
        try {
            if (userData.id === user.id) return

            const userExists = await getOneSearchedUser(userData.id)
            if (userExists) return

            await db.insert(searchedUsersSchema).values(userData);
            console.log(`User with id ${userData.id} inserted successfully`);

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    const deleteSearchedUser = async (id: number) => {
        try {
            const response = await db.delete(searchedUsersSchema).where(eq(searchedUsersSchema.id, id))
            console.log(`User with id ${id} deleted successfully`);
            return response

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    const dropSearchedUsersTables = async () => {
        try {
            await db.delete(searchedUsersSchema);
            console.log('Table dropped successfully');

        } catch (error: any) {
            console.log(error.toString(), 'dropTables error');
        }
    }

    useEffect(() => {
        // dropSearchedUsersTables()
    }, [])

    return {
        getSearchedUsers,
        dropSearchedUsersTables,
        getOneSearchedUser,
        deleteSearchedUser,
        insertSearchedUser
    }
}