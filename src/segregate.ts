import { Result, Ok, Err } from "neverthrow";

export default function segregate<S, E>(results: Result<S, E>[]): [Ok<S, E>[], Err<S, E>[]] {
    const errors: Err<S, E>[] = [];
    const bundles: Ok<S, E>[] = [];
    for (const bundleResult of results) {
        if (bundleResult.isErr()) {
            errors.push(bundleResult);
        } else {
            bundles.push(bundleResult);
        }
    }

    return [bundles, errors];
}
