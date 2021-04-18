import cmdArgs, { OptionDefinition } from "command-line-args";
import path from "path";
import { bundleFunctions } from "./bundler";
import { DifferSpec, parseFunctions, writeSpec } from "./differSpec";
import calculateHash from "./hasher";
import segregate from "./segregate";

const options: OptionDefinition[] = [
    { name: "dir", alias: "d", type: String },
    { name: "write", alias: "w", type: Boolean, defaultValue: false },
];

const args = cmdArgs(options);
const { dir, write } = args;
if (!dir) {
    console.error("Error: dir argument not supplied");
    process.exit(1);
}

const specFilePath: string = path.join(dir, ".differspec.json");

async function main() {
    console.log(`Parsing ${specFilePath}`);
    const functionsResult = await parseFunctions(specFilePath);
    if (functionsResult.isErr()) {
        console.error(`Failed to parse functions from spec file`, functionsResult.error);
        return;
    }

    const functions = functionsResult.value;
    console.log(`Discovered ${Object.keys(functions).length} functions`);
    console.table(functions);

    const bundleResult = await bundleFunctions(functions);

    if (bundleResult.isErr()) {
        console.error(`Encountered an error while bundling functions`, bundleResult.error);
        return;
    }

    const bundles = bundleResult.value;
    const hashResults = bundles.map((bundle) => calculateHash(bundle));
    const [hashes, hashErrors] = segregate(hashResults);

    if (hashErrors.length != 0) {
        console.error(`Encountered ${hashErrors.length} while hashing functions`);
        hashErrors.forEach((err) => console.error(err.error));
        return;
    }

    const allHashes = hashes
        .map((hash) => hash.value)
        .reduce((record, { bundle, hash }) => {
            record[bundle.fxName] = hash;
            return record;
        }, <Record<string, string>>{});

    console.table(allHashes);

    const updatedSpec: DifferSpec = {
        functions,
        hashes: allHashes,
    };
    console.log(updatedSpec);

    if (!write) {
        return;
    }

    const writeResult = await writeSpec(updatedSpec, specFilePath);
    if (writeResult.isErr()) {
        const error = writeResult.error;
        console.error(`Failed to update .differspec.json: ${error}`, error);
        return;
    }

    console.log(`.differspec.json updated successfully`);
}

main();
