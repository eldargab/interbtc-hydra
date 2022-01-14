import * as ss58 from "@subsquid/ss58";
import { Store, toHex } from "@subsquid/substrate-processor";
import { Height, Issue, RelayedBlock } from "../model";
import { LessThanOrEqual } from "typeorm";
import { Address } from "../types/v1";

const issuePeriod = 14400; // TODO: HARDCODED - fetch from chain once event is implemented
const parachainBlocksPerBitcoinBlock = 100; // TODO: HARDCODED - find better way to set?
const btcPeriod = Math.ceil(issuePeriod / parachainBlocksPerBitcoinBlock);

export async function blockToHeight(
    store: Store,
    absoluteBlock: number,
    eventName = ""
): Promise<Height> {
    const height = await store.get(Height, {
        where: { absolute: LessThanOrEqual(absoluteBlock) },
        order: { active: "DESC" },
    });
    if (height === undefined)
        throw new Error(
            `Did not find Height entity for absolute block ${absoluteBlock} while processing ${eventName}; this should never happen, unless the parachain has not produced a single active block yet!`
        );
    if (height.absolute === absoluteBlock) {
        return height;
    } else {
        const lazyBackfill = new Height({
            absolute: absoluteBlock,
            active: height.active,
        });
        await store.save(lazyBackfill);
        return lazyBackfill;
    }
}

export async function isIssueExpired(
    store: Store,
    issue: Issue,
    latestBtcBlock: number,
    latestActiveBlock: number
): Promise<boolean> {
    const requestHeight = await store.get(Height, {
        where: { id: issue.request.height },
    });
    if (requestHeight === undefined) return false; // no active blocks yet
    const requestBtcBlock = await store.get(RelayedBlock, {
        order: { backingHeight: "DESC" },
        relations: ["relayedAtHeight"],
        where: {
            relayedAtHeight: {
                absolute: LessThanOrEqual(requestHeight.absolute),
            },
        },
    });
    if (requestBtcBlock === undefined) return false; // no BTC blocks yet

    // console.log(`Checking expiry: opened at height ${requestHeight.active}, current latest block is ${latestActiveBlock}, issue period is ${issuePeriod}; btc height is ${requestBtcBlock.backingHeight}, latest btc is ${latestBtcBlock}, btc period is ${btcPeriod}`)

    return (
        requestBtcBlock.backingHeight + btcPeriod < latestBtcBlock &&
        requestHeight.active + issuePeriod < latestActiveBlock
    );
}

export const address = {
    interlay: ss58.codec('interlay'),
    btc: {
        encode(address: Address): string {
            return toHex(address.value)
        }
    }
};
