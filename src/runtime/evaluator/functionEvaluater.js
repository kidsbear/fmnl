const assert = require('assert');

const AntlrAccess = require('./../antlrAccess');

const Note = require('./../../elements/note');
const Element = require('./../../elements/element');
const Elements = require('./../../elements/elements');
const List = require('./../../elements/list');
const Wrapper = require('./../../elements/wrapper');
const Fraction = require('./../../math/fraction');
const FunctionLibrary = require('./../function/functionLibrary');
const FunctionNameResolver = require('./../functionNameResolver');

const runtime = require('./../runtime');

let FunctionEvaluateListener = AntlrAccess.createListener(function(functionNameResolver, noteNameResolver) {
    this.result = null; // Elements
    this.functionNameResolver = functionNameResolver;
    this.noteNameResolver = noteNameResolver;
});

// ctx.liveElements - Elements

FunctionEvaluateListener.prototype.exitPrefixedNote = function(ctx) {
    let noteName = ctx.NOTE_NAME().getText();
    let note = this.noteNameResolver.resolve(noteName);
    ctx.NOTE_PREFIX().forEach(function(prefix) {
        // TODO: refactor into more appropriate file
        if (prefix.getText() == "#") note = note.modifyPitch(1);
        if (prefix.getText() == "b") note = note.modifyPitch(-1);
        if (prefix.getText() == "/") note = note.modifyPitch(12);
        if (prefix.getText() == "\\") note = note.modifyPitch(-12);
    });
    ctx.liveElements = Elements(note);
};

FunctionEvaluateListener.prototype.exitNote = function(ctx) {
    let multiplier = Fraction(1);
    let dotValue = Fraction(1, 2);
    ctx.note_suffix_().forEach(function(suffix) {
        // TODO: refactor into more appropriate file
        if (suffix.getText() == "-") multiplier = multiplier.add(Fraction(1));
        if (suffix.getText() == ".") {
            multiplier = multiplier.add(dotValue);
            dotValue = dotValue.multiply(Fraction(1, 2));
        }
    });

    ctx.liveElements = ctx.prefixedNote().liveElements.map(function(element) {
        assert(element.type === Element.NOTE);
        return element.modifyDuration(multiplier);
    });
};

FunctionEvaluateListener.prototype.exitElement = function(ctx) {
    assert(ctx.getChildCount() == 1);
    ctx.liveElements = ctx.getChild(0).liveElements;
};

FunctionEvaluateListener.prototype.exitElements = function(ctx) {
    ctx.liveElements = Elements.join(...ctx.element().map(c => c.liveElements));
    this.result = ctx.liveElements;
};

FunctionEvaluateListener.prototype.exitRawList = function(ctx) {
    let elements = Elements(List(...ctx.elements().map(c => c.liveElements)));
    ctx.list_infix_().forEach(function(infix) {
        // TODO: refactor into more appropriate file
        if (infix.getText() == "+") elements = FunctionLibrary.doubleDuration.applyAll(elements);
        if (infix.getText() == "-") elements = FunctionLibrary.halveDuration.applyAll(elements);
        if (infix.getText() == "t") elements = FunctionLibrary.tuple.applyAll(elements);
    });
    ctx.liveElements = elements;
};

FunctionEvaluateListener.prototype.exitList = function(ctx) {
    let liveElements = ctx.rawList().liveElements;
    let repeatTimes = 1;
    let wrap = false;
    ctx.LIST_SUFFIX().forEach(function(infix) {
        // TODO: refactor into more appropriate file
        if (infix.getText() == "*") repeatTimes++;
        if (infix.getText() == "^") wrap = true;
    });
    if (repeatTimes > 1) {
        liveElements = FunctionLibrary.repeat(repeatTimes).applyAll(liveElements);
    }
    if (wrap) {
        liveElements = Elements(Wrapper(liveElements));
    }

    let funcs = ctx.func().map((c) => c.FUNCTION_NAME().getText()).reverse();
    for (let i = 0; i < funcs.length; i++) {
        let fnName = funcs[i];
        let fn = this.functionNameResolver.resolve(fnName);
        liveElements = fn.applyAll(liveElements);
    }
    ctx.liveElements = liveElements;
};

FunctionEvaluateListener.prototype.exitWrapper = function(ctx) {
    let liveElements = Elements(Wrapper(ctx.elements().liveElements));
    let funcs = ctx.func().map((c) => c.FUNCTION_NAME().getText()).reverse();
    for (let i = 0; i < funcs.length; i++) {
        let fnName = funcs[i];
        let fn = this.functionNameResolver.resolve(fnName);
        liveElements = fn.applyAll(liveElements);
    }
    ctx.liveElements = liveElements;
};

let FunctionEvaluator = {};
FunctionEvaluator.evaluate = function(input, functionNameResolver, noteNameResolver) {
    const compiler = new FunctionEvaluateListener(functionNameResolver, noteNameResolver);
    new AntlrAccess(input, AntlrAccess.TARGETS.ELEMENTS).walk(compiler);
    return compiler.result;
};

module.exports = FunctionEvaluator;