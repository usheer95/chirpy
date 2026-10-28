import {db} from "../index.js";
import  { NewUser, users } from "../schema.js";


export async function createUser(user: NewUser) 
{
    const [createdUser] = await db.insert(users).values(user).onConflictDoNothing().returning();
    return createUser;
}