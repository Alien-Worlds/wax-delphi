const okx = require("./okx_pair");

const extract_pair = okx.extract_pair;

describe('extract_pair', () => {

    it('should return the expected output when valid JSON input is provided for a small amount', () => {
        const json = {
            code: "0",
            msg: "",
            data: [
                {
                    instId: "WAXP-USD",
                    idxPx: "0.0618",
                    high24h: "0.0618",
                    sodUtc0: "0.0595",
                    open24h: "0.0612",
                    low24h: "0.0593",
                    sodUtc8: "0.0615",
                    ts: "1705325817544"
                }
            ]
        }
        const expectedOutput = {
            pair: 'waxpusd',
            value: 618
        };

        const result = extract_pair(json, 'waxpusd', 4);

        expect(result).toEqual(expectedOutput);
    });

    // Tests that valid JSON input with a zero price returns the expected output
    it('should return the expected output when valid JSON input with a zero price is provided', () => {
        const json = {
            code: "0",
            msg: "",
            data: [
                {
                    instId: "WAXP-USD",
                    idxPx: "0.0",
                    high24h: "0.0618",
                    sodUtc0: "0.0595",
                    open24h: "0.0612",
                    low24h: "0.0593",
                    sodUtc8: "0.0615",
                    ts: "1705325817544"
                }
            ]
        };
        const expectedOutput = {
            pair: 'waxpusd',
            value: 0
        };

        const result = extract_pair(json, 'waxpusd', 4);

        expect(result).toEqual(expectedOutput);
    });

    // Tests that valid JSON input with a large price returns the expected output
    it('should return the expected output when valid JSON input with a large price is provided', () => {
        const json = {
            code: "0",
            msg: "",
            data: [
                {
                    instId: "WAXP-USD",
                    idxPx: "123456.1234",
                    high24h: "0.0618",
                    sodUtc0: "0.0595",
                    open24h: "0.0612",
                    low24h: "0.0593",
                    sodUtc8: "0.0615",
                    ts: "1705325817544"
                }
            ]
        };
        const expectedOutput = {
            pair: 'waxpusd',
            value: 1234561234
        };

        const result = extract_pair(json, 'waxpusd', 4);

        expect(result).toEqual(expectedOutput);
    });

    // Tests that valid JSON input with a small price returns the expected output
    it('should return the expected output when valid JSON input with a smallest price is provided', () => {
        const json = {
            code: "0",
            msg: "",
            data: [
                {
                    instId: "WAXP-USD",
                    idxPx: "0.0001",
                    high24h: "0.0618",
                    sodUtc0: "0.0595",
                    open24h: "0.0612",
                    low24h: "0.0593",
                    sodUtc8: "0.0615",
                    ts: "1705325817544"
                }
            ]
        };
        const expectedOutput = {
            pair: 'waxpusd',
            value: 1
        };

        const result = extract_pair(json, 'waxpusd', 4);

        expect(result).toEqual(expectedOutput);
    });

    // Tests that invalid JSON input returns null
    it('should return null when invalid JSON input is provided', () => {
        const json = null;

        const result = extract_pair(json);

        expect(result).toBeNull();
    });
});
