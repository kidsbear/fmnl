const antlr4 = require('antlr4');
const assert = require('assert');

const FmnlLexer = require('./../../gen/FmnlLexer').FmnlLexer;
const FmnlParser = require('./../../gen/FmnlParser').FmnlParser;
const FmnlParserListener = require('./../../gen/FmnlParserListener').FmnlParserListener;
const ErrorListener = require('antlr4').error.ErrorListener;

/**
 * An accessor for antlr4 so that you only need to import this module.
 * @param input - String
 * @param target - AntlrAccess.Target
 * @constructor
 */
let AntlrAccess = function(input, target) {
    const chars = new antlr4.InputStream(input);

    const lexer = new FmnlLexer(chars);
    let errorListener = new ErrorListener();
    errorListener.syntaxError = function(recognizer, offendingSymbol, line, column, msg, e) {
        throw new Error("Line " + line + ":" + column + " " + msg, e);
    };
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);

    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new FmnlParser(tokens);
    parser.buildParseTrees = true;

    assert(target instanceof AntlrAccess.Target);
    this.tree = parser[target.name]();
    this.matched = this.tree.getText();
    this.valid = this.matched.length > 0 && input.startsWith(this.matched);
    this.remanent = "";
    if (this.valid) {
        this.remanent = input.substring(this.matched.length);
    } else {
        this.remanent = input;
    }
};

/**
 * Walks the tree with a listener.
 * @param listener - AntlrListener
 */
AntlrAccess.prototype.walk = function(listener) {
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, this.tree);
};

/**
 * Creates a listener extending FmnlParserListener.
 * @param constructorFn - any'a => any'b, extra constructor action.
 * @returns AntlrListener
 */
AntlrAccess.createListener = function(constructorFn) {
    let newListener = function(...args) {
        FmnlParserListener.call(this);
        return constructorFn.call(this, ...args);
    };

    newListener.prototype = Object.create(FmnlParserListener.prototype);
    newListener.prototype.constructor = newListener;

    return newListener;
};

/**
 * Parses a string with multiple targets or strings in a sequence.
 * Returns an AntlrAccess object for each AntlrAccess.Target passed.
 * If input does not match targets, return undefined.
 * @param input - String
 * @param targets - AntlrAccess.Target | String
 * @returns [AntlrAccess]
 */
AntlrAccess.parseMultiple = function(input, ...targets) {
    let remanent = input;
    let matched = [];
    for (let i = 0; i < targets.length; i++) {
        let target = targets[i];
        if (target instanceof AntlrAccess.Target) {
            let cur = new AntlrAccess(remanent, target);
            if (cur.valid) {
                remanent = cur.remanent;
            } else {
                return undefined;
            }
            matched.push(cur);
        } else if (target.constructor === String) {
            if (remanent.startsWith(target)) {
                remanent = remanent.substring(target.length);
            } else {
                return undefined;
            }
        }
    }
    if (remanent.length > 0) {
        return undefined;
    } else {
        return matched;
    }
};

/**
 * Enum for parse targets.
 */
AntlrAccess.Target = function(targetName) {
    // Allow constructor usage without 'new'
    if (!(this instanceof AntlrAccess.Target)) {
        return new AntlrAccess.Target(targetName);
    }

    this.name = targetName;
};
AntlrAccess.TARGETS = {
    PROGRAM: AntlrAccess.Target("program"),
    ELEMENTS: AntlrAccess.Target("elements"),
    NOTE: AntlrAccess.Target("note"),
    NUMBER: AntlrAccess.Target("number")
};

module.exports = AntlrAccess;