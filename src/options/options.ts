import cmdArgs, { OptionDefinition } from "command-line-args";
import path from "path";

const options: OptionDefinition[] = [
    { name: "dir", alias: "d", type: String },
    { name: "write", alias: "w", type: Boolean, defaultValue: false },
    { name: "verbose", alias: "v", type: Boolean, defaultValue: false },
    { name: "prefix", type: String, defaultValue: "functions:" },
    { name: "sep", type: String, defaultValue: "," },
];

const args = cmdArgs(options);
const { dir, write, verbose, prefix, sep: separator } = args;
if (!dir) {
    console.error("Error: dir argument not supplied");
    process.exit(1);
}

const specFilePath: string = path.join(dir, ".differspec.json");

export { specFilePath, dir, write, verbose, prefix, separator };
