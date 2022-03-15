import { PromisePool } from "@supercharge/promise-pool";
import { build, BuildOptions } from "esbuild";
import { err, ok, Result } from "neverthrow";
import logger from "../logger";
import { BundleResult } from "./bundleResult";

export type BundlerConfig = BuildOptions & {
    concurrency?: number;
};

export default async function bundleFunctions(
    functions: Record<string, string>,
    bundlerConfig?: BundlerConfig,
): Promise<Result<BundleResult[], Error>> {
    const { concurrency = Object.keys(functions).length, ...config } = bundlerConfig ?? {};
    const { errors, results } = await PromisePool.for(Object.entries(functions))
        .withConcurrency(concurrency)
        .process(([fxName, fxPath]) => bundleFunction(fxName, fxPath, config));
    if (errors.length > 0) {
        const [error] = errors;
        return err(error);
    }
    return ok(results);
}

export async function bundleFunction(
    fxName: string,
    fxPath: string,
    bundlerConfig?: BuildOptions,
): Promise<BundleResult> {
    const timeLabel = `Bundle ${fxName}`;
    logger.time(timeLabel);

    const buildResult = await build({
        entryPoints: [fxPath],
        format: "cjs",
        platform: "node",
        minify: true,
        bundle: true,
        treeShaking: true,
        outdir: "bundled",
        ...bundlerConfig,
        write: false,
    });

    logger.timeEnd(timeLabel);

    return { fxName, fxPath, code: buildResult.outputFiles[0].text };
}
