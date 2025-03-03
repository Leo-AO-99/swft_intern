import { RayCLMM } from './raydium/ray_clmm.js';
import { OrcaWhirl } from './orca/orca_whirl.js';

import { Connection, Transaction, SystemProgram } from '@solana/web3.js';

// TODO
// 1. concurrency control
// 2. subsribe balance

// For one route, always buy from src_ex, sell to tgt_ex
class Route {
    src_ex: string;
    src_pool: string;
    tgt_ex: string;
    tgt_pool: string;

    constructor(src_ex: string, src_pool: string, tgt_ex: string, tgt_pool: string) {
        this.src_ex = src_ex;
        this.src_pool = src_pool;
        this.tgt_ex = tgt_ex;
        this.tgt_pool = tgt_pool;
    }
}
class ArbChecker {
    threshold: number = 1.0;
    private prices: Map<string, Map<string, number>> = new Map();
    private route_table: Map<string, Array<Route>> = new Map();
    private connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

    constructor(prices: Map<string, Map<string, number>>) {
        this.prices = prices;
        // traverse all pools
        for (const [_, pool_map] of this.prices) {
            for (const [pool_id, _] of pool_map) {
                this.route_table.set(pool_id, []);
            }
        }
    }

    add_route(route: Route) {
        this.route_table.get(route.src_pool)!.push(route);
        this.route_table.get(route.tgt_pool)!.push(route);
    }
    

    async on_signal(route: Route) {
        const src_price = this.prices.get(route.src_ex)!.get(route.src_pool)!;
        const tgt_price = this.prices.get(route.tgt_ex)!.get(route.tgt_pool)!;
        // one way direction
        if (tgt_price / src_price > this.threshold) {
            // trade part
            console.log("trade part");
            await this.execute_trade(route, src_price, tgt_price);
        }
        
    }

    async update_price(exchange: string, pool_id: string, price: number) {
        this.prices.get(exchange)!.set(pool_id, price);
        for (const route of this.route_table.get(pool_id)!) {
            await this.on_signal(route);
        }
    }

    private async execute_trade(route: Route, buy_price: number, sell_price: number) {
        try {
            let msg = `
            ${route.src_ex} -> ${route.tgt_ex}\n
            src_pool: ${route.src_pool}\n
            tgt_pool: ${route.tgt_pool}\n
            buy price: ${buy_price}\n
            sell price: ${sell_price}\n
            `

            // ...


            console.log(msg);

            
        } catch (e) {
            console.error(e);
        }
    }
}

async function main() {
    const prices = new Map<string, Map<string, number>>();
    prices.set("raydium", new Map());
    prices.set("orca", new Map());
    prices.get("raydium")!.set("8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj", -1.0);
    prices.get("orca")!.set("Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE", -1.0);

    const arb_checker = new ArbChecker(prices);

    arb_checker.add_route(new Route("raydium", "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj", "orca", "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE"));
    arb_checker.add_route(new Route("orca", "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE", "raydium", "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj"));

    const ray_clmm = new RayCLMM([
        "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
    ], (pool_id, price) => arb_checker.update_price("raydium", pool_id, price));

    const orca_whirl = new OrcaWhirl([
        "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE",
    ], (pool_id, price) => arb_checker.update_price("orca", pool_id, price));
    await ray_clmm.start();
    await orca_whirl.start()
}

main();