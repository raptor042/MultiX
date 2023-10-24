import { getChat, getUser } from "../db/index.js"

export const userExists = async (userId, chatId) => {
    const user = await getUser(userId, chatId)
    console.log(user)

    return user ? true : false
}

export const chatExists = async (chatId) => {
    const chat = await getChat(chatId)
    console.log(chat)

    return chat ? true : false
}