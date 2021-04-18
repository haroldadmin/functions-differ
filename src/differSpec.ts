import path from "path";
import { promises as fs } from "fs";
import { err, ok, Result } from "neverthrow";
import { Stats } from "node:fs";

export interface DifferSpec {
    functions: Record<string, string>;
    hashes: Record<string, string>;
}

export async function parseFunctions(specFilePath: string): Promise<Result<Record<string, string>, Error>> {
    const checkResult = await checkSpecFile(specFilePath);
    if (checkResult.isErr()) {
        return err(checkResult.error);
    }

    const specFileDir = path.dirname(specFilePath);
    const specFileBuffer = await fs.readFile(specFilePath);
    const specFile: DifferSpec = JSON.parse(specFileBuffer.toString());
    if (!specFile.functions) {
        return err(new Error(`"functions" property not found in ${specFilePath}`));
    }

    const functions: Record<string, string> = {};
    for (const fxName in specFile.functions) {
        const fxPath = path.resolve(specFileDir, specFile.functions[fxName]);
        functions[fxName] = fxPath;
    }

    return ok(functions);
}

export async function writeSpec(spec: DifferSpec, specFilePath: string): Promise<Result<DifferSpec, Error>> {
    const checkResult = await checkSpecFile(specFilePath);
    if (checkResult.isErr()) {
        return err(checkResult.error);
    }

    try {
        await fs.writeFile(specFilePath, JSON.stringify(spec));
        return ok(spec);
    } catch (error) {
        return err(error);
    }
}

async function checkSpecFile(specFilePath: string): Promise<Result<Stats, Error>> {
    const stat = await fs.stat(specFilePath);
    if (!stat) {
        return err(new Error(`Spec file does not exist: ${specFilePath}`));
    }

    return ok(stat);
}
