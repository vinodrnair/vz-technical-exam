const Services = require('../transactionService');
const Cache = require('../cache');

jest.mock('../cache.js', () => ({
    get: jest.fn((key) => key=== 'balance' ? 1000 : [{id: 'TEST1'}, {id: 'TEST2'}]),
    put: jest.fn()
}));



describe('getBalance function', () => {
    it('gets the balance from the cache', () => {
        const result = Services.getBalance();
        expect(result).toBe(1000);
    });
});

describe('getTransaction function', () => {
    it('fetches all transactions if no id is provided', () => {
        const result = Services.getTransaction();
        expect(result).toStrictEqual([{id: 'TEST1'}, {id: 'TEST2'}]);
    });

    it('fetches only the relevant transaction if a valid id is provided', () => {
        const result = Services.getTransaction('TEST2');
        expect(result).toStrictEqual({id: 'TEST2'});
    });

    it('returns undefined if an invalid id is provided', () => {
        const result = Services.getTransaction('TEST8');
        expect(result).toBe(undefined);
    });
});

describe('validateTransaction function', () => {
    describe('returns appropriate error message when', () => {
        it('Transaction type is missing', () => {
            const resp = Services.validateTransaction({ amount: '100'});
            expect(resp).toBe('Transaction type missing');
        });

        it('Transaction type is invalid', () => {
            const resp = Services.validateTransaction({ type: 'xyz', amount: 50});
            expect(resp).toBe('Invalid transaction type');
        });

        it('Transaction amount is missing', () => {
            const resp = Services.validateTransaction({ type: 'credit'});
            expect(resp).toBe('Transaction amount missing');
        });

        it('Transaction amount is not a number', () => {
            const resp = Services.validateTransaction({ type: 'credit', amount: '3abc'});
            expect(resp).toBe('Transaction amount must be a number');
        });
    });

    it('Returns no error message if the transaction json is valid', () => {
        const resp = Services.validateTransaction({ type: 'credit', amount: 500});
        expect(resp).toBe(undefined);
    });
});

describe('validateDebitTransaction function', () => {
    it('returns true if debit amount is less than or equal to the balance', () => {
        const resp1 = Services.validateDebitTransaction({ type: 'debit', amount: 500});
        expect(resp1).toBe(true);
        const resp2 = Services.validateDebitTransaction({ type: 'debit', amount: 1000});
        expect(resp2).toBe(true);
    });

    it('returns false if debit amount is greater than the balance', () => {
        const resp = Services.validateDebitTransaction({ type: 'debit', amount: 1001});
        expect(resp).toBe(false);
    });
});

describe('doTransaction function', () => {
    it('sets the correct balance and transaction record in case of credit transaction', () => {
        Cache.get.mockImplementation((input) => {
            if(input === 'transactions') {
                return []
            }
            return 1000; //balance
        });
        Cache.put.mockImplementation(jest.fn());
        Services.doTransaction({ type: 'credit', amount: 100});
        expect(Cache.put.mock.calls[0]).toEqual(['balance', 1100]);
        const transactionRecord = Cache.put.mock.calls[1][1][0];
        expect(transactionRecord.type).toEqual('credit');
        expect(transactionRecord.amount).toEqual(100);
    });
});
