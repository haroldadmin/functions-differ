import { createTempFile } from "../parser/parser.spec";
import { promises as fs } from "fs";
import { bundleFunction } from "./esbuild";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("function bundler", () => {
    it("should bundle a valid function successfully", async () => {
        const [fxPath, cleanup] = await createTempFile(".ts");
        const fxName = "test";

        await fs.writeFile(fxPath, "console.log('hello')");

        const bundleResult = await bundleFunction(fxName, fxPath);

        expect(bundleResult.fxName).to.equal("test");
        expect(bundleResult.fxPath).to.equal(fxPath);
        expect(bundleResult.code).to.not.be.empty;

        await cleanup();
    });

    it("should throw an error if file is not a JS/TS file", async () => {
        const [fxPath, cleanup] = await createTempFile(".kt");
        const fxName = "test";

        await fs.writeFile(fxPath, "console.log('hello')");

        await expect(bundleFunction(fxName, fxPath)).to.eventually.throw;

        await cleanup();
    });

    it("should throw an error if the file contains invalid code", async () => {
        const [fxPath, cleanup] = await createTempFile(".ts");
        const fxName = "test";

        await fs.writeFile(fxPath, "const a = 42; a = 41;");

        await expect(bundleFunction(fxName, fxPath)).to.eventually.throw;

        await cleanup();
    });
});
