OutPlan
=======

OutPlan is an A/B testing framework based on Facebook's [PlanOut](http://facebook.github.io/planout).
It's designed to work with Node and client-side JavaScript.

OutPlan is based on [PlanOut.js](https://github.com/HubSpot/PlanOut.js),
but it "outclasses" classic PlanOut by not using classes.
The resulting API is clean and simple.

## Installation

```
npm install outplan
```

## Usage

Set up an experiment as follows:

```
outplan.create("nice-colors", ["A", "B"]);
```

and then evaluate the experiment using `outplan.get()`:

```
var userId = 42; // something unique to the current user
if (outplan.get("nice-colors", userId) === "A") {
    // Use "A" color variation
} else {
    // Use "B" color variation
}
```

OutPlan is deterministic so it will always give you the same
"A" or "B" for a specific userId.

You can assign complex objects to experiments as well:

```
outplan.create("cool-buttons", {
    A: { button_color: "#AAA", button_text: "I voted" },
    B: { button_color: "#BBB", button_text: "I am voter" }
});
var variation = outplan.get("cool-buttons", userId);
var color = variation.button_color;
var text = variation.button_text;
```

OutPlan also supports [custom distribution operators](http://facebook.github.io/planout/docs/random-operators.html):

```
outplan.create("letter-experiment", ["A", "B"], {
    operator: outplan.WeightedChoice,
    weights: [0.6, 0.4],
});
```

# License

MIT