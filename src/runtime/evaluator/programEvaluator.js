const assert = require('assert');

const AntlrAccess = require('./../antlrAccess');

const FunctionEvaluator = require('./functionEvaluater');

const Note = require('./../../elements/note');
const Element = require('./../../elements/element');
const Elements = require('./../../elements/elements');
const List = require('./../../elements/list');
const Wrapper = require('./../../elements/wrapper');
const Fraction = require('./../../math/fraction');
const FunctionNameResolver = require('./../functionNameResolver');
const NoteNameResolver = require('./../noteNameResolver');
const NamedFunction = require('./../function/namedFunction');
const RawFunction = require('./../function/rawFunction');

let ProgramEvaluateListener = AntlrAccess.createListener(function() {
    this.result = [];
    this.functionNameResolver = FunctionNameResolver.default();
    this.noteNameResolver = new NoteNameResolver();
    this.localNoteNameResolver = this.noteNameResolver.copy();
    this.settings = {};

    NoteNameResolver.registerDefault(this.noteNameResolver);
});

ProgramEvaluateListener.prototype.exitPatternMatcher = function(ctx) {
    let notes = ctx.NOTE_NAME();
    this.localNoteNameResolver = this.noteNameResolver.copy();
    for (let i = 0; i < notes.length; i++) {
        let noteName = notes[i].getText();
        this.localNoteNameResolver.register(noteName, () => Note.fromOrigin(i));
    }
};

ProgramEvaluateListener.prototype.exitFunctionDef = function(ctx) {
    let name = ctx.func().FUNCTION_NAME().getText();
    let patternMatcher = ctx.patternMatcher().getText();
    let patternMatcherSize = ctx.patternMatcher().NOTE_NAME().length;
    let body = ctx.elements().getText();
    let evaluated = FunctionEvaluator.evaluate(body, this.functionNameResolver, this.localNoteNameResolver);

    if (ctx.FUNCTION_EXPORT_KEYWORD()) {
        this.result.push({
            name: name,
            patternMatcher: patternMatcher,
            body: body,
            evaluated: evaluated,
            duration: evaluated.getDuration(),
            settings: Object.assign({}, this.settings)
        });
    }

    let fn = RawFunction.templates.fromElements(evaluated, patternMatcherSize);
    this.functionNameResolver.register(NamedFunction.templates.singleNamed(name, fn));
};

ProgramEvaluateListener.prototype.exitSettingDef = function(ctx) {
    this.settings[ctx.SETTING_VARIABLE_NAME().getText()] = ctx.SETTING_VARIABLE_VALUE().getText();
};

let ProgramEvaluator = {};
ProgramEvaluator.evaluate = function(input) {
    const compiler = new ProgramEvaluateListener();
    new AntlrAccess(input, AntlrAccess.TARGETS.PROGRAM).walk(compiler);

    return compiler.result;
};

module.exports = ProgramEvaluator;