const Element = require("./element");
const Elements = require("./elements");
const assert = require("assert");

/**
 * A list of group of elements.
 * @constructor
 */
let List = function(...elementsArray) {
    // Allow constructor usage without 'new'
    if (!(this instanceof List)) {
        return new List(...elementsArray);
    }

    Element.call(this);
    this.type = Element.LIST;

    this.elementsGroups = elementsArray;
    this.size = elementsArray.length;

    for (let i = 0; i < elementsArray.length; i++) {
        assert(elementsArray[i] instanceof Elements);
    }
};

List.prototype = Object.create(Element.prototype);
List.prototype.constructor = List;

List.prototype.getElements = function(index) {
    return this.elementsGroups[index];
};

List.prototype._getDuration = function() {
    return this.getElements(0).getDuration();
}

/**
 * Returns (..., ...)
 * @returns {string}
 */
List.prototype.toString = function() {
    let s = "(";
    for (let i = 0; i < this.elementsGroups.length; i++) {
        s += this.elementsGroups[i];
        if (i < this.elementsGroups.length - 1) s += ",";
    }
    s += ")";
    return s;
};

module.exports = List;