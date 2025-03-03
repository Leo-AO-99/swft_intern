import { PublicKey, Connection, AccountSubscriptionConfig } from "@solana/web3.js";

export class PoolBase {
    _name: string = "PoolBase";
    conn: Connection;
    pool_ids: string[];
    price_cache: Map<string, number>;
    on_update?: (pool_id: string, price: number) => Promise<void>;

    constructor(pool_ids: string[], on_update?: (pool_id: string, price: number) => Promise<void>) {
        this.conn = new Connection("https://api.mainnet-beta.solana.com", "processed");
        this.pool_ids = pool_ids;
        this.price_cache = new Map<string, number>();
        for (const pool_id of this.pool_ids) {
            this.price_cache.set(pool_id, -1);
        }
        this.on_update = on_update;
    }

    async start() {
        for (const pool_id of this.pool_ids) {
            this.start_by_pool_id(pool_id);
        }
        console.log(this._name + ' started')
    }

    parse_price(dataBuffer: Buffer, pool_id: string): number {
        throw new Error("Not implemented");
    }

    async start_by_pool_id(pool_id: string) {
        this.conn.onAccountChange(
            new PublicKey(pool_id),
            async (accountInfo) => {
                const dataBuffer = accountInfo?.data;
                if (!dataBuffer) {
                    throw new Error("Account data not found");
                }
                const price = this.parse_price(dataBuffer, pool_id);
                this.price_cache.set(pool_id, price);
                if (this.on_update) {
                    await this.on_update(pool_id, price);
                }
            },
        )
    }
}