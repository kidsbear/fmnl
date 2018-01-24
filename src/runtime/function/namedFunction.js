const RawFunction = require("./rawFunction");

/**
 * A function with a name and a matcher
 * @param name - String
 * @param matcher - String => any: if the string matches, returns a truthful object as message
 * @param rawFn - RawFunction
 * @constructor
 */
let NamedFunction = function(name, matcher, rawFn) {
    // Allow constructor usage without 'new'
    if (!(this instanceof NamedFunction)) {
        return new NamedFunction(name, matcher, rawFn);
    }

    this.name = name;
    this.matcher = matcher;
    if (typeof rawFn == "function") {
        this.fn = RawFunction(rawFn);
    } else {
        this.fn = rawFn;
    }
};

NamedFunction.prototype.match = function(s) {
    return this.matcher(s) ? true : false;
};

NamedFunction.prototype.apply = function(...args) {
    return this.fn.apply(...args);
};

NamedFunction.prototype.applyAll = function(...args) {
    return this.fn.applyAll(...args);
};

NamedFunction.templates = {};
NamedFunction.templates.singleNamed = function(name, fn) {
    return NamedFunction(name, (n) => n == name, fn);
};

module.exports = NamedFunction;