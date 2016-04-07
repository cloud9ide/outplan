var planout = require("planout");
var PlanOut = require("planout").Planout;

var salt = "salt";
var experiments = Object.create(null);
var logFunction = function() {};
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
 * @param {String|Number} userId
 * @param {String} name
 * @param {String[]|Object} choices
 *        A list of variations, e.g. ["A", "B"],
 *        or variation objects, e.g. { A: { color: "#AAA" }, B: { color: "#BBB" } }
 * @param {Object} [option]
 *        Options for the experiment. This may also include
 *        arguments for the distribution operator, e.g. weight.
 * @param {Function} [options.operator]
 *        The distribution operator, e.g. outplan.WeightedChoice  
 */
module.exports.create = function(name, choices, options) {
    options = options || {};
    options.operator = options.operator || module.exports.UniformChoice;
    if (Array.isArray(choices)) {
        options.choices = choices;
    }
    else {
        options.choices = Object.keys(choices);
        options.choiceData = choices;
    }
    
    return experiments[name] = options;
};

module.exports.get = function(name, userId) {
    if (!userId)
        throw new Error("Missing argument. Expected: name, userId");
    if (!experiments[name])
        throw new Error("Experiment not defined: " + name);
        
    var experiment = experiments[name];
    experiment.unit = String(userId);
    experiment.salt = salt;
    
    var operator = new experiment.operator(experiment);
    var assignment = new planout.Assignment(salt);
    
    planout.ExperimentSetup.toggleCompatibleHash(compatibleHash);
    var choice = operator.execute(assignment);
    return experiment.choiceData ? experiment.choiceData[choice] : choice;
};