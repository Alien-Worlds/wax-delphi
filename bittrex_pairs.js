
/**
 * 
 * @returns { Promise<{ symbol: string, high: string, low: string }[]> }
 */
const get_bittrex_quotes = async () => {
    const url = 'https://api.bittrex.com/v3/markets/summaries';

    const res = await fetch(url);
    const json = await res.json();


    const wax_markets = json.filter((q) => {
        return q.symbol.match(/^(USDT)|^(USDC)|^(USD)|^(WAXP)/);
    });

    return wax_markets;
};

/**
 * @param { { symbol: string, high: string, low: string }[] } bittrex_pairs_raw
 * @param { {[key: string]: {quoted_precision: number} } } pairs 
 * @param {*} required_pairs 
 * @returns { Promise<{ "pair": string, "value": number }[]> }
 */
const extract_bittrex_pairs = (bittrex_pairs_raw, pairs, required_pairs) => {
    return bittrex_pairs_raw
        .map(q => {
            // Change the symbol format to match our format 'WAX-BTC' -> 'waxbtc'
            const our_pair = q.symbol.toLowerCase().replace('-', '');
            return { ...q, symbol: our_pair }
        })
        .filter(q => {
            // filter to only include our required pairs
            return required_pairs.includes(q.symbol)
        })
        .map(q => {
            // calculate the average value and scale to the required precision
            const pair = pairs[q.symbol];
            let quote_precision = pair.quoted_precision;
            const multiplier = Math.pow(10, quote_precision)

            let avg = (+q.high + +q.low) / 2
            return {
                pair: q.symbol,
                value: Math.round(parseFloat(avg) * multiplier)
            }
        })
}

const bittrex_pairs = async (pairs, required_pairs) => {
    const raw = await get_bittrex_quotes();
    return extract_bittrex_pairs(raw, pairs, required_pairs)
}



module.exports = { bittrex_pairs, extract_bittrex_pairs, get_bittrex_quotes }