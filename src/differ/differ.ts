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
            added.push(fxName);
        } else if (newHash != oldHash) {
            changed.push(fxName);
        } else {
            unchanged.push(fxName);
        }
    });

    Object.keys(oldHashes).forEach((fxName) => {
        if (fxName in newHashes) {
            return;
        }
        deleted.push(fxName);
    });

    return {
        added,
        deleted,
        changed,
        unchanged,
    };
}
