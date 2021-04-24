import { bundleFunctions } from "./bundler";
import hashesDiffer from "./differ/differ";
import calculateHash from "./hasher/hasher";
import segregate from "./hasher/segregate";
import logger from "./logs/logger";
import prettify from "./logs/prettify";
import { dir, prefix, separator, specFilePath, write } from "./options/options";
import DifferSpec from "./parser/differSpec";
import parseSpecFile, { resolveFunctionPaths } from "./parser/parser";
import writeSpec from "./parser/writer";

async function main() {
    logger.debug(`Parsing ${specFilePath}`);
    const specResult = await parseSpecFile(specFilePath);
    if (specResult.isErr()) {
        logger.error(specResult.error.toString());
        return;
    }

    const { functions, hashes: existingHashes } = specResult.value;
    logger.debug(`Discovered ${Object.keys(functions).length} functions`);

    const fxWithResolvedPaths = resolveFunctionPaths(functions, dir);
    const bundleResult = await bundleFunctions(fxWithResolvedPaths);
    if (bundleResult.isErr()) {
        logger.error(`Encountered an error while bundling functions: ${bundleResult.error}`);
        return;
    }

    const bundles = bundleResult.value;
    const hashResults = bundles.map(({ fxName, code }) => calculateHash(fxName, code));
    const [hashes, hashErrors] = segregate(hashResults);

    if (hashErrors.length != 0) {
        logger.error(`Encountered ${hashErrors.length} while hashing functions`);
        hashErrors.forEach((err) => logger.error(err.error));
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
    logger.debug(prettify(updatedSpec));

    const diffResults = hashesDiffer(existingHashes ?? {}, newHashes);
    logger.debug(prettify(diffResults));

    if (write) {
        const writeResult = await writeSpec(updatedSpec, specFilePath);
        if (writeResult.isErr()) {
            const error = writeResult.error;
            logger.error(`Failed to update .differspec.json: ${error}`);
        }
    }

    const functionsToRedeploy = [...diffResults.added, ...diffResults.changed]
        .map((fxName) => `${prefix}fxName`)
        .join(separator);

    logger.log(functionsToRedeploy);
}

main();
