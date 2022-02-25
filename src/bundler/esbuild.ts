import { build, BuildOptions } from "esbuild";
import { err, ok, Result } from "neverthrow";
import logger from "../logger";
import { BundleResult } from "./bundleResult";

export default async function bundleFunctions(
    functions: Record<string, string>,
    bundlerConfig?: BuildOptions,
): Promise<Result<BundleResult[], Error>> {
    try {
        const bundlePromises = Object.entries(functions).map(([fxName, fxPath]) =>
            bundleFunction(fxName, fxPath, bundlerConfig),
        );
        const bundleResults = await Promise.all(bundlePromises);
        return ok(bundleResults);
    } catch (error) {
        return err(<Error>error);
    }
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
