import {Activity} from "../../src/models/database/activity.model";
import {unpublishedActivity} from "../test.data";
import {assert} from "chai";
import {TestFactory} from "../testFactory";

const factory: TestFactory = new TestFactory();

describe("activity.model.ts", () => {

    before(async () => {
        await factory.init();
    });

    after(async () => {
        await factory.close();
    });

    it("Adding a valid activity instance", () => {
        Activity.create(unpublishedActivity).then(function(act): void {
            assert(true);
        }).catch(function(result: any): void {
            assert.fail();
        });
    });
});
