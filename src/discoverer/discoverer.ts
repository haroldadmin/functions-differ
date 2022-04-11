import { ExportDeclaration, ImportDeclaration, Project } from "ts-morph";

const getPath = (declaration: ImportDeclaration | ExportDeclaration): string | undefined => {
    const sourceFile = declaration.getModuleSpecifierSourceFile()?.getFilePath()?.toString();
    if (sourceFile) return sourceFile;
    return undefined;
};

/**
 * Function to discover and get the paths of all functions
 *
 * @param {string} indexFilePath The path of the index.ts file to be explored
 * @returns {Record<string, string>} A Record containing list of all functions as keys and their paths as values.
 */
const getExports = (indexFilePath: string = "src/index.ts"): Record<string, string> => {
    if (indexFilePath.startsWith("undefined")) {
        return {};
    }
    const sourceFile = project.getSourceFileOrThrow(indexFilePath);

    // Build imports map, as imports can have paths
    const imports = sourceFile.getImportDeclarations();
    const importMap: Record<string, string> = {};
    for (const imp of imports) {
        const path = getPath(imp);

        [...imp.getNamedImports(), imp.getDefaultImport()].map((name) => {
            if (name && path) importMap[name.getText()] = path;
        });
    }

    const exports = sourceFile.getExportDeclarations();
    let exportMap: Record<string, string> = {};

    for (const exp of exports) {
        let ppath = getPath(exp);
        const exportedFunctions = exp.getNamedExports();

        for (const func of exportedFunctions) {
            let path = ppath;
            if (exportMap[func.getText()]) continue;
            if (!path) path = importMap[func.getText()];

            // Assumption: Files that import modules from another file and export it have the word "index" in it.
            // Need to recursively call the getExports function on this index.ts file to get the actual path of the
            // functions exported from this index file.
            if (path?.includes("index")) {
                let currentDir = exp.getModuleSpecifierSourceFile()?.getDirectoryPath();

                // if currentDir is undefined, try to get currentDir from the imports. This can happen if a file has
                // separate import-export lines for the module

                if (!currentDir) {
                    const imp = imports.filter((impp) =>
                        impp
                            .getNamedImports()
                            .map((x) => x.getText())
                            .includes(func.getText()),
                    );
                    currentDir = imp[0].getModuleSpecifierSourceFile()?.getDirectoryPath();
                }

                const deeperExports = getExports(`${currentDir}/index.ts`);

                // if the deeperExports object is empty, it possibly means that
                // the function was defined in the most recent "index*.ts" file explored
                // or there was a failure. In both cases, assume the path of the function to be the
                // most recent "index*.ts" file explored
                if (Object.keys(deeperExports).length === 0) {
                    exportMap[func.getText()] = path;
                } else {
                    exportMap = { ...exportMap, ...deeperExports };
                }
            } else {
                if (path) exportMap[func.getText()] = path;
            }
        }
    }
    return exportMap;
};
const project = new Project();
project.addSourceFilesAtPaths("**/*.ts");
export { getExports as getFirebaseFunctionsAndPaths };
