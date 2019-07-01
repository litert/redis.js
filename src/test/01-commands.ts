import * as assert from "assert";
import * as L from "@litert/core";

describe("Commands", function() {

    describe("Wrapped commands", function() {

        this.timeout(5000);

        it("SET a 123", async function() {

            await L.Async.sleep(2000);
            assert.equal(1, 1, "1 == 1");
        });
    });
});
