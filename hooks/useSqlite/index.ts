import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, useSQLiteContext } from "expo-sqlite/next";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../../drizzle/migrations';
import { searchedUsersSchema } from "@/db/schemas/usersSchema";
import { z } from "zod";
import { UserAuthSchema } from "@/auth/userAuth";
import { eq, desc, exists } from "drizzle-orm";



export const useSqlite = () => {
    const dbContext = useSQLiteContext();
    const db = drizzle(dbContext);

    const getOneSearchedUser = async (id: number) => {
        try {
            const response = await db.select().from(searchedUsersSchema).where(eq(searchedUsersSchema.id, id)).limit(1)
            return response.length > 0 ? response[0] : null

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    const getSearchedUsers = async () => {
        try {
            const response = await db.select().from(searchedUsersSchema).orderBy(desc(searchedUsersSchema.id))
            const users = UserAuthSchema.searchUserData.parseAsync(response)
            return users 

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    const insertSearchedUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>) => {
        try {
            const userExists = await getOneSearchedUser(user.id)
            if (userExists) return

            const response = await db.insert(searchedUsersSchema).values(user);
            console.log(`User with id ${user.id} inserted successfully`);

            return response

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