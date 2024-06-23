import { ethers } from "ethers"
import { UNISWAPV2_FACTORY_ABI, UNISWAPV2_FACTORY_ADDRESS, UNISWAPV2_PAIR_ABI, UNISWAPV2_ROUTER02_ABI, UNISWAPV2_ROUTER02_ADDRESS, WETH_ADDRESS } from "./config.js"
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
    const factory = new ethers.Contract(
        UNISWAPV2_FACTORY_ADDRESS,
        UNISWAPV2_FACTORY_ABI.abi,
        getProvider()
    )

    const pair = await factory.getPair(address, WETH_ADDRESS)
    console.log(pair)

    return pair
}

export const price = async (address) => {
    const pair = new ethers.Contract(
        address,
        UNISWAPV2_PAIR_ABI.abi,
        getProvider()
    )

    const reserves = await pair.getReserves()
    console.log(reserves)

    const quote = Number(ethers.formatEther(reserves[1])) / Number(ethers.formatEther(reserves[0]))
    console.log(quote)

    return quote
}

export const getPrice = async (address) => {
    try {
        const pair = await getPair(address)
        const quote = await price(pair)

        return quote
    } catch (err) {
        console.log(err)

        return null
    }
}

export const getCurrentPrices = async () => {
    const users = await getUsers()

    if (users.length > 0 || users != undefined) {
        users.forEach(async user => {
            const tokens = user.tokens.length

            user.tokens.forEach(async token => {
                const quote = await getPrice(token.address)
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