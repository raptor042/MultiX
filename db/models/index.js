import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
    chat : String,
    chatId : { type : Number, required : true },
    username : String,
    userId : { type : Number, required : true },
    points : { type : Number, default : 0 },
    xp : { type : mongoose.Types.Decimal128, default : new mongoose.Types.Decimal128("0.0") },
    tokens : [
        {
            address : String,
            initialPrice : Number,
            currentPrice : Number
        }
    ]
})

export const UserModel = model("User", UserSchema)