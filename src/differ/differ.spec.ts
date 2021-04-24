import { expect } from "chai";
import crypto from "crypto";
import hashesDiffer, { Hashes } from "./differ";

describe("hashes differ", () => {
    it("should detect added hashes correctly", () => {
        const oldHashes: Hashes = {};
        const newHashes: Hashes = {
            foo: generateRandomHash(),
        };

        const { unchanged, added, changed, deleted } = hashesDiffer(oldHashes, newHashes);

        expect(changed).to.have.length(0);
        expect(unchanged).to.have.length(0);
        expect(deleted).to.have.length(0);

        expect(added).to.have.length(1);
        expect(added[0]).to.equal("foo");
    });

    it("should detect deleted hashes correctly", () => {
        const oldHashes: Hashes = {
            foo: generateRandomHash(),
        };
        const newHashes: Hashes = {};

        const { unchanged, added, changed, deleted } = hashesDiffer(oldHashes, newHashes);

        expect(added).to.have.length(0);
        expect(changed).to.have.length(0);
        expect(unchanged).to.have.length(0);

        expect(deleted).to.have.length(1);
        expect(deleted[0]).to.equal("foo");
    });

    it("should detect unchanged hashes correctly", () => {
        const randomHash = generateRandomHash();
        const oldHashes: Hashes = {
            foo: randomHash,
        };
        const newHashes: Hashes = {
            foo: randomHash,
        };

        const { unchanged, added, changed, deleted } = hashesDiffer(oldHashes, newHashes);

        expect(added).to.have.length(0);
        expect(changed).to.have.length(0);
        expect(deleted).to.have.length(0);

        expect(unchanged).to.have.length(1);
        expect(unchanged[0]).to.equal("foo");
    });

    it("should detect changed hashes correctly", () => {
        const oldHashes: Hashes = {
            foo: generateRandomHash(),
        };
        const newHashes: Hashes = {
            foo: generateRandomHash(),
        };

        const { unchanged, added, changed, deleted } = hashesDiffer(oldHashes, newHashes);

        expect(added).to.have.length(0);
        expect(unchanged).to.have.length(0);
        expect(deleted).to.have.length(0);

        expect(changed).to.have.length(1);
        expect(changed[0]).to.equal("foo");
    });

    it("should detect complex changes correctly", () => {
        const oldHashes: Hashes = {
            deletedHash: generateRandomHash(),
            changedHash: generateRandomHash(),
            unchangedHash1: generateRandomHash(),
            unchangedHash2: generateRandomHash(),
        };
        const newHashes: Hashes = {
            changedHash: generateRandomHash(),
            unchangedHash1: oldHashes.unchangedHash1,
            unchangedHash2: oldHashes.unchangedHash2,
            addedHash: generateRandomHash(),
        };

        const { unchanged, added, changed, deleted } = hashesDiffer(oldHashes, newHashes);

        expect(deleted).to.have.length(1);
        expect(deleted[0]).to.equal("deletedHash");

        expect(added).to.have.length(1);
        expect(added[0]).to.equal("addedHash");

        expect(changed).to.have.length(1);
        expect(changed[0]).to.equal("changedHash");

        expect(unchanged).to.have.length(2);
        expect(unchanged[0]).to.equal("unchangedHash1");
        expect(unchanged[1]).to.equal("unchangedHash2");
    });
});

function generateRandomHash(): string {
    const randomBytes = crypto.randomBytes(32).toString("base64");
    const hash = crypto.createHash("sha256").update(randomBytes).digest("base64");
    return hash;
}
