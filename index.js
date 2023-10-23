import { Telegraf, Markup } from "telegraf"
import { config } from "dotenv"
import { addUser, connectDB, getUser, getUsersInDesc, updateUserPointsAndXP, updateUserTokens01, updateUsersCATracking, updateUsersECATracking } from "./db/index.js"
import { getCurrentPrices, price } from "./controllers/index.js"
import { userExists } from "./controllers/misc.js"

config()

const URL = process.env.TELEGRAM_BOT_API

const bot = new Telegraf(URL)

bot.use(Telegraf.log())

bot.command("track", async ctx => {
    if (ctx.chat.type == "group" || "supergroup" || "channel") {
        const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

        if (!user_exists) {
            const user = await addUser(
                ctx.message.from.username,
                ctx.chat.title,
                ctx.message.from.id,
                ctx.chat.id
            )
            console.log(user)
        }

        const user = await getUser(ctx.message.from.id, ctx.chat.id)
        
        if(user.CA_tracking == "Enabled" && user.ECA_tracking == "Enabled") {
            ctx.replyWithHTML(
                `<b>🏆 The first bot to track who truly provides the most Xs!</b>\n\n<i>Powered by MultiX.</i>`,
                {
                    parse_mode : "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("Disable CA Monitoing 🚫", "disableCA")],
                        [Markup.button.callback("Disable ECAs 🚫", "disableECA")],
                        [Markup.button.callback("Reset Stats ⚠️", "reset")]
                    ])
                }
            )
        } else if(user.CA_tracking == "Disabled" && user.ECA_tracking == "Disabled") {
            ctx.replyWithHTML(
                `<b>🏆 The first bot to track who truly provides the most Xs!</b>\n\n<i>Powered by MultiX.</i>`,
                {
                    parse_mode : "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("Enable CA Monitoing ✅", "enableCA")],
                        [Markup.button.callback("Enable ECAs ✅", "enableECA")],
                        [Markup.button.callback("Reset Stats ⚠️", "reset")]
                    ])
                }
            )
        } else if(user.CA_tracking == "Enabled" && user.ECA_tracking == "Disabled") {
            ctx.replyWithHTML(
                `<b>🏆 The first bot to track who truly provides the most Xs!</b>\n\n<i>Powered by MultiX.</i>`,
                {
                    parse_mode : "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("Disable CA Monitoing 🚫", "disableCA")],
                        [Markup.button.callback("Enable ECAs ✅", "enableECA")],
                        [Markup.button.callback("Reset Stats ⚠️", "reset")]
                    ])
                }
            )
        } else if(user.CA_tracking == "Disabled" && user.ECA_tracking == "Enabled") {
            ctx.replyWithHTML(
                `<b>🏆 The first bot to track who truly provides the most Xs!</b>\n\n<i>Powered by MultiX.</i>`,
                {
                    parse_mode : "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("Enable CA Monitoing ✅", "enableCA")],
                        [Markup.button.callback("Disable ECAs 🚫", "disableECA")],
                        [Markup.button.callback("Reset Stats ⚠️", "reset")]
                    ])
                }
            )
        }
    } else {
        ctx.reply("Add this bot to a group to begin using it.")
    }
})

bot.action("enableCA", async ctx => {
    const users = await updateUsersCATracking(ctx.chat.id, "Enabled")
    console.log(users)

    ctx.replyWithHTML("<b>Contract tracking enabled ✅.</b>\n\n<b>Lets go!!! 🚀</b>")
})

bot.action("disableCA", async ctx => {
    const users = await updateUsersCATracking(ctx.chat.id, "Disabled")
    console.log(users)

    ctx.replyWithHTML("<b>Contract tracking disabled 🚫.</b>")
})

bot.action("enableECA", async ctx => {
    const users = await updateUsersECATracking(ctx.chat.id, "Enabled")
    console.log(users)

    ctx.replyWithHTML("<b>Early Contract tracking enabled ✅.</b>\n\n<b>Lets go!!! 🚀</b>")
})

bot.action("disableECA", async ctx => {
    const users = await updateUsersECATracking(ctx.chat.id, "Disabled")
    console.log(users)

    ctx.replyWithHTML("<b>Early Contract tracking disabled 🚫.</b>")
})

bot.hears(/^0x/, async ctx => {
    if (ctx.chat.type == "group" || "supergroup" || "channel") {
        const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

        if (!user_exists) {
            const user = await addUser(
                ctx.message.from.username,
                ctx.chat.title,
                ctx.message.from.id,
                ctx.chat.id
            )
            console.log(user)
        }

        const user = await getUser(ctx.message.from.id, ctx.chat.id)

        if(user.CA_tracking == "Enabled" || user.ECA_tracking == "Enabled") {
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
        } else if(user.tracking == "Disabled") {
            ctx.replyWithHTML("<b>Contract tracking is disabled 🚫.</b>")
        }
    } else {
        ctx.reply("Add this bot to a group to begin using it.")
    }
})

bot.command("leaderboard", async ctx => {
    if (ctx.chat.type == "group" || "supergroup" || "channel") {
        const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

        if (!user_exists) {
            const user = await addUser(
                ctx.message.from.username,
                ctx.chat.title,
                ctx.message.from.id,
                ctx.chat.id
            )
            console.log(user)
        }

        const users = await getUsersInDesc(ctx.chat.id)
        console.log(users)

        let markup = `<b>📊<u>Leaderboard</u>📊</b>\n\n<i>Most Xs provided by users in this group</i>\n\n`

        users.forEach((user, index) => {
            if (index == 0) {
                const html = `<i>🏆 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>\n\n`
                markup += html
            } else if(index == 1) {
                const html = `<i>🥈 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>\n\n`
                markup += html   
            } else if(index == 2) {
                const html = `<i>🥉 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>\n\n`
                markup += html   
            } else {
                const html = `<i>${index + 1} @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.tokens.length}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xp}</i>\n\n`
                markup += html
            }
        })

        ctx.replyWithHTML(markup)
    } else {
        ctx.reply("Add this bot to a group to begin using it.")
    }
})

bot.action("reset", async ctx => {
    const users = await updateUserPointsAndXP(ctx.chat.id)
    console.log(users)

    ctx.replyWithHTML("<b>The Leaderboard have been reset.</b>\n\n<b>Lets go again!!! 🚀</b>")
})

connectDB()

setInterval(getCurrentPrices, 60000)

bot.launch()