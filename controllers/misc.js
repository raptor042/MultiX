import { findToken, getChat, getUser } from "../db/index.js"

const exists = (users, userID) => {
    let _exists = false

    users.forEach(user => {
        if(user.userId == userID) {
            _exists = true
        }
    })

    return _exists
}

export const aggregate = users => {
    let _users = []

    users.forEach((user) => {
        const exist = exists(_users, user.userId)
        console.log(exist)

        if(!exist) {
            const filtered_users = users.filter((_user) => user.userId == _user.userId)
            const points = filtered_users.reduce((acc, current) => acc + current.points, 0)
            const xps = filtered_users.reduce((acc, current) => acc + current.xp, 0)
            const shilled = filtered_users.reduce((acc, current) => acc + current.tokens.length, 0)

            _users.push({
                points,
                xps,
                shilled,
                username : user.username,
                userId : user.userId
            })
        }
    })

    return _users
}

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