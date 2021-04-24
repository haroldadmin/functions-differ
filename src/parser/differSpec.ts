export default interface DifferSpec {
    functions: Record<string, string>;
    hashes?: Record<string, string>;
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
