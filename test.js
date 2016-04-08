var outplan = require("./lib/outplan");
var assert = require("assert");

describe("outplan", function() {
    this.timeout(15000);
    
    beforeEach(function() {
        outplan.configure({
            logFunction: function() {},
            experiments: [],
            compatibleHash: false,
        });
    });
    
    it("can create simple experiments", function() {
        outplan.create("foo", ["A", "B"]);
        assert.equal(Object.keys(outplan.getExperiments()).length, 1);
    });
    
    it("can create simple experiments with a custom distribution operator", function() {
        outplan.create("foo", ["A", "B"], {
            operator: outplan.WeightedChoice,
            weights: [0.5, 0.5],
        });
        assert.equal(Object.keys(outplan.getExperiments()).length, 1);
    });
    
    it("can create multiple experiments", function() {
        outplan.create("foo", ["A", "B"]);
        outplan.create("bar", ["C", "D"]);
        assert.equal(Object.keys(outplan.getExperiments()).length, 2);
    });
    
    it("can get values for experiments", function() {
        outplan.create("foo", ["A", "B"]);
        var value = outplan.get("foo", 1);
        assert(value === "A" || value === "B", value);
    });
    
    it("deterministically gets values", function() {
        outplan.create("foo", ["A", "B"]);
        assert.equal(outplan.get("foo", 1), "B");
        assert.equal(outplan.get("foo", 2), "B");
        assert.equal(outplan.get("foo", 3), "A");
        assert.equal(outplan.get("foo", 4), "B");
        assert.equal(outplan.get("foo", "1"), "B");
        assert.equal(outplan.get("foo", "2"), "B");
        assert.equal(outplan.get("foo", "3"), "A");
        assert.equal(outplan.get("foo", "4"), "B");
        assert.equal(outplan.get("foo", "5"), "B");
        assert.equal(outplan.get("foo", "6"), "A");
        assert.equal(outplan.get("foo", "7"), "A");
        assert.equal(outplan.get("foo", "8"), "B");
        assert.equal(outplan.get("foo", "9"), "A");
    });
    
    it("supports complex choice objects", function() {
        outplan.create("foo", [{ name: "A", color: "#AAA" }, { name: "B", color: "#BBB" }]);
        var value = outplan.get("foo", 1);
        assert.equal(value.color, "#BBB");
    });
    
    it("can run some example code", function() {
        outplan.create("nice-colors", [
            { name: "A", button_color: "#AAA", button_text: "I voted" },
            { name: "B", button_color: "#BBB", button_text: "I am voter" }
        ]);
        var variation = outplan.get("nice-colors", 42);
        var color = variation.button_color;
        var text = variation.button_text;
        
        assert.equal(color, "#BBB");
        assert.equal(text, "I am voter");
    });
    
    it("supports logging", function() {
        var logged;
        outplan.configure({
            logFunction: function(e) {
                logged = e;
            }
        });
        outplan.create("foo", ["A", "B"]);
        outplan.get("foo", 42);
        assert.equal(logged.name, "foo");
        assert.equal(logged.inputs.userId, 42);
        assert.equal(logged.params.name, "B");
        assert.equal(logged.params.value, "B");
        assert.equal(logged.event, "exposure");
        assert.equal(logged.salt, "salt");
        assert(logged.time);
    });
    
    it("supports compatibleHash", function() {
        outplan.create("foo", ["A", "B"]);
        assert.equal(outplan.get("foo", 99), "A");
        outplan.configure({ compatibleHash: true });
        assert.equal(outplan.get("foo", 99), "B");
    });
    
    it("supports a falsy userId", function() {
        outplan.create("foo", ["A", "B"]);
        assert.equal(outplan.get("foo", 0), "B");
    });
    
    it("supports a string userId", function() {
        outplan.create("foo", ["A", "B"]);
        assert.equal(outplan.get("foo", "usertje"), "A");
    });
    
    it("supports uses the experiment name for determinism", function() {
        outplan.create("foo", ["A", "B"]);
        outplan.create("bar", ["A", "B"]);
        assert.equal(outplan.get("foo", 42), "B");
        assert.equal(outplan.get("bar", 42), "A");
    });
});