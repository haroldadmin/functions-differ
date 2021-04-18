import crypto from "crypto";
import { err, ok, Result } from "neverthrow";
import { BundleResult } from "./bundler";

export interface HashResult {
    bundle: BundleResult;
    hash: string;
}

export default function calculateHash(bundle: BundleResult): Result<HashResult, Error> {
    try {
        const sha256 = crypto.createHash("sha256");
        const hash = sha256.update(bundle.code).digest("base64");
        return ok({ bundle, hash });
    } catch (error) {
        return err(error);
    }
}
