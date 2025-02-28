import BN from 'bn.js';
import { Connection, PublicKey } from "@solana/web3.js";
import { PoolBase } from "../base/pool_base.js";

// https://github.com/orca-so/whirlpools/blob/main/programs/whirlpool/src/state/whirlpool.rs
export class OrcaWhirl extends PoolBase {
    _name: string = "OrcaWhirl";
    mint_decimal: Map<string, [number, number]>;

    constructor(pool_ids: string[], on_update?: (pool_id: string, price: number) => void) {
        super(pool_ids, on_update);
        this._name = "OrcaWhirl";
        this.mint_decimal = new Map<string, [number, number]>();
        this.mint_decimal.set("Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE", [9, 6])
    }

    parse_price(dataBuffer: Buffer, pool_id: string): number {
        const mint_a_decimal = this.mint_decimal.get(pool_id)![0];
        const mint_b_decimal = this.mint_decimal.get(pool_id)![1];
        const offset = 65
        const sqrtPriceX64Buffer = dataBuffer.slice(offset, offset + 16);
        const sqrtPriceX64Value = new BN(sqrtPriceX64Buffer, 'le');
        const sqrtPriceX64BigInt = BigInt(sqrtPriceX64Value.toString());
        const sqrtPriceX64Float = Number(sqrtPriceX64BigInt) / (2 ** 64);
        const price = sqrtPriceX64Float ** 2 * (10 ** mint_a_decimal) / (10 ** mint_b_decimal);
        return price;
    }
}