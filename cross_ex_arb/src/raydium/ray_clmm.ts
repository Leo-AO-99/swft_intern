
import BN from 'bn.js';
import bs58 from 'bs58';
import Decimal from "decimal.js";
import { PublicKey, Connection, AccountSubscriptionConfig } from "@solana/web3.js";
import { PoolBase } from "../base/pool_base.js";
export class RayCLMM extends PoolBase {
    _name: string = "RayCLMM";
    mint_decimal: Map<string, [number, number]>;
    constructor(pool_ids: string[], on_update?: (pool_id: string, price: number) => void) {
        super(pool_ids, on_update);
        this.mint_decimal = new Map<string, [number, number]>();
        this.mint_decimal.set("8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj", [9, 6])
    }

    parse_price(dataBuffer: Buffer, pool_id: string): number {
        const mint_a_decimal = this.mint_decimal.get(pool_id)![0];
        const mint_b_decimal = this.mint_decimal.get(pool_id)![1];
        const offset = 253
        const sqrtPriceX64Buffer = dataBuffer.slice(offset, offset + 16);
        const sqrtPriceX64Value = new BN(sqrtPriceX64Buffer, 'le');
        const sqrtPriceX64BigInt = BigInt(sqrtPriceX64Value.toString());
        const sqrtPriceX64Float = Number(sqrtPriceX64BigInt) / (2 ** 64);
        const price = sqrtPriceX64Float ** 2 * (10 ** mint_a_decimal) / (10 ** mint_b_decimal);
        return price;
    }
}