import { ethers } from "ethers"
import { UNISWAPV2_ROUTER02_ABI, UNISWAPV2_ROUTER02_ADDRESS, WETH_ADDRESS } from "./config.js"
import { getProvider } from "./provider.js"
import { getUsers, updateUserPoints, updateUserTokens02 } from "../db/index.js"

const calculateXP = (initialPrice, currentPrice) => {
    const price_change = currentPrice - initialPrice
    let price_change_percent = undefined
    let points = 0

    if (price_change > 0) {
        price_change_percent = (price_change * 100) / initialPrice
    }

    if (price_change_percent >= 100) {
        points = Math.floor(price_change_percent / 100)
    }

    return { price_change, price_change_percent, points }
}

export const price = async (address) => {
    const uniswap = new ethers.Contract(
        UNISWAPV2_ROUTER02_ADDRESS,
        UNISWAPV2_ROUTER02_ABI,
        getProvider()
    )
    console.log(await uniswap.WETH())

    const amountsOut = await uniswap.getAmountsOut(
        ethers.parseEther("1"),
        [address, WETH_ADDRESS]
    )

    return ethers.formatEther(amountsOut[1])
}

export const getCurrentPrices = async () => {
    const users = await getUsers()
    console.log(users)

    if (users.length > 0 || users != undefined) {
        users.forEach(async user => {
            user.tokens.forEach(async token => {
                const quote = await price(token.address)
                console.log(quote)
    
                const _user = await updateUserTokens02(
                    user.chatId,
                    user.userId,
                    quote,
                    token.address
                )
                console.log(_user)
    
                const { price_change, price_change_percent, points } = calculateXP(token.initialPrice, quote)
                console.log(price_change, price_change_percent, points)
    
                if (points != undefined) {
                    const $user = await updateUserPoints(user.chatId, user.userId, points)
                    console.log($user)
                }
            })
        })
    }
}