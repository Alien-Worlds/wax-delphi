const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType } = require('@uniswap/sdk');
const ethers = require('ethers');

const url = 'https://mainnet.infura.io/v3/9ae811d1c04243f2869a05848207b985';
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

const chainId = ChainId.MAINNET;
const tokenAddress = '0x7a2Bc711E19ba6aff6cE8246C546E8c4B4944DFD'

const uniswap = async () => {
    const waxe = await Fetcher.fetchTokenData(chainId, tokenAddress, customHttpProvider);
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(waxe, weth, customHttpProvider);
    // console.log(pair)
    const route = new Route([pair], weth);
    // const trade = new Trade(route, new TokenAmount(weth, '100000000000000000'), TradeType.EXACT_INPUT);

    const multiplier = Math.pow(10, 5)

    const waxpeth = Math.round(parseFloat(route.midPrice.invert().toSignificant(6)) * multiplier)
    return { pair: 'waxpeth', value: waxpeth }
}

module.exports = uniswap