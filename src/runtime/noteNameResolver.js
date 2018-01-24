const assert = require('assert');

const Note = require('./../elements/note');
const Fraction = require('./../math/fraction');

/**
 * NoteNameResolver provides lookup for a note name.
 * @constructor
 */
let NoteNameResolver = function() {
    this.noteNameFns = {};
    this.stackCount = 0;
    this.originNoteName = "None";
};

NoteNameResolver.MAX_STACK = 1000;

/**
 * Register a note name with the function.
 * @param noteName - String
 * @param fn - (String => Note) => Note
 */
NoteNameResolver.prototype.register = function(noteName, fn) {
    this.noteNameFns[noteName] = fn;
};

NoteNameResolver.prototype._applyFn = function(noteName) {
    if (this.stackCount++ > NoteNameResolver.MAX_STACK) {
        throw new Error("Circular reference in NoteNameResolver: " + this.originNoteName);
    }
    return this.noteNameFns[noteName](this._resolve.bind(this));
};

/**
 * Resolve a note name.
 * @param noteName - String
 * @returns Note
 */
NoteNameResolver.prototype.resolve = function(noteName) {
    this.stackCount = 0;
    this.originNoteName = noteName;
    return this._resolve(noteName);
};

NoteNameResolver.prototype.copy = function() {
    let copy = new NoteNameResolver();
    for (let noteName in this.noteNameFns) {
        copy.register(noteName, this.noteNameFns[noteName]);
    }
    return copy;
};

NoteNameResolver.prototype._resolve = function(noteName) {
    if (!(noteName in this.noteNameFns)) {
        throw new Error("Referenced note does exist: " + noteName + " - origin: " + this.originNoteName);
    }
    return this._applyFn(noteName);
};

/**
 * Return a default noteNameResolver.
 * @returns NoteNameResolver
 */
NoteNameResolver.default = function() {
    return NoteNameResolver.registerDefault(new NoteNameResolver());
};

/**
 * Register a functionNameResolver with default bindings.
 * @param noteNameResolver - NoteNameResolver
 * @returns NoteNameResolver
 */
NoteNameResolver.registerDefault = function(noteNameResolver) {
    noteNameResolver.register("2", function(resolveFn) {
        return resolveFn("1").modifyPitch(2);
    });
    noteNameResolver.register("3", function(resolveFn) {
        return resolveFn("1").modifyPitch(4);
    });
    noteNameResolver.register("4", function(resolveFn) {
        return resolveFn("1").modifyPitch(5);
    });
    noteNameResolver.register("5", function(resolveFn) {
        return resolveFn("1").modifyPitch(7);
    });
    noteNameResolver.register("6", function(resolveFn) {
        return resolveFn("1").modifyPitch(9);
    });
    noteNameResolver.register("7", function(resolveFn) {
        return resolveFn("1").modifyPitch(11);
    });
    noteNameResolver.register("0", function(resolveFn) {
        return resolveFn("1").modifyPitch(NaN);
    });
    return noteNameResolver;
};

module.exports = NoteNameResolver;

(function() {
    let resolver = new NoteNameResolver();

    resolver.register("1", function() {
        return Note(Fraction(1, 4), 0);
    });

    resolver.register("2", function(resolveFn) {
        return resolveFn("1").modifyPitch(2);
    });

    assert.deepEqual(resolver.resolve("1"), Note(Fraction(1, 4), 0));
    assert.deepEqual(resolver.resolve("2"), Note(Fraction(1, 4), 2));

    assert.throws(function() {
        resolver.register("8", function(resolveFn) {
            return resolveFn("8").modifyPitch(2);
        });
        resolver.resolve("8");
    });
    assert.throws(function() {
        resolver.register("3", function(resolveFn) {
            return resolveFn("0").modifyPitch(2);
        });
        resolver.resolve("3");
    });
})();