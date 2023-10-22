import { Telegraf, Markup } from "telegraf"
import { config } from "dotenv"
import { addUser, connectDB, deleteUsers, getUsersInDesc, updateUserTokens01 } from "./db/index.js"
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
    
        ctx.replyWithHTML(
            `<b>🏆 The first bot to track who truly provides the most Xs!</b>\n\n<i>Powered by MultiX.</i>`,
            {
                parse_mode : "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("CA Monitoing ✅", "CA")],
                    [Markup.button.callback("ECAs ✅", "ECAs")],
                    [Markup.button.callback("Reset Stats 🚫", "reset")]
                ])
            }
        )
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

    ctx.replyWithHTML(`<b>🚀 Contract detected, tracking Xs.</b>`)
})

bot.command("leaderboard", async ctx => {
    if (ctx.chat.type == "group") {
        const users = await getUsersInDesc(ctx.chat.id)
        console.log(users)

        let markup = `<b>📊<u>Leaderboard</u>📊</b>\n\n<i>Most Xs provided by users in this group</i>\n\n`

        users.forEach((user, index) => {
            if (index == 0) {
                const html = `<i>🏆 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>`
                markup += html
            } else if(index == 1) {
                const html = `<i>🥈 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>`
                markup += html   
            } else if(index == 1) {
                const html = `<i>🥉 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>`
                markup += html   
            } else {
                const html = `<i>${index + 1} @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>`
                markup += html
            }
        })
        console.log(markup)

        ctx.replyWithHTML(markup)
    } else {
        ctx.reply("Add this bot to a group to begin using it.")
    }
})

bot.action("reset", async ctx => {
    const users = await deleteUsers(ctx.chat.id)
    console.log(users)

    ctx.replyWithHTML("<b>Contract tracking disabled 🚫.</b>")
})

connectDB()

setInterval(getCurrentPrices, 60000)

bot.launch()