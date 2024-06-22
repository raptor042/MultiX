import { ethers } from "ethers"
import { UNISWAPV2_PAIR_ABI, UNISWAPV2_ROUTER02_ABI, UNISWAPV2_ROUTER02_ADDRESS, WETH_ADDRESS } from "./config.js"
import { getProvider } from "./provider.js"
import { getUsers, updateUserPoints, updateUserTokens02, updateUserXP } from "../__db__/index.js"

const calculateXP = (initialPrice, currentPrice) => {
    const price_change = currentPrice - initialPrice
    let price_change_percent = 0
    let points = 0

    if (price_change > 0) {
        price_change_percent = (price_change * 100) / initialPrice
    }

    if (price_change_percent >= 100) {
        points = Math.floor(price_change_percent / 100)
    }

    return { price_change, price_change_percent, points }
}

export const getPair = async (address) => {
    const uniswap = new ethers.Contract(
        address,
        UNISWAPV2_PAIR_ABI,
        getProvider()
    )

    return [
        await uniswap.token0(),
        await uniswap.token1()
    ]
}

export const price = async (address) => {
    const uniswap = new ethers.Contract(
        UNISWAPV2_ROUTER02_ADDRESS,
        UNISWAPV2_ROUTER02_ABI,
        getProvider()
    )

    const amountsOut = await uniswap.getAmountsOut(
        ethers.parseEther("1"),
        [address, WETH_ADDRESS]
    )

    return ethers.formatEther(amountsOut[1])
}

export const getPrice = async (address) => {
    let quote = null

    try {
        const [token0, _] = await getPair(address)
        console.log(token0)

        quote = await price(token0)
        console.log(quote)

        return [token0, quote]
    } catch (err) {
        console.log(err)

        quote = await price(address)
        console.log(quote)

        return [null, quote]
    } finally {
        if (quote == null) {
            return [null, null]
        }
    }
}

export const getCurrentPrices = async () => {
    const users = await getUsers()

    if (users.length > 0 || users != undefined) {
        users.forEach(async user => {
            const tokens = user.tokens.length

            user.tokens.forEach(async token => {
                const [_, quote] = await getPrice(token.address)
                const _user = await updateUserTokens02(
                    user.chatId,
                    user.userId,
                    quote,
                    token.address
                )
    
                const { price_change, price_change_percent, points } = calculateXP(token.initialPrice, quote)
                console.log(price_change, price_change_percent, points, "points")
    
                if (points != 0) {
                    const $user = await updateUserPoints(user.chatId, user.userId, points)
                    // console.log($user)
                }

                const totalPoints = user.points + points
                const xp = totalPoints / tokens
                console.log(tokens, totalPoints, xp, "xp")
                
                const user_ = await updateUserXP(user.chatId, user.userId, xp)
            })   
        })
    }
}