

/**
 * 
 * @returns { Promise<{ symbol: string, price: string }> }
 */
const get_raw_quote = async () => {
    const url = 'https://api.binance.com/api/v3/ticker/price?symbol=WAXPBTC';

    const res = await fetch(url);
    const json = await res.json();

    return json;
};

/**
 * 
 * @param { {symbol: string, price: string}} json 
 * @returns { { pair: string, value: number }
 */
function extract_pair(json) {
    if (!json) {
        return null;
    }
    const price = parseFloat(json.price);
    if (isNaN(price)) {
        // handle the exception, e.g. return a default value or throw an error
        return { pair: 'waxpbtc', value: 0 };
    }

    const multiplier = Math.pow(10, 8);
    return { pair: 'waxpbtc', value: Math.round(price * multiplier) };
}

const get_quote = async () => {
    const json = await get_raw_quote();
    return extract_pair(json);
}

module.exports = { extract_pair, get_quote, get_raw_quote }