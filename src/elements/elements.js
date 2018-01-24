const ArrayUtils = require('./../util/arrayUtils');
const Fraction = require('./../math/fraction');

/**
 * A group of elements.
 * @constructor
 */
let Elements = function(...elements) {
    // Allow constructor usage without 'new'
    if (!(this instanceof Elements)) {
        return new Elements(...elements);
    }

    this.elements = elements;
    this.duration = undefined;
};

/**
 * Make an elements out of several other elements.
 * @param elements - Elements
 */
Elements.join = function(...elements) {
    return Elements(...ArrayUtils.flatMap(elements, (es) => es.getArray()));
};

Elements.prototype.getDuration = function() {
    if (this.duration !== undefined) {
        return this.duration;
    } else {
        let sum = Fraction(0);
        this.elements.forEach((e) => {
            sum = sum.add(e.getDuration());
        });
        return this.duration = sum;
    }
};

/**
 * Returns the array representation of this Elements.
 * @returns [Element]
 */
Elements.prototype.getArray = function() {
    return this.elements;
};

/**
 * Maps all elements.
 * @param fn - Element => Element
 */
Elements.prototype.map = function(fn) {
    return Elements(...this.elements.map(fn));
};

/**
 * Maps all elements and unwrap a layer of elements.
 * @param fn - Element => Elements
 */
Elements.prototype.flatMap = function(fn) {
    return Elements(...ArrayUtils.flatMap(this.elements, (e) => fn(e).getArray()));
};

/**
 * Maps all elements, flip and wrap with a List.
 * This list is only for storage purpose and should not be treated as a real List.
 * TODO: find a better way to do it.
 * @param fn - Element => Elements
 */
Elements.prototype.mapAndFlip = function(fn) {
    const List = require('./list');
    let arr2d = ArrayUtils.mapAndFlip(this.elements, (e) => fn(e).getArray());
    return List(...([...arr2d].map((arr) => Elements(...arr))));
};

/**
 * Returns concatenation of all elements.
 * @returns {string}
 */
Elements.prototype.toString = function() {
    let s = "";
    for (let i = 0; i < this.elements.length; i++) {
        s += this.elements[i];
        if (i < this.elements.length - 1) s += "";
    }
    return s;
};

module.exports = Elements;