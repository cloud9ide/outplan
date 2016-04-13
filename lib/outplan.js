var planout = require("planout");

var salt = "salt";
var experiments = Object.create(null);
var logFunction;
var compatibleHash = false;

module.exports.UniformChoice = planout.Ops.Random.UniformChoice;
module.exports.WeightedChoice = planout.Ops.Random.WeightedChoice;
module.exports.PlanOutOpRandom = planout.Ops.Random.PlanOutOpRandom; 
module.exports.Sample = planout.Ops.Random.Sample; 
module.exports.BernoulliFilter = planout.Ops.Random.BernoulliFilter; 
module.exports.BernoulliTrial = planout.Ops.Random.BernoulliTrial; 
module.exports.RandomInteger = planout.Ops.Random.RandomInteger; 
module.exports.RandomFloat = planout.Ops.Random.RandomFloat; 

/**
 * Configure experiment defaults.
 * 
 * @param {Object} options
 * @param {Function} [options.logFunction]
 * @param {Function} [options.compatibleHash]
 */
module.exports.configure = function(options) {
    logFunction = options.logFunction || logFunction;
    experiments = options.experiments || experiments;
    if (options.compatibleHash != null)
        compatibleHash = options.compatibleHash;
    salt = options.salt || String(salt);
};

module.exports.getExperiments = function() {
    return experiments;
};

/**
 * Create a new experiment.
 * 
 * @param {String} name
 *        The name of the experiment.
 * @param {String[]|Object[]} choices
 *        A list of variations, e.g. ["A", "B"],
 *        or variation objects, e.g. [{ name: "A", color: "#AAA" }, { name: "B", color: "#BBB" }]
 * @param {Object} [option]
 *        Options for the experiment. This may also include
 *        arguments for the distribution operator, e.g. weight.
 * @param {Function} [options.operator]
 *        The distribution operator, e.g. outplan.WeightedChoice.
 */
module.exports.create = function(name, choices, options) {
    options = options || {};
    options.operator = options.operator || module.exports.UniformChoice;
    options.choiceData = choices;
    options.choices = choices.map(function(c) {
        if (typeof c === "string")
            return c;
        if (!c.name)
            throw new Error("Property 'name' expected in choices");
        return c.name;
    });
    return experiments[name] = options;
};

/**
 * Get the selected variation of an experiment, and call the log function with
 * an "expose" event to track its exposure.
 * 
 * @param {String} name                 The experiment name.
 * @param {String|Number} userId        A unique identifier for the current user.
 * @param {Object} [options]            Options
 * @param {Boolean} [options.log=true]  Whether to log an "exposure event"
 */
module.exports.expose = function(name, userId, options) {
    if (userId == null)
        throw new Error("Missing argument. Expected: name, userId");
    if (!experiments[name])
        throw new Error("Experiment not defined: " + name);
        
    var experiment = experiments[name];
    experiment.unit = String(userId);
    experiment.salt = salt;
    
    var operator = new experiment.operator(experiment);
    var assignment = new planout.Assignment(name);
    
    planout.ExperimentSetup.toggleCompatibleHash(compatibleHash);
    var choice = operator.execute(assignment);
    var result = getValue(choice, experiment);
    
    if (options && options.log === false)
        return result;
    
    if (!logFunction) {
        console.warn("Called outplan.expose() without setting logFunction");
        return result;
    }

    logFunction({
        name: name,
        inputs: { userId: userId },
        params: { name: choice, value: result },
        event: "exposure",
        salt: salt,
        time: Date.now() / 1000,
    });
    return result;
};

function getValue(choice, experiment) {
    if (typeof experiment.choiceData[0] === "string")
        return choice;
    for (var i = 0; i < experiment.choiceData.length; i++) {
        if (experiment.choiceData[i].name === choice)
            return experiment.choiceData[i];
    }
    throw new Error("Unexpected error: could not find choice " + choice);
}