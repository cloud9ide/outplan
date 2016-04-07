var planout = require("planout");
var PlanOut = require("planout").Planout;

var experiments = Object.create(null);
var logFunction = function() {};

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
 */
module.exports.configure = function(options) {
    logFunction = options.logFunction || logFunction;
    experiments = options.experiments || experiments;
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
    
    function Experiment() {
        planout.Experiment.apply(this, arguments);
    }
    Experiment.prototype = Object.create(planout.Experiment.prototype);
    Experiment.prototype.configureLogger = function() {};
    Experiment.prototype.log = function(event) {
        logFunction(event);
    };
    Experiment.prototype.previouslyLogged = function() {
        // TODO
        // check if we’ve already logged an event for this user
        // return this._exposureLogged; is a sane default for client-side experiments
    };
    Experiment.prototype.setup = function() {
        this.name = name;
    };
    Experiment.prototype.getParamNames = function() {
        return this.getDefaultParamNames();
    };
    Experiment.prototype.assign = function(params, args) {
        options.unit = args.userId;
        params.set("value", new options.operator(options));
    };
    
    return experiments[name] = Experiment;
};

module.exports.get = function(userId, name) {
    if (!name)
        throw new Error("Missing argument. Expected: userId, name");
    
    var experiment = experiments[name];
    if (!experiment)
        throw new Error("Experiment not defined: " + name);
    return new experiment({ userId: userId}).get("value");
};