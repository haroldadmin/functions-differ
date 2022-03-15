import { expect } from "chai";
import commandLineArgs from "command-line-args";
import { options } from "./options";

describe("options parsing", () => {
    it("should parse concurrency arg correctly", () => {
        const cmd = "functions-differ --concurrency 10";
        const { concurrency } = commandLineArgs(options, { argv: cmd.split(" "), partial: true });
        expect(concurrency).to.equal(10);
    });
});
