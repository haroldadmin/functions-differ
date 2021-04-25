import { DiffResult } from "../differ/differ";

export default interface DifferSpec {
    functions: Record<string, string>;
    hashes?: Record<string, string>;
    lastDiff?: DiffResult;
}

export class ParseError extends Error {
    constructor(
        readonly type: "file-not-found" | "file-read-failed" | "invalid-json" | "missing-functions" | "unknown",
        readonly message: string,
    ) {
        super(message);
        this.name = "ParseError";
    }
}
