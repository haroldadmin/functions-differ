import { Signale } from "signale";
import { verbose } from "./options/options";

const logger = new Signale({
    logLevel: verbose ? "info" : "error",
});

export default logger;
