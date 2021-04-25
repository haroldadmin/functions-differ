import { err, ok, Result } from "neverthrow";
import { promises as fs } from "fs";
import DifferSpec from "./differSpec";
import prettify from "./prettify";

export default async function writeSpec(
    spec: DifferSpec,
    path: string,
    jsonSpacing = 2,
): Promise<Result<string, WriteError>> {
    try {
        const contents = prettify(spec, jsonSpacing);
        await fs.writeFile(path, contents);
        return ok(contents);
    } catch (error) {
        return err(new WriteError(`Failed to write spec file: ${error}`));
    }
}

export class WriteError extends Error {
    constructor(readonly message: string) {
        super(message);
        this.name = "WriteError";
    }
}
