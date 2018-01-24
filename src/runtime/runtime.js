// Moving to top to allow circular usage
module.exports = () => Runtime.getInstance();

const ProgramEvaluator = require('./evaluator/programEvaluator');

/**
 * Stores run-time structures. User should use Runtime.getInstance() to get a singleton instance.
 * TODO: remove this class.
 */
let Runtime = function() {
};

Runtime.instance = undefined;
Runtime.getInstance = function() {
    if (Runtime.instance === undefined) {
        Runtime.instance = new Runtime();
    }
    return Runtime.instance;
};

Runtime.prototype.run = function(input) {
    return ProgramEvaluator.evaluate(input);
};
