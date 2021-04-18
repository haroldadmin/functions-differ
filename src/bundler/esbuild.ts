import { build } from "esbuild";
import { err, ok, Result } from "neverthrow";
import { BundleResult } from "./bundleResult";

export default async function bundleFunctions(
    functions: Record<string, string>,
): Promise<Result<BundleResult[], Error>> {
    try {
        const bundlePromises = Object.entries(functions).map(([fxName, fxPath]) => bundleFunction(fxName, fxPath));
        const bundleResults = await Promise.all(bundlePromises);
        return ok(bundleResults);
    } catch (error) {
        return err(error);
    }
}

async function bundleFunction(fxName: string, fxPath: string): Promise<BundleResult> {
    const timeLabel = `Bundle ${fxName}`;
    console.time(timeLabel);

    const buildResult = await build({
        entryPoints: [fxPath],
        format: "cjs",
        bundle: true,
        outdir: "bundled",
        platform: "node",
        minify: true,
        treeShaking: true,
        write: false,
    });

    console.timeEnd(timeLabel);

    return { fxName, fxPath, code: buildResult.outputFiles[0].text };
}
