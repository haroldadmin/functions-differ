import { expect } from "chai";
import prettify from "./prettify";
import DifferSpec from "./differSpec";
import { createTempFile } from "./parser.spec";
import writeSpec from "./writer";

describe("spec writer", () => {
    it("should write pretty JSON into the spec file", async () => {
        const spec: DifferSpec = { functions: {}, hashes: {} };
        const spacing = 2;

        const [file, cleanup] = await createTempFile();
        const writtenContentsResult = await writeSpec(spec, file, spacing);

        expect(writtenContentsResult.isOk()).to.be.true;

        const writtenContents = writtenContentsResult._unsafeUnwrap();
        const expectedContents = prettify(spec, spacing);
        expect(writtenContents).to.equal(expectedContents);

        await cleanup();
    });
});
