import rollupCjs from "@rollup/plugin-commonjs";
import rollupJson from "@rollup/plugin-json";
import rollupResolve from "@rollup/plugin-node-resolve";
import { err, ok, Result } from "neverthrow";
import path from "path";
import { OutputAsset, OutputChunk, rollup } from "rollup";
import { terser } from "rollup-plugin-terser";

export interface BundleResult {
    fxName: string;
    fxPath: string;
    code: string;
}

export default async function bundleFunction(fxName: string, fxPath: string): Promise<Result<BundleResult, Error>> {
    try {
        console.time(fxName);

        const fxAbsolutePath = path.resolve(fxPath);
        const bundle = await rollup({
            input: fxAbsolutePath,
            output: { format: "commonjs" },
            treeshake: true,
            plugins: [
                rollupResolve(),
                rollupCjs({ extensions: [".js", ".ts"], sourceMap: false }),
                rollupJson(),
                terser(),
            ],
            onwarn: () => {},
            watch: false,
        });

        const { output } = await bundle.generate({ format: "commonjs" });
        await bundle.close();

        if (output.length > 1) {
            return err(new Error("Bundle output contains >1 chunk"));
        }

        console.timeEnd(fxName);
        return ok({ fxName, fxPath, code: output[0].code });
    } catch (error) {
        return err(error);
    }
}

export async function bundleFunctions(functions: Record<string, string>): Promise<Result<BundleResult[], Error>> {
    try {
        console.time("bundle");

        const bundle = await rollup({
            input: Object.values(functions).map((fxPath) => path.resolve(fxPath)),
            output: { format: "commonjs" },
            treeshake: true,
            plugins: [
                rollupResolve(),
                rollupCjs({ extensions: [".js", ".ts"], sourceMap: false }),
                rollupJson(),
                terser(),
            ],
            onwarn: () => {},
            watch: false,
        });

        const { output } = await bundle.generate({ format: "commonjs" });
        await bundle.close();

        console.timeEnd("bundle");

        const expectedChunks = Object.keys(functions).length;
        if (output.length < expectedChunks) {
            return err(
                new Error(`Generated output contains code for ${output.length} functions, expected ${expectedChunks}`),
            );
        }

        const outputChunks = output.filter(isChunk);
        return chunksToBundleResults(outputChunks, functions);
    } catch (error) {
        return err(error);
    }
}

function chunksToBundleResults(
    chunks: OutputChunk[],
    functions: Record<string, string>,
): Result<BundleResult[], Error> {
    const bundleCodeByFxPath = new Map<string, string>();
    chunks.filter(isChunk).forEach((chunk) => {
        if (chunk.facadeModuleId) {
            bundleCodeByFxPath.set(chunk.facadeModuleId, chunk.code);
        }
    });

    const bundleResults: BundleResult[] = [];
    for (const fxName of Object.keys(functions)) {
        const fxPath = functions[fxName];
        const code = bundleCodeByFxPath.get(fxPath);
        if (!code) {
            return err(new Error(`Could not find generated code for ${fxName}`));
        }
        bundleResults.push({ fxName, fxPath, code: code ?? "" });
    }

    return ok(bundleResults);
}

const isChunk = (o: OutputChunk | OutputAsset): o is OutputChunk => o.type === "chunk";
