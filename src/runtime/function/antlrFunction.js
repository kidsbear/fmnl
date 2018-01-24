
const RawFunction = require('./rawFunction');
const NamedFunction = require('./namedFunction');

/**
 *
 * @param name - String
 * @param targets - AntlrAccess.Target | String
 * @param targetsFn - [AntlrAccess] => (Element => Element)
 * @constructor
 */
let AntlrFunction = function(name, targets, targetsFn) {

};

AntlrFunction.prototype = Object.create(NamedFunction.prototype);
AntlrFunction.prototype.constructor = AntlrFunction;

module.exports = AntlrFunction;