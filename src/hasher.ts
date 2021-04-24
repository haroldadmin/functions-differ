import crypto from "crypto";
import { err, ok, Result } from "neverthrow";
import { BundleResult } from "./bundler";

export interface HashResult {
    bundle: BundleResult;
    hash: string;
}

export const HashAlgorithm = "sha256";

export default function calculateHash(bundle: BundleResult): Result<HashResult, Error> {
    try {
        const timeLabel = `Hash ${bundle.fxName}`;
        console.time(timeLabel);

        const sha256 = crypto.createHash(HashAlgorithm);
        const hash = sha256.update(bundle.code).digest("base64");

        console.timeEnd(timeLabel);
        return ok({ bundle, hash });
    } catch (error) {
        return err(error);
    }
}
