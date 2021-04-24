import cmdArgs, { OptionDefinition } from "command-line-args";
import path from "path";
import { bundleFunctions } from "./bundler";
import hashesDiffer from "./differ/differ";
import calculateHash from "./hasher/hasher";
import segregate from "./hasher/segregate";
import DifferSpec from "./parser/differSpec";
import parseSpecFile, { resolveFunctionPaths } from "./parser/parser";
import writeSpec from "./parser/writer";

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
    const specResult = await parseSpecFile(specFilePath);
    if (specResult.isErr()) {
        console.error(specResult.error.toString());
        return;
    }

    const { functions, hashes: existingHashes } = specResult.value;
    console.log(`Discovered ${Object.keys(functions).length} functions`);

    const fxWithResolvedPaths = resolveFunctionPaths(functions, dir);
    const bundleResult = await bundleFunctions(fxWithResolvedPaths);
    if (bundleResult.isErr()) {
        console.error(`Encountered an error while bundling functions`, bundleResult.error);
        return;
    }

    const bundles = bundleResult.value;
    const hashResults = bundles.map(({ fxName, code }) => calculateHash(fxName, code));
    const [hashes, hashErrors] = segregate(hashResults);

    if (hashErrors.length != 0) {
        console.error(`Encountered ${hashErrors.length} while hashing functions`);
        hashErrors.forEach((err) => console.error(err.error));
        return;
    }

    const newHashes = hashes
        .map((hash) => hash.value)
        .reduce((record, { fxName, hash }) => {
            record[fxName] = hash;
            return record;
        }, <Record<string, string>>{});

    const updatedSpec: DifferSpec = {
        functions,
        hashes: newHashes,
    };
    console.log(updatedSpec);

    const diffResults = hashesDiffer(existingHashes ?? {}, newHashes);
    console.log(diffResults);

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
