import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const searchedUsersSchema = sqliteTable('searched_users', {
    id: integer('id').primaryKey(),
    fullName: text('fullName'),
    username: text('username'),
    email: text('email'),
    dniNumber: text('dniNumber'),
    profileImageUrl: text('profileImageUrl'),
    status: text('status'),
})

