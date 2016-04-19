var outplanFull = require("./dist/outplan_full");
var outplanLite = require("./dist/outplan");
var assert = require("assert");

function testBoth(test) {
    test(outplanFull);
    test(outplanLite);
}

describe("outplan", function() {
    this.timeout(15000);
    
    beforeEach(function() {
        testBoth(function(outplan) {
            outplan.configure({
                logFunction: function() {},
                experiments: [],
                compatibleHash: false,
            });
        });
    });
    
    it("can create simple experiments", function() {
        testBoth(function(outplan) {
            outplan.create("foo", ["A", "B"]);
            assert.equal(Object.keys(outplan.getExperiments()).length, 1);
        });
    });
    
    it("can create simple experiments with a custom distribution operator", function() {
        testBoth(function(outplan) {
            outplan.create("foo", ["A", "B"], {
                operator: outplan.WeightedChoice,
                weights: [0.5, 0.5],
            });
            assert.equal(Object.keys(outplan.getExperiments()).length, 1);
        });
    });
    
    it("can create multiple experiments", function() {
        testBoth(function(outplan) {
            outplan.create("foo", ["A", "B"]);
            outplan.create("bar", ["C", "D"]);
            assert.equal(Object.keys(outplan.getExperiments()).length, 2);
        });
    });
    
    it("can get values for experiments", function() {
        testBoth(function(outplan) {
            outplan.create("foo", ["A", "B"]);
            var value = outplan.expose("foo", 1);
            assert(value === "A" || value === "B", value);
        });
    });
    
    it("deterministically gets values in outplan_full", function() {
        outplanFull.create("foo", ["A", "B"]);
        assert.equal(outplanFull.expose("foo", 1), "B");
        assert.equal(outplanFull.expose("foo", 2), "B");
        assert.equal(outplanFull.expose("foo", 3), "A");
        assert.equal(outplanFull.expose("foo", 4), "B");
        assert.equal(outplanFull.expose("foo", "1"), "B");
        assert.equal(outplanFull.expose("foo", "2"), "B");
        assert.equal(outplanFull.expose("foo", "3"), "A");
        assert.equal(outplanFull.expose("foo", "4"), "B");
        assert.equal(outplanFull.expose("foo", "5"), "B");
        assert.equal(outplanFull.expose("foo", "6"), "A");
        assert.equal(outplanFull.expose("foo", "7"), "A");
        assert.equal(outplanFull.expose("foo", "8"), "B");
        assert.equal(outplanFull.expose("foo", "9"), "A");
    });
    
    it("deterministically gets values in lite version", function() {
        outplanLite.create("foo", ["A", "B"]);
        assert.equal(outplanLite.expose("foo", 1), "A");
        assert.equal(outplanLite.expose("foo", 2), "B");
        assert.equal(outplanLite.expose("foo", 3), "A");
        assert.equal(outplanLite.expose("foo", 4), "B");
        assert.equal(outplanLite.expose("foo", "1"), "A");
        assert.equal(outplanLite.expose("foo", "2"), "B");
        assert.equal(outplanLite.expose("foo", "3"), "A");
        assert.equal(outplanLite.expose("foo", "4"), "B");
        assert.equal(outplanLite.expose("foo", "5"), "A");
        assert.equal(outplanLite.expose("foo", "6"), "B");
        assert.equal(outplanLite.expose("foo", "7"), "A");
        assert.equal(outplanLite.expose("foo", "8"), "B");
        assert.equal(outplanLite.expose("foo", "9"), "A");
    });
    
    it("supports complex choice objects", function() {
        var outplan = outplanFull;
        outplan.create("foo", [{ name: "A", color: "#AAA" }, { name: "B", color: "#BBB" }]);
        var value = outplan.expose("foo", 1);
        assert.equal(value.color, "#BBB");
    });
    
    it("can run some example code", function() {
        testBoth(function(outplan) {
            outplan.create("nice-colors", [
                { name: "A", button_color: "#AAA", button_text: "I voted" },
                { name: "B", button_color: "#BBB", button_text: "I am voter" }
            ]);
            var variation = outplan.expose("nice-colors", 42);
            var color = variation.button_color;
            var text = variation.button_text;
            
            assert.equal(color, "#BBB");
            assert.equal(text, "I am voter");
        });
    });
    
    it("supports logging", function() {
        testBoth(function(outplan) {
            var logged;
            outplan.configure({
                logFunction: function(e) {
                    logged = e;
                }
            });
            outplan.create("foo", ["A", "B"]);
            outplan.expose("foo", 42);
            assert(logged, "Needs to log exposures");
            assert.equal(logged.name, "foo");
            assert.equal(logged.inputs.userId, 42);
            assert.equal(logged.params.name, "B");
            assert.equal(logged.params.value, "B");
            assert.equal(logged.event, "exposure");
            assert.equal(logged.salt, "salt");
            assert(logged.time);
        });
    });
    
    it("doesn't log when using { log: false }", function() {
        testBoth(function(outplan) {
            var logged;
            outplan.configure({
                logFunction: function(e) {
                    logged = e;
                }
            });
            outplan.create("foo", ["A", "B"]);
            outplan.expose("foo", 42, { log: false });
            assert(!logged);
            outplan.expose("foo", 42, { log: true });
            assert(logged);
        });
    });
    
    it("supports compatibleHash in outplan_full", function() {
        outplanFull.create("foo", ["A", "B"]);
        assert.equal(outplanFull.expose("foo", 99), "A");
        outplanFull.configure({ compatibleHash: true });
        assert.equal(outplanFull.expose("foo", 99), "B");
    });
    
    it("doesn't support compatibleHash with regular outplan", function() {
        try {
            outplanLite.configure({ compatibleHash: true });
        } catch (e) {
            return;
        }
        assert(false, "Exception expected");
    });
    
    it("supports a falsy userId", function() {
        testBoth(function(outplan) {
            outplan.create("foo", ["A", "B"]);
            assert.equal(outplan.expose("foo", 0), "B");
        });
    });
    
    it("supports a string userId", function() {
        outplanFull.create("foo", ["A", "B"]);
        assert.equal(outplanFull.expose("foo", "usertje"), "A");
    });
    
    it("supports uses the experiment name for determinism", function() {
        outplanFull.create("foo", ["A", "B"]);
        outplanFull.create("bar", ["A", "B"]);
        assert.equal(outplanFull.expose("foo", 42), "B");
        assert.equal(outplanFull.expose("bar", 42), "A");
    });
    
    it("using create multiple times doesn't affect determinism", function() {
        testBoth(function(outplan) {
            outplan.create("foo", ["A", "B"]);
            outplan.create("bar", ["A", "B"]);
            outplan.create("foo", ["A", "B"]);
            outplan.create("bar", ["A", "B"]);
            assert.equal(outplan.expose("foo", 42), "B");
            assert.equal(outplan.expose("bar", 42), "A");
        });
    });
    
    it("supports chaining API", function() {
        testBoth(function(outplan) {
            var variation = outplan
                .create("foo", ["A", "B"])
                .expose(42);
            assert.equal(variation, "B");
        });
    });
});