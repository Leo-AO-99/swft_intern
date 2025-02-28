import { Connection, PublicKey } from "@solana/web3.js";
import DLMM from "@meteora-ag/dlmm"

export class MeteoraDLMM {
    pool_ids: string[];
    price_cache: Map<string, number>;
    conn: Connection;
    constructor(pool_ids: string[]) {
        this.conn = new Connection("https://api.mainnet-beta.solana.com");
        this.pool_ids = pool_ids;
        this.price_cache = new Map<string, number>();
        for (const pool_id of this.pool_ids) {
            this.price_cache.set(pool_id, 0);
        }
    }

    async start() {
        for (const pool_id of this.pool_ids) {
            this.start_by_pool_id(pool_id);
        }
        console.log('MeteoraDLMM started')
    }

    async start_by_pool_id(pool_id: string) {
        const dlmm = (DLMM as any).default;
        this.conn.onAccountChange(
            new PublicKey(pool_id),
            async (accountInfo) => {
                const dataBuffer = accountInfo?.data;
                if (!dataBuffer) {
                    throw new Error("Account data not found");
                }
        
                console.log(dataBuffer)
                console.log(dataBuffer.length)
            },
            {
                commitment: 'processed',
            }
        )
    }
}