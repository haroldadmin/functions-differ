import { relative } from "path";
import { cwd } from "process";
import { Project } from "ts-morph";
import logger from "../logger";

/**
 * Function to discover and get the paths of all functions
 *
 * @param {string} indexFilePath The path of the index.ts file to be explored
 * @returns {Record<string, string>} A Record containing list of all functions as keys and their paths as values.
 */
const getExports = (indexFilePath = "src/index.ts"): Record<string, string> => {
    const exports: Record<string, string> = {};

    const typeChecker = project.getTypeChecker();
    const indexFile = project.getSourceFileOrThrow(indexFilePath);

    const exportSymbols = typeChecker.getExportsOfModule(indexFile.getSymbolOrThrow());
    for (const exportSymbol of exportSymbols) {
        const exportName = exportSymbol.getName();
        const aliasedSymbol = exportSymbol.getAliasedSymbol();

        const [declaration] = aliasedSymbol ? aliasedSymbol.getDeclarations() : exportSymbol.getDeclarations();

        if (!declaration) {
            logger.error(`Failed to find a declaration for ${exportSymbol.getName()}`);
            continue;
        }

        const filePath = declaration.getSourceFile().getFilePath();

        exports[exportName] = relative(cwd(), filePath);
    }

    return exports;
};

const project = new Project();
project.addSourceFilesAtPaths("**/*.ts");

export { getExports as getFirebaseFunctionsAndPaths };
