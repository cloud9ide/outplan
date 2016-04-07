OutPlan
=======

OutPlan is an A/B testing framework based on Facebook's [PlanOut](http://facebook.github.io/planout).
It's designed to work with Node and client-side JavaScript.

OutPlan is based on [PlanOut.js](https://github.com/HubSpot/PlanOut.js),
which does all the hard work. _Thanks!_ OutPlan however "outclasses" classic
PlanOut by not using classes. The resulting API is clean and simple.

## Installation

```
npm install outplan
```

## Usage

Set up an experiment as follows:

```javascript
outplan.create("nice-colors", ["A", "B"]);
```

and then evaluate the experiment using `outplan.get()`:

```javascript
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

```javascript
outplan.create("cool-buttons", {
    A: { button_color: "#AAA", button_text: "I voted" },
    B: { button_color: "#BBB", button_text: "I am voter" }
});
var variation = outplan.get("cool-buttons", userId);
var color = variation.button_color;
var text = variation.button_text;
```

OutPlan also supports [custom distribution operators](http://facebook.github.io/planout/docs/random-operators.html):

```javascript
outplan.create("letter-experiment", ["A", "B"], {
    operator: outplan.WeightedChoice,
    weights: [0.6, 0.4],
});
```

## Logging

You can set an event logger using 

```javascript
outplan.configure({
    logFunction: function(e) {
        // ...
    };
};
```

where `e` is an object like

```javascript
{
    event: "exposure",
    name: "cool-buttons",
    inputs: { userId: 42 },
    params: {
        name: "A",
        value: { button_color: "#AAA", button_text: "I voted" }
    },
    time: 1321211
}
```

Below is an example implementation. It logs events like "cool-buttons - exposure"
to some popular analytics services.

```javascript
function log(e) {
    var label = e.name + " - " + e.event;

    // For Mixpanel
    mixpanel.track(label, { variation: e.params.name });
  
    // For Amplitude
    amplitude.logEvent(label, { variation: e.params.name });

    // For Google Analytics
    ga("send", "event", "EXPERIMENT", label, e.params.name);
}
outplan.configure({ logFunction: log });
```

# License

MIT