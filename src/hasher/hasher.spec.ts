import { expect } from "chai";
import calculateHash from "./hasher";

describe("function code hasher", () => {
    it("should hash the given code correctly", () => {
        const hashResult = calculateHash("test", "console.log('abc')");
        expect(hashResult.isOk()).to.be.true;
    });

    it("should return an error if an unknown hashing algorithm is requested", () => {
        const hashResult = calculateHash("test", "console.log('abc')", "ooga-booga-algo");
        expect(hashResult.isErr()).to.be.true;
    });
});
