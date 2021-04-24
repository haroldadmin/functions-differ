import { expect } from "chai";
import { err, ok } from "neverthrow";
import segregate from "./segregate";

describe("segregate", () => {
    it("should separate ok/err correctly", () => {
        const [successes, errors] = segregate([ok(null), err(null)]);
        expect(successes).to.have.length(1);
        expect(errors).to.have.length(1);
    });
});
