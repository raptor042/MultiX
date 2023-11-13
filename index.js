import { Telegraf, Markup } from "telegraf"
import { config } from "dotenv"
import { addTracking, addUser, connectDB, getChat, getUsersInDescI, getUsersInDescII, updateTracking, updateUserPointsAndXP, updateUserTokens01 } from "./db/index.js"
import { getCurrentPrices, getPrice } from "./controllers/index.js"
import { aggregate, chatExists, contractExists, extract, userExists } from "./controllers/misc.js"

config()

const URL = process.env.TELEGRAM_BOT_API

const bot = new Telegraf(URL)

bot.use(Telegraf.log())

bot.command("track", async ctx => {
    try { 
        if (ctx.message.chat.type != "private") {
            const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)
            const chat_exists = await chatExists(ctx.chat.id)

            if (!user_exists) {
                const user = await addUser(
                    ctx.message.from.username,
                    ctx.chat.title,
                    ctx.message.from.id,
                    ctx.chat.id
                )
                console.log(user)
            }
            if (!chat_exists) {
                const chat = await addTracking(
                    ctx.chat.id,
                    ctx.message.chat.type
                )
                console.log(chat)
            }

            await ctx.replyWithHTML(
                `<b>🏆 Track your group's alpha and earn $RAZE rewards accordingly!</b>\n\n<i>Powered by Raze.</i>`,
                {
                    parse_mode : "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("Enable CA Monitoring ✅", "enableCA")],
                        [Markup.button.callback("Disable CA Monitoring 🚫", "disableCA")],
                        [Markup.button.callback("Enable ECAs ✅", "enableECA")],
                        [Markup.button.callback("Disable ECAs 🚫", "disableECA")],
                        [Markup.button.callback("Reset Stats ⚠️", "reset")],
                        [Markup.button.url("Support", "https://t.me/NeutronCrypto")]
                    ])
                }
            )
        } else {
            await ctx.reply("Add this bot to a group to begin using it.")
        }
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.action("enableCA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "CA", "Enabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>Contract Tracking is enabled ✅</b>")
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.action("disableCA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "CA", "Disabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>Contract Tracking is disabled 🚫</b>")
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.action("enableECA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "ECA", "Enabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>ECA Tracking is enabled ✅</b>")
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.action("disableECA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "ECA", "Disabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>ECA Tracking is disabled 🚫</b>")
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.hears(/0x/, async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)
            const chat_exists = await chatExists(ctx.chat.id)

            if (!user_exists) {
                const user = await addUser(
                    ctx.message.from.username,
                    ctx.chat.title,
                    ctx.message.from.id,
                    ctx.chat.id
                )
                console.log(user)
            }
            if (!chat_exists) {
                const chat = await addTracking(
                    ctx.chat.id,
                    ctx.message.chat.type
                )
                console.log(chat)
            }
            

            const chat = await getChat(ctx.chat.id)

            if(chat.CA_tracking == "Enabled" || chat.ECA_tracking == "Enabled") {
                const address = extract(ctx.message.text)
                const contract_exists = await contractExists(address, ctx.chat.id)
                console.log(address, contract_exists)

                if(!contract_exists) {
                    const [token0, quote] = await getPrice(address)
                    console.log(token0, quote)

                    if(token0 == null && quote != null) {
                        const user = await updateUserTokens01(
                            ctx.chat.id,
                            ctx.message.from.id,
                            address,
                            quote
                        )
                        console.log(user)

                        if(quote > 0) {
                            await ctx.replyWithHTML(`<b>🚀 Contract detected, tracking Xs.</b>`)
                        } else {
                            await ctx.replyWithHTML(`<b>🚀 ECA detected, tracking Xs will begin once liquidity is added.</b>`)
                        }
                    } else if(token0 == null && quote == null) {
                        await ctx.replyWithHTML(`<b>🚫 Cannot track this address.</b>`)
                    } else {
                        const user = await updateUserTokens01(
                            ctx.chat.id,
                            ctx.message.from.id,
                            token0,
                            quote
                        )
                        console.log(user)

                        if(quote > 0) {
                            await ctx.replyWithHTML(`<b>🚀 Contract detected, tracking Xs.</b>`)
                        } else {
                            await ctx.replyWithHTML(`<b>🚀 ECA detected, tracking Xs will begin once liquidity is added.</b>`)
                        }
                    }
                } else {
                    await ctx.replyWithHTML(`<b>🚫 This token has already been shilled in this group.</b>`)
                }

            }
        } else {
            await ctx.reply("Add this bot to a group to begin using it.")
        }
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.command("leaderboard", async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)
            const chat_exists = await chatExists(ctx.chat.id)

            if (!user_exists) {
                const user = await addUser(
                    ctx.message.from.username,
                    ctx.chat.title,
                    ctx.message.from.id,
                    ctx.chat.id
                )
                console.log(user)
            }
            if (!chat_exists) {
                const chat = await addTracking(
                    ctx.chat.id,
                    ctx.message.chat.type
                )
                console.log(chat)
            }

            const users = await getUsersInDescI(ctx.chat.id)
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

            await ctx.replyWithHTML(markup)
        } else {
            await ctx.reply("Add this bot to a group to begin using it.")
        }
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.command("global", async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)
            const chat_exists = await chatExists(ctx.chat.id)

            if (!user_exists) {
                const user = await addUser(
                    ctx.message.from.username,
                    ctx.chat.title,
                    ctx.message.from.id,
                    ctx.chat.id
                )
                console.log(user)
            }
            if (!chat_exists) {
                const chat = await addTracking(
                    ctx.chat.id,
                    ctx.message.chat.type
                )
                console.log(chat)
            }

            const _users = await getUsersInDescII()
            const users = aggregate(_users)
            console.log(users)

            let markup = `<b>📊<u>Leaderboard</u>📊</b>\n\n<i>Most Xs provided by users in the entire ecosystem</i>\n\n`

            users.forEach((user, index) => {
                if (index == 0) {
                    const html = `<i>🏆 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.shilled}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xps}</i>\n\n`
                    markup += html
                } else if(index == 1) {
                    const html = `<i>🥈 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.shilled}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xps}</i>\n\n`
                    markup += html   
                } else if(index == 2) {
                    const html = `<i>🥉 @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.shilled}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xps}</i>\n\n`
                    markup += html   
                } else {
                    const html = `<i>${index + 1} @${user.username}</i>\n<i>🎯 <b>Points:</b> ${user.points}</i>\n<i>💰 <b>Tokens Shilled:</b> ${user.shilled}</i>\n<i>🚀 <b>Average Xs:</b> ${user.xps}</i>\n\n`
                    markup += html
                }
            })

            await ctx.replyWithHTML(markup)
        } else {
            await ctx.reply("Add this bot to a group to begin using it.")
        }
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

bot.action("reset", async ctx => {
    try {
        const users = await updateUserPointsAndXP(ctx.chat.id)
        console.log(users)

        await ctx.replyWithHTML("<b>The Leaderboard have been reset.</b>\n\n<b>Lets go again!!! 🚀</b>")
    } catch (err) {
        console.log("TG Error")
        // await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)

        bot.launch()
    }
})

connectDB()

setInterval(getCurrentPrices, 30000)

bot.launch()