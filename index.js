import { Telegraf, Markup } from "telegraf"
import { config } from "dotenv"
import { addTracking, addUser, connectDB, getChat, getUsersInDescI, getUsersInDescII, updateTracking, updateUserPointsAndXP, updateUserTokens01 } from "./__db__/index.js"
import { getCurrentPrices, getPrice } from "./__web3__/index.js"
import { aggregate, chatExists, contractExists, extract, userExists } from "./misc.js"

config()

const URL = process.env.TELEGRAM_BOT_API

const bot = new Telegraf(URL)

bot.use(Telegraf.log())

bot.command("start", async ctx => {
    await ctx.replyWithHTML(`<b>🏆 Track your group's alpha and earn rewards accordingly!</b>\n\n<i>Powered by AlphaDevBot.</i>`)
})

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
                `<b>🏆 Track your group's alpha and earn rewards accordingly!</b>\n\n<i>Powered by AlphaDevBot.</i>`,
                {
                    parse_mode : "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("Enable CA Monitoring ✅", "enableCA")],
                        [Markup.button.callback("Disable CA Monitoring 🚫", "disableCA")],
                        [Markup.button.callback("Enable ECAs ✅", "enableECA")],
                        [Markup.button.callback("Disable ECAs 🚫", "disableECA")],
                        [Markup.button.callback("Reset Stats ⚠️", "reset")]
                    ])
                }
            )
        } else {
            await ctx.reply("⚠️ Add this bot to a group to begin using it.")
        }
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
    }
})

bot.action("enableCA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "CA", "Enabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>Contract Tracking is enabled ✅</b>")
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
    }
})

bot.action("disableCA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "CA", "Disabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>Contract Tracking is disabled 🚫</b>")
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
    }
})

bot.action("enableECA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "ECA", "Enabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>ECA Tracking is enabled ✅</b>")
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
    }
})

bot.action("disableECA", async ctx => {
    try {
        const chat = await updateTracking(ctx.chat.id, "ECA", "Disabled")
        console.log(chat)

        await ctx.replyWithHTML("<b>ECA Tracking is disabled 🚫</b>")
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
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
                    const quote = await getPrice(address)

                    if(quote != null) {
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
                    } else {
                        await ctx.replyWithHTML(`<b>🚫 Cannot track this address.</b>`)
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
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
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
            await ctx.reply("⚠️ Add this bot to a group to begin using it.")
        }
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
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
            await ctx.reply("⚠️ Add this bot to a group to begin using it.")
        }
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
    }
})

bot.action("reset", async ctx => {
    try {
        const users = await updateUserPointsAndXP(ctx.chat.id)
        console.log(users)

        await ctx.replyWithHTML("<b>The Leaderboard have been reset.</b>\n\n<b>Lets go again!!! 🚀</b>")
    } catch (err) {
        console.log("TG Error")
        await ctx.replyWithHTML(`<b>🚫 Sorry for the Inconveniences.</b>`)
    }
})

connectDB()

setInterval(getCurrentPrices, 30 * 1000)

bot.launch()