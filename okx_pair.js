

/**
 * 
 * @returns { Promise<{ symbol: string, price: string }> }
 */
const get_raw_quote = async (symbol) => {
    const url = `https://www.okx.com/api/v5/market/index-tickers?instId=${symbol}`;

    const res = await fetch(url);
    const json = await res.json();

    return json;
};

/**
 * 
 * @param { {symbol: string, price: string}} json 
 * @returns { { pair: string, value: number }
 */
function extract_pair(json, sym_id, precision) {
    if (!json) {
        return null;
    }
    // console.log(json)
    const price = parseFloat(json.data[0].idxPx);
    if (isNaN(price)) {
        // handle the exception, e.g. return a default value or throw an error
        return { pair: sym_id, value: 0 };
    }

    const multiplier = Math.pow(10, precision);
    return { pair: sym_id, value: Math.round(price * multiplier) };
}

const get_quote = async (symbol, sym_id, precision) => {
    const json = await get_raw_quote(symbol);
    return extract_pair(json, sym_id, precision);
}

module.exports = { extract_pair, get_quote, get_raw_quote }