
import BN from 'bn.js';
import bs58 from 'bs58';
import Decimal from "decimal.js";
import { PublicKey, Connection } from "@solana/web3.js";

export class RayV4 {
    client: Connection;
    constructor() {
        this.client = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
        
    }
}