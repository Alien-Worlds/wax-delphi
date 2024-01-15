#!/usr/bin/env node


const { Api, JsonRpc } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const fetch = require("node-fetch");

const config = require('./config');
const bittrex_pairs = require('./bittrex_pairs');
const uniswap = require('./uniswap');

const binance = require('./binance_pair');
const okxpair = require('./okx_pair');

const rpc = new JsonRpc(config.endpoint, { fetch });
const signatureProvider = new JsSignatureProvider([config.private_key]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const required_pairs = ['waxpbtc', 'waxpeth', 'waxpusd', 'usdtusd', 'usdcusd'];

/**
 * 
 * @returns { Promise<{ [key: string]: { active: number, bounty_awarded: number, bounty_edited_by_custodians: number, proposer: string, name: string, bounty_amount: string, approving_custodians: string[], approving_oracles: string[], base_symbol: string, base_type: number, base_contract: string, quote_symbol: string, quote_type: number, quote_contract: string, quoted_precision: number } } }> }
 */
const get_pairs_from_delphi_contract = async () => {
    try {
        /**
         * @type { { rows: { active: number, bounty_awarded: number, bounty_edited_by_custodians: number, proposer: string, name: string, bounty_amount: string, approving_custodians: string[], approving_oracles: string[], base_symbol: string, base_type: number, base_contract: string, quote_symbol: string, quote_type: number, quote_contract: string, quoted_precision: number }[] } }
         */
        const res = await rpc.get_table_rows({
            json: true,
            code: 'delphioracle',
            scope: 'delphioracle',
            table: 'pairs'
        });

        if (res.rows.length) {
            /**
             * @type { { [key: string]: any } }
             */
            const pairs = {};
            res.rows.forEach((row) => {
                if (row.active) {
                    pairs[row.name] = row;
                }
            });
            return pairs
        }
    }
    catch (e) {
        throw new Error('Error fetching pairs from delphioracle: ' + e.message)
    }
};

/**
 * 
 * @param push_quotes { {pair: string;value: number}[]}
 * @returns { Promise<{ transaction_id: string }>
 */
const push_quotes_to_contract = async (push_quotes) => {
    try {
        const actions = [{
            account: 'delphioracle',
            name: 'write',
            authorization: [{
                actor: config.account,
                permission: config.permission
            }],
            data: {
                owner: config.account,
                quotes: push_quotes
            }
        }];

        const push_res = await api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        });

        return push_res;
    } catch (e) {
        throw new Error('Error pushing pairs to delphioracle contract: ' + e.message)
    }
};

const send_quotes = async () => {
    try {
        const pairs = await get_pairs_from_delphi_contract();

        /**
         * @type { { pair: string, value: number }[] }
         */
        let quotes = [];

        // const bittrex_pairs_result = await bittrex_pairs(pairs, required_pairs)
        // if (bittrex_pairs_result.length) {
        //     quotes = quotes.concat(bittrex_pairs_result);
        // }

        const waxpeth = await uniswap();
        if (waxpeth) {
            quotes.push(waxpeth);
        }

        const waxpbtc = await binance.get_quote();
        if (waxpbtc) {
            quotes.push(waxpbtc);
        }

        const waxpusd = await okxpair.get_quote("WAXP-USD", "waxpusd", 4);
        if (waxpusd) {
            quotes.push(waxpusd);
        }

        const usdcusd = await okxpair.get_quote("USDC-USD", "usdcusd", 4);
        if (usdcusd) {
            quotes.push(usdcusd);
        }

        const usdtusd = await okxpair.get_quote("USDT-USD", "usdtusd", 4);
        if (usdtusd) {
            quotes.push(usdtusd);
        }





        console.log('quotes:', quotes);
        const response = await push_quotes_to_contract(quotes);

        console.log(`Pushed transaction ${response.transaction_id}`);
    }
    catch (e) {
        console.log(e.message)
    }
};

const run = async () => {
    send_quotes();
    const interval = config.interval * 1000 || 60 * 2 * 1000;
    setInterval(send_quotes, interval);
};

run();
