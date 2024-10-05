import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite/next";
import { searchedUsersSchema } from "@/db/schemas/usersSchema";
import { z } from "zod";
import { UserAuthSchema } from "@/auth/userAuth";
import { eq, desc } from "drizzle-orm";



export const useSqlite = () => {
    const dbContext = useSQLiteContext();
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
            const response = await db.select().from(searchedUsersSchema).orderBy(desc(searchedUsersSchema.id))
            if (response.length === 0) return []

            const users = await UserAuthSchema.searchUserData.parseAsync(response)
            return users

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    const insertSearchedUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>): Promise<void> => {
        try {
            const userExists = await getOneSearchedUser(user.id)
            if (userExists) return

            await db.insert(searchedUsersSchema).values(user);
            console.log(`User with id ${user.id} inserted successfully`);

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

    return {
        getSearchedUsers,
        getOneSearchedUser,
        deleteSearchedUser,
        insertSearchedUser
    }
}