const Fraction = require("./../math/fraction");
const Element = require("./element");
var assert = require("assert");

/**
 * A music note.
 * @param duration - Fraction
 * @param pitch - Integer
 * @param origin - Integer: the index of function input this note is related to.
 * @constructor
 */
let Note = function(duration, pitch, origin) {
    // Allow constructor usage without 'new'
    if (!(this instanceof Note)) {
        return new Note(duration, pitch, origin);
    }

    Element.call(this);
    this.type = Element.NOTE;

    if (duration === undefined) duration = Fraction(1);
    if (pitch === undefined) pitch = 0;
    if (origin === undefined) origin = 0;

    assert(duration instanceof Fraction);

    this.duration = duration;
    this.pitch = pitch;
    this.origin = origin;
};

Note.prototype = Object.create(Element.prototype);
Note.prototype.constructor = Note;

/**
 * Multiplies duration by a fraction. Returns a new Note.
 * @param frac - Fraction
 */
Note.prototype.modifyDuration = function(frac) {
    return Note(this.duration.multiply(frac), this.pitch, this.origin);
};

/**
 * Shifts pitch by a number of semitones. Returns a new Note.
 * @param numSemitone - Integer
 */
Note.prototype.modifyPitch = function(numSemitone) {
    return Note(this.duration, this.pitch + numSemitone, this.origin);
};

Note.prototype._getDuration = function() {
    return this.duration;
};

/**
 * Returns {duration, pitch, origin}
 * @returns {string}
 */
Note.prototype.toString = function() {
    return "{" + this.duration + "," + this.pitch + "," + this.origin + "}";
};

Note.fromOrigin = function(originIndex) {
    return Note(Fraction(1), 0, originIndex);
};

module.exports = Note;