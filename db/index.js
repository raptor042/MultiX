import mongoose, { connect } from "mongoose"
import dotenv from "dotenv"
import { UserModel } from "./models/index.js"

const { config } = dotenv

config()

const URI = process.env.MONGO_URI

export const connectDB = async () => {
    try {
        await connect(`${URI}`, { useNewUrlParser : true, useUnifiedTopology : true })
        console.log("Connection to the Database was successful.")
    } catch(err) {
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

export const getUsersInDesc = async (chat_id) => {
    try {
        const users = await UserModel.find({ chat_id : chat_id }).sort({ points : -1 })

        return users
    } catch (err) {
        console.log(err)
    }
}

export const addUser = async (username, chat, user_id, chat_id) => {
    try {
        const user = new UserModel({
            chat : chat,
            username : username,
            chat_id : chat_id,
            user_id : user_id
        })

        const data = await user.save()

        return data
    } catch (err) {
        console.log(err)
    }
}

export const updateUserTokens01 = async (chat_id, user_id, address, price) => {
    try {
        const token = {
            address : address,
            initialPrice : price,
            currentPrice : price
        }

        const user = await UserModel.findOneAndUpdate(
            { chat_id : chat_id, user_id : user_id }, 
            { $push : { tokens : [token] } })

        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUserTokens02 = async (chat_id, user_id, price, address) => {
    try {
        const user = await UserModel.findOneAndUpdate(
            { chat_id : chat_id, user_id : user_id, tokens : { $elemMatch : { address : address } } },
            { $set : { "tokens.$.currentPrice" : price } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUserPoints = async (chat_id, user_id, points) => {
    try {
        const user = await UserModel.findOneAndUpdate(
            { chat_id : chat_id, user_id : user_id }, 
            { $add : { points : new mongoose.Types.Decimal128(`${points}`) } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}