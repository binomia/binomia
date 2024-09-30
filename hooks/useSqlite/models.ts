import { SQLiteDatabase } from "expo-sqlite";


// "asset_id": "040585a0e9b26b8bdd8dabda0be94ead",
// "public_id": "dinero/cedulas/1727658580011",
// "version": 1727658580,
// "version_id": "761d3d8bebd7038045b971ae68e7d8c2",
// "signature": "b0098e20ac17be46501cb7bfe0107b704ac65792",
// "width": 800,
// "height": 533,
// "format": "jpg",
// "resource_type": "image",
// "created_at": "2024-09-30T01:09:40Z",
// "tags": [],
// "pages": 1,
// "bytes": 40630,
// "type": "upload",
// "etag": "22a391b11011f866898f27be721873d7",
// "placeholder": false,
// "url": "http://res.cloudinary.com/brayhandeaza/image/upload/v1727658580/dinero/cedulas/1727658580011.jpg",
// "secure_url": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727658580/dinero/cedulas/1727658580011.jpg",
// "folder": "dinero/cedulas",
// "access_mode": "public",
// "existing": false,
// "faces": [


export const synchTables = async (db: SQLiteDatabase) => {
    try {
        db.execAsync(`
            CREATE TABLE IF NOT EXISTS fines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_id TEXT,
                asset_id TEXT,
                secure_url TEXT,
                signature TEXT,
                createdAt TEXT,
                updatedAt TEXT
            )`
        )

    } catch (error: any) {
        console.log(error.toString(), 'synchTables error');
    }
}
export const dropTables = async (db: SQLiteDatabase, table: string) => {
    try {
        await db.execAsync(`DROP TABLE IF EXISTS ${table}`)

    } catch (error: any) {
        console.log(error.toString(), 'dropTables error');
    }
}
