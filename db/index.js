import mongoose, { connect } from "mongoose"
import dotenv from "dotenv"
import { ChatModel, UserModel } from "./models/index.js"

const { config } = dotenv

config()

const URI = process.env.MONGO_URI

export const connectDB = async () => {
    try {
        await connect(`${URI}`)
        console.log("Connection to the Database was successful.")
    } catch(err) {
        console.log(err)
    }
}

export const getUser = async (userId, chatId) => {
    try {
        const user = await UserModel.findOne({ userId : userId, chatId : chatId })

        return user
    } catch (err) {
        console.log(err)
    }
}

export const getChat = async (chatId) => {
    try {
        const chat = await ChatModel.findOne({ chatId : chatId })

        return chat
    } catch (err) {
        console.log(err)
    }
}

export const getUsers = async () => {
    try {
        const users = await UserModel.find()

        return users
    } catch (err) {
        console.log(err)
    }
}

export const getUsersInDescI = async (chatId) => {
    try {
        const users = await UserModel.find({ chatId : chatId }).sort({ points : -1 })

        return users
    } catch (err) {
        console.log(err)
    }
}

export const getUsersInDescII = async (chatId) => {
    try {
        const users = await UserModel.find().sort({ points : -1 })

        return users
    } catch (err) {
        console.log(err)
    }
}

export const addUser = async (username, chat, userId, chatId) => {
    try {
        const user = new UserModel({
            chat : chat,
            username : username,
            chatId : chatId,
            userId : userId
        })

        const data = await user.save()

        return data
    } catch (err) {
        console.log(err)
    }
}

export const addTracking = async (chatId, type) => {
    try {
        const chat = new ChatModel({
            chatId : chatId,
            type : type
        })

        const data = await chat.save()

        return data
    } catch (err) {
        console.log(err)
    }
}

export const updateTracking = async (chatId, entity, tracking) => {
    try {
        if(entity == "CA") {
            const chat = await ChatModel.findOneAndUpdate(
                { chatId : chatId },
                { $set : { CA_tracking : tracking } }
            )
    
            return chat
        } else {
            const chat = await ChatModel.findOneAndUpdate(
                { chatId : chatId },
                { $set : { ECA_tracking : tracking } }
            )
    
            return chat
        }
    } catch (err) {
        console.log(err)
    }
}

export const updateUserTokens01 = async (chatId, userId, address, price) => {
    try {
        const token = {
            address : address,
            initialPrice : price,
            currentPrice : price
        }

        const user = await UserModel.findOneAndUpdate(
            { chatId : chatId, userId : userId }, 
            { $push : { tokens : [token] } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUserTokens02 = async (chatId, userId, price, address) => {
    try {
        const user = await UserModel.findOneAndUpdate(
            { chatId : chatId, userId : userId, tokens : { $elemMatch : { address : address } } },
            { $set : { "tokens.$.currentPrice" : price } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const findToken = async (chatId, address) => {
    try {
        const user = await UserModel.findOne(
            { chatId : chatId, tokens : { $elemMatch : { address : address } } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUserPoints = async (chatId, userId, points) => {
    try {
        const user = await UserModel.findOneAndUpdate(
            { chatId : chatId, userId : userId }, 
            { $inc : { points : points } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUserXP = async (chatId, userId, xp) => {
    try {
        const user = await UserModel.findOneAndUpdate(
            { chatId : chatId, userId : userId },
            { $set : { xp : xp } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUserPointsAndXP = async (chatId) => {
    try {
        const user = await UserModel.updateMany(
            { chatId : chatId },
            { $set : { points : 0, xp : 0.0, tokens : [] } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const deleteUsers = async (chatId) => {
    try {
        const user = await UserModel.deleteMany({ chatId : chatId })

        return user
    } catch (err) {
        console.log(err)
    }
}