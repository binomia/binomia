import type { Config } from 'drizzle-kit';


export default {
    schema: './db/schemas/*',
    out: './drizzle',
    dialect: 'sqlite',
    driver: 'expo',
} satisfies Config;