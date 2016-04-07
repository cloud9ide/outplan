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
 * @param {String[]} choices
 * @param {Object} [option]
 *        Options for the experiment. This may also include
 *        arguments for the distribution operator, e.g. weight.
 * @param {Function} [options.operator]
 *        The distribution operator, e.g. outplan.WeightedChoice  
 */
module.exports.create = function(name, choices, options) {
    options = options || {};
    options.operator = options.operator || module.exports.UniformChoice;
    options.choices = choices;
    
    return experiments[name] = options;
};

module.exports.get = function(userId, name) {
    if (!name)
        throw new Error("Missing argument. Expected: userId, name");
        
    planout.ExperimentSetup.toggleCompatibleHash(compatibleHash);
    
    var experiment = experiments[name];
    if (!experiment)
        throw new Error("Experiment not defined: " + name);
    experiment.unit = String(userId);
    experiment.salt = salt;
    var operator = new experiment.operator(experiment);
    var assignment = new planout.Assignment(salt);
    return operator.execute(assignment);
};