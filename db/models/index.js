import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
    chat : String,
    chat_id : { type : String, required : true, unique : true },
    username : String,
    user_id : { type : String, required : true, unique : true },
    points : { type : mongoose.Types.Decimal128, default : new mongoose.Types.Decimal128("0.0") },
    tokens : [
        {
            address : String,
            initialPrice : Number,
            currentPrice : Number
        }
    ]
})

export const UserModel = model("User", UserSchema)