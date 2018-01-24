const assert = require('assert');

const Fraction = require('./../math/fraction');

const RawFunction = require("./function/rawFunction");
const NamedFunction = require("./function/namedFunction");

const Element = require('./../elements/element');
const Elements = require('./../elements/elements');
const Note = require('./../elements/note');
const List = require('./../elements/list');
const FunctionLibrary = require("./function/functionLibrary");

/**
 * FunctionNameResolver provides lookup for a function name.
 * @constructor
 */
let FunctionNameResolver = function() {
    this.pairs = {}; // {`matcherName`: {matcher: String => Boolean, fn: RawFunction}, ...}
};

/**
 * Register a function name matcher with the function.
 * @param namedFn - NamedFunction
 */
FunctionNameResolver.prototype.register = function(namedFn) {
    let matcherName = namedFn.name;
    let matcher = namedFn.matcher;
    if (this.pairs[matcherName] !== undefined) throw new Error("Duplicate matcher name: " + matcherName);

    this.pairs[matcherName] = Object.freeze({
        matcher: matcher,
        fn: namedFn
    });
};

/**
 * Resolve a note name.
 * @param name - String
 * @returns Note
 */
FunctionNameResolver.prototype.resolve = function(name) {
    let res = undefined;
    let resMatcherName = undefined;
    for (let matcherName in this.pairs) {
        let matcher = this.pairs[matcherName].matcher;
        let fn = this.pairs[matcherName].fn;
        if (matcher(name) === true) {
            if (res !== undefined) {
                throw new Error("Ambiguous matchers: " + resMatcherName + " and " + matcherName + " while resolving <" + name + ">");
            }
            res = fn;
            resMatcherName = matcherName;
        }
    }
    if (res === undefined) {
        throw new Error("No matching function while resolving <" + name + ">");
    }
    return res;
};

/**
 * Return a default functionNameResolver.
 * @returns FunctionNameResolver
 */
FunctionNameResolver.default = function() {
    return FunctionNameResolver.registerDefault(new FunctionNameResolver());
};

/**
 * Register a functionNameResolver with default bindings.
 * @param functionNameResolver - FunctionNameResolver
 * @returns FunctionNameResolver
 */
FunctionNameResolver.registerDefault = function(functionNameResolver) {
    // TODO: replace this, lol
    for (let i = 0; i < 10; i++) {
        functionNameResolver.register(NamedFunction.templates.singleNamed("reverse" + (i + 2), FunctionLibrary.reverse(i + 2)));
        functionNameResolver.register(NamedFunction.templates.singleNamed("get" + i, FunctionLibrary.get(i)));
        functionNameResolver.register(NamedFunction.templates.singleNamed("check" + (i + 1), FunctionLibrary.check(i + 1)));
        functionNameResolver.register(NamedFunction.templates.singleNamed("flatten" + (i + 2), FunctionLibrary.flatten(i + 2)));
        functionNameResolver.register(NamedFunction.templates.singleNamed("merge" + (i + 1), FunctionLibrary.merge(i + 1)));
        functionNameResolver.register(NamedFunction.templates.singleNamed("inverse" + (i + 2), FunctionLibrary.inverse(i + 2)));
    }
    return functionNameResolver;
};

module.exports = FunctionNameResolver;

// Tests
(function() {
    let L1 = (...args) => List(Elements(...args));

    let resolver = new FunctionNameResolver();
    let fn = NamedFunction("fn1", (s) => s == "fn1", RawFunction((e) => L1(e)));

    resolver.register(fn);
    assert.deepEqual(resolver.resolve("fn1"), fn);
    assert.throws(() => { resolver.resolve("fn2") });
})();