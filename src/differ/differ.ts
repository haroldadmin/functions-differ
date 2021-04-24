import logger from "../logs/logger";

export type Hashes = Record<string, string>;

export interface DiffResult {
    deleted: string[];
    added: string[];
    changed: string[];
    unchanged: string[];
}

export default function hashesDiffer(oldHashes: Hashes, newHashes: Hashes): DiffResult {
    const added: string[] = [];
    const deleted: string[] = [];
    const changed: string[] = [];
    const unchanged: string[] = [];

    Object.keys(newHashes).forEach((fxName) => {
        const newHash = newHashes[fxName];
        const oldHash = oldHashes[fxName];
        if (!oldHash) {
            logger.debug(`Added ${fxName}`);
            added.push(fxName);
        } else if (newHash != oldHash) {
            logger.debug(`Changed ${fxName}`);
            changed.push(fxName);
        } else {
            unchanged.push(fxName);
        }
    });

    Object.keys(oldHashes).forEach((fxName) => {
        if (fxName in newHashes) {
            return;
        }
        logger.debug(`Deleted ${fxName}`);
        deleted.push(fxName);
    });

    return {
        added,
        deleted,
        changed,
        unchanged,
    };
}
