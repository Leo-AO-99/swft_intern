import { RayCLMM } from './raydium/ray_clmm.js';
import { OrcaWhirl } from './orca/orca_whirl.js';

class ArbChecker {
    threshold: number = 1.0;
    private prices: Map<string, Map<string, number>> = new Map();

    constructor(prices: Map<string, Map<string, number>>) {
        this.prices = prices;
    }

    update_price(exchange: string, pool_id: string, price: number) {
        this.prices.get(exchange)!.set(pool_id, price);
        // simple strategy
        const ray_price = this.prices.get("raydium")!.get("8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj")!;
        const orca_price = this.prices.get("orca")!.get("Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE")!;
        if (ray_price / orca_price > this.threshold) {
            // usdc -> sol on orca, sol -> usdc on raydium
            console.log("ray/orca,", ray_price / orca_price);
        } else if (orca_price / ray_price > this.threshold) {
            // sol -> usdc on raydium, usdc -> sol on orca
            console.log("orca/ray,", orca_price / ray_price);
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