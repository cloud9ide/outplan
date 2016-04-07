var outplan = require("./lib/outplan");
var assert = require("assert");

describe("outplan", function() {
    this.timeout(15000);
    
    beforeEach(function() {
        outplan.configure({
            logFunction: function() {},
            experiments: [],
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
        assert.equal(outplan.get("foo", 2), "A");
        assert.equal(outplan.get("foo", 3), "B");
        assert.equal(outplan.get("foo", 4), "A");
        assert.equal(outplan.get("foo", "1"), "B");
        assert.equal(outplan.get("foo", "2"), "A");
        assert.equal(outplan.get("foo", "3"), "B");
        assert.equal(outplan.get("foo", "4"), "A");
        assert.equal(outplan.get("foo", "5"), "A");
        assert.equal(outplan.get("foo", "6"), "A");
        assert.equal(outplan.get("foo", "7"), "A");
        assert.equal(outplan.get("foo", "8"), "B");
        assert.equal(outplan.get("foo", "9"), "B");
    });
    
    it("can get values for experiments", function() {
        outplan.create("foo", { A: { color: "#AAA" }, B: { color: "#BBB" } });
        var value = outplan.get("foo", 1);
        assert.equal(value.color, "#BBB");
    });
    
    it("can run some example code", function() {
        outplan.create("nice-colors", {
            A: { button_color: "#AAA", button_text: "I voted" },
            B: { button_color: "#BBB", button_text: "I am voter" }
        });
        var variation = outplan.get("nice-colors", 42);
        var color = variation.button_color;
        var text = variation.button_text;
        
        assert.equal(color, "#AAA");
        assert.equal(text, "I voted");
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
        assert.equal(logged.userId, 42);
        assert.equal(logged.choice, "A");
    });
});