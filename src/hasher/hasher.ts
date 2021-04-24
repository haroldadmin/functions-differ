import crypto from "crypto";
import { err, ok, Result } from "neverthrow";

export interface HashResult {
    fxName: string;
    fxCode: string;
    hash: string;
}

export const HashAlgorithm = "sha256";

export default function calculateHash(
    fxName: string,
    fxCode: string,
    algorithm: string = HashAlgorithm,
    encoding: crypto.BinaryToTextEncoding = "base64",
): Result<HashResult, HasherError> {
    try {
        const sha256 = crypto.createHash(algorithm);
        const hash = sha256.update(fxCode).digest(encoding);
        return ok({ fxName, fxCode, hash });
    } catch (error) {
        return err(new HasherError(`Failed to hash code for ${fxName}: ${error}`));
    }
}

export class HasherError extends Error {
    constructor(readonly message: string) {
        super(message);
        this.name = "HasherError";
    }
}
