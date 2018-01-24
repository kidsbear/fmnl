const Element = require("./element");

/**
 * A wrapper of elements.
 * @constructor
 */
let Wrapper = function(elements) {
    // Allow constructor usage without 'new'
    if (!(this instanceof Wrapper)){
        return new Wrapper(elements);
    }

    Element.call(this);
    this.type = Element.WRAPPER;

    this.elements = elements;
};

Wrapper.prototype = Object.create(Element.prototype);
Wrapper.prototype.constructor = Wrapper;

Wrapper.prototype.getElements = function() {
    return this.elements;
};

Wrapper.prototype._getDuration = function() {
    return this.elements.getDuration();
};

/**
 * Returns [...]
 * @returns {string}
 */
Wrapper.prototype.toString = function() {
    return "[" + this.elements + "]";
};

module.exports = Wrapper;