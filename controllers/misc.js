import { findToken, getChat, getUser } from "../db/index.js"

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

export const contractExists = async (address, chatId) => {
    const contract = await findToken(chatId, address)
    console.log(contract)

    return contract ? true : false
}

export const extract = (str) => {
    const startIndex = str.indexOf("0x")
    const endIndex = startIndex + 42
    console.log(startIndex, endIndex)

    const address = str.slice(startIndex, endIndex)

    return address
}