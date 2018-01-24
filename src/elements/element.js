
/**
 * Elements are units to be processed while compiling, and can be easily translated to midi notes.
 * @constructor
 */
let Element = function() {
    this.type = Element.ABSTRACT;
    this.duration = undefined;
};

Element.prototype.toString = function() {
    return "Abstract element";
};

Element.prototype.getDuration = function() {
    if (this.duration !== undefined) {
        return this.duration;
    } else {
        return this.duration = this._getDuration();
    }
};

Element.prototype._getDuration = function() {
    throw new Error("_getDuration not implemented");
};

Element.ABSTRACT = "Abstract";
Element.NOTE = "Note";
Element.LIST = "List";
Element.WRAPPER = "Wrapper";

module.exports = Element;