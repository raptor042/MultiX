import { Telegraf } from "telegraf"
import { config } from "dotenv"
import { addUser, connectDB, getUsersInDesc, updateUserTokens01 } from "./db/index.js"
import { getCurrentPrices, price } from "./controllers/index.js"

config()

const URL = process.env.TELEGRAM_BOT_API

const bot = new Telegraf(URL)

bot.use(Telegraf.log())

bot.command("start", async ctx => {
    if (ctx.chat.type == "group") {
        const user = await addUser(
            ctx.message.from.username,
            ctx.chat.title,
            ctx.message.from.id,
            ctx.chat.id
        )
        console.log(user)
    
        ctx.reply(`Hello ${ctx.message.from.username}, My name is MultiX. I am a token tracker bot which is designed to keep track of tokens shilled by the users in this group. You can start shilling!!`)
    } else {
        ctx.reply("Add this bot to a group to begin using it.")
    }
})

bot.hears(/^0x/, async ctx => {
    const address = ctx.message.text
    console.log(address)

    const quote = await price(address)
    console.log(quote)

    const user = await updateUserTokens01(
        ctx.chat.id,
        ctx.message.from.id,
        address,
        quote
    )
    console.log(user)

    ctx.reply("Token Registered.")
})

bot.command("leaderboard", async ctx => {
    if (ctx.chat.type == "group") {
        const users = await getUsersInDesc(ctx.chat.id)
        console.log(users)

        users.forEach((user, index) => {
            ctx.replyWithHTML(`<b>${index + 1}.</b>\n<b>Username : ${user.username}</b>\n<b>Points(XP) : ${user.points}</b>\n<b>Tokens Shilled : ${user.tokens.length}</b>`)
        });
    } else {
        ctx.reply("Add this bot to a group to begin using it.")
    }
})

connectDB()

setInterval(getCurrentPrices, 60000)

bot.launch()