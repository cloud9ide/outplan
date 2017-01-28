// @flow
const planout = require("planout/index");
const sha1 = require("sha1");

let salt = "salt";
let experiments: { [key: string]: Experiment } = Object.create(null);
let logFunction: Function;
let compatibleHash = false;

export const PlanoutOp = planout.Ops.Random.UniformChoice;
export const UniformChoice = planout.Ops.Random.UniformChoice;
export const WeightedChoice = planout.Ops.Random.WeightedChoice;
export const PlanOutOpRandom = planout.Ops.Random.PlanOutOpRandom; 
export const Sample = planout.Ops.Random.Sample; 
export const BernoulliFilter = planout.Ops.Random.BernoulliFilter; 
export const BernoulliTrial = planout.Ops.Random.BernoulliTrial; 
export const RandomInteger = planout.Ops.Random.RandomInteger; 
export const RandomFloat = planout.Ops.Random.RandomFloat; 

type Configuration = {
    logFunction?: Function,
    experiments?: { [key: string]: Experiment },
    compatibleHash: Boolean,
    salt?: string
}

type Experiment = {
    name: string,
    choices: Choice[],
    choiceData: Choice[],
    options?: Object,
    unit?: string,
    salt?: string,
    operator: Function,
}

type Choice = string | Object

/**
 * Configure experiment defaults.
 * 
 * @param {Object} options
 * @param {Function} [options.logFunction]
 * @param {Boolean} [options.compatibleHash]
 */
export function configure(options : Configuration) {
    logFunction = options.logFunction || logFunction;
    experiments = options.experiments || experiments;
    if (options.compatibleHash != null) {
        if (options.compatibleHash && sha1.$shimmed)
            throw new Error("compatibleHash is only supported in planout_full");
        compatibleHash = options.compatibleHash;
    }
    salt = options.salt || String(salt);
    sha1.$salt = options.salt || String(salt !== "salt" ? salt : undefined);
    return this;
};

export function getExperiments(): { [key: string]: Experiment } {
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
export function create(name: string, choices: Choice[], options: ?Object) {
    options = options || {};
    options.name = name;
    options.operator = options.operator || UniformChoice;
    options.choiceData = choices;
    options.choices = choices.map(function(c) {
        if (typeof c === "string")
            return c;
        if (!c.name)
            throw new Error("Property 'name' expected in choices");
        return c.name;
    });
    experiments[name] = options;
    return {
        create: this.create.bind(this),
        getExperiments: this.getExperiments.bind(this),
        expose: this.expose.bind(this, name),
        configure: this.configure.bind(this),
    };
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
export function expose(name: string, userId: string | number, options: { log?: Boolean }) {
    if (userId == null)
        throw new Error("Missing argument. Expected: name, userId");
    if (!experiments[name])
        throw new Error("Experiment not defined: " + name);
        
    const experiment = experiments[name];
    experiment.unit = String(userId);
    experiment.salt = salt;
    
    const operator = new experiment.operator(experiment);
    const assignment = new planout.Assignment(name);
    
    planout.ExperimentSetup.toggleCompatibleHash(compatibleHash);
    const choice = operator.execute(assignment);
    const result = getValue(choice, experiment);
    
    if (options && options.log === false)
        return result;
    
    if (!logFunction) {
        console.warn("Called outplan.expose() without setting logFunction");
        return result;
    }

    logFunction({
        name,
        inputs: { userId: userId },
        params: { name: choice, value: result },
        event: "exposure",
        salt: salt,
        time: Date.now() / 1000,
    });
    return result;
};

function getValue(choice: Choice, experiment: Experiment) {
    if (typeof experiment.choiceData[0] === "string")
        return choice;
    for (let i = 0; i < experiment.choiceData.length; i++) {
        if (typeof experiment.choiceData[i] == "object" && experiment.choiceData[i].name === choice)
            return experiment.choiceData[i];
    }
    throw new Error(`Unexpected error: could not find choice ${(choice : any).name || choice}`);
}