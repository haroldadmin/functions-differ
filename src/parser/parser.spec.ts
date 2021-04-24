import { expect } from "chai";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import parseSpecFile, { resolveFunctionPaths } from "./parser";

describe("spec file parser", () => {
    it("should return an error if spec file does not exist", async () => {
        const invalidFilePath = path.resolve(".differspec.json");
        const parseResult = await parseSpecFile(invalidFilePath);
        expect(parseResult.isErr()).to.be.true;
        expect(parseResult._unsafeUnwrapErr().type).to.equal("file-not-found");
    });

    it("should return error if parsed file is not JSON", async () => {
        const [specFile, cleanup] = await createTempFile();
        const parseResult = await parseSpecFile(specFile);

        expect(parseResult.isErr()).to.be.true;
        expect(parseResult._unsafeUnwrapErr().type).to.equal("invalid-json");

        await cleanup();
    });

    it("should return error if differspec is missing functions property", async () => {
        const [specFile, cleanup] = await createTempFile();
        const invalidSpec = {};
        await fs.writeFile(specFile, JSON.stringify(invalidSpec));

        const parseResult = await parseSpecFile(specFile);

        expect(parseResult.isErr()).to.be.true;
        expect(parseResult._unsafeUnwrapErr().type).to.equal("missing-functions");

        await cleanup();
    });

    it("should return success if file is valid", async () => {
        const [specFile, cleanup] = await createTempFile();
        const validSpec = { functions: {} };
        await fs.writeFile(specFile, JSON.stringify(validSpec));

        const parseResult = await parseSpecFile(specFile);

        expect(parseResult.isOk()).to.be.true;
        expect(parseResult._unsafeUnwrap()).to.deep.equal(validSpec);

        await cleanup();
    });
});

describe("function path resolver", () => {
    it("should return empty record if input is empty", () => {
        const resolved = resolveFunctionPaths({}, ".");
        expect(Object.keys(resolved)).to.have.length(0);
    });

    it("should not resolve absolute paths", () => {
        const resolved = resolveFunctionPaths({ foo: "/" }, ".");
        expect(resolved.foo).to.equal("/");
    });

    it("should resolve paths correctly", () => {
        const sampleFunctions: Record<string, string> = {
            foo: "src/foo/function.ts",
        };
        const specFileDir = "fooRepo";

        const resolved = resolveFunctionPaths(sampleFunctions, specFileDir);
        const resolvedFunctions = Object.keys(resolved);
        const resolvedPaths = Object.values(resolved);

        expect(resolvedFunctions).to.have.length(1);
        expect(resolvedPaths).to.have.length(1);
        expect(resolvedFunctions[0]).to.equal("foo");
        expect(resolvedPaths[0]).to.contain(specFileDir);
    });
});

/**
 * Creates a temporary file in the OS temp directory
 *
 * It is not mandatory to execute the returned cleanup function, as the temporary file
 * is created in the OS's temp directory .
 *
 * @return {Promise<[string, () => Promise<void>]>} Temporary file path and cleanup function
 */
export async function createTempFile(): Promise<[string, () => Promise<void>]> {
    const tempDir = os.tmpdir();
    const fileName = Date.now().toString();
    const tempFilePath = path.join(tempDir, fileName);
    const f = await fs.open(tempFilePath, "w");
    await f.close();

    const cleanup: () => Promise<void> = async () => {
        await fs.unlink(tempFilePath);
    };

    return [tempFilePath, cleanup];
}
