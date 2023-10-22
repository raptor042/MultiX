import { getUser } from "../db/index.js"

export const userExists = async (userId, chatId) => {
    const user = await getUser(userId, chatId)
    console.log(user)

    return user ? true : false
}