import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';


export const TransactionsSchema = sqliteTable('transactions', {
    id: integer('id').unique().notNull(),
    type: text('type'),
    status: text('status'),
    timestamp: integer('timestamp'),
    data: text('data', { mode: 'json' }),
});
