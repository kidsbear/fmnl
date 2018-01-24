const assert = require('assert');

/**
 * A fraction interface.
 * @param n - numerator
 * @param d - denominator.
 * @constructor
 */
let Fraction = function(n, d) {
    // Allow constructor usage without 'new'
    if (!(this instanceof Fraction)) {
        return new Fraction(n, d);
    }

    // Make d optional
    if (d === undefined) d = 1;

    this.n = n;
    this.d = d;
    this.reduce();

    // reverse negative d
    if (this.d < 0) {
        this.n *= -1;
        this.d *= -1;
    }
};

Fraction.fromFloat = function(n) {
    let parsed = Number.parseFloat(n.toFixed(8));
    let intPart = Number.parseInt(parsed);
    let floatPart = Fraction(Math.round(n * 1e8), 1e8);
    return Fraction(intPart).add(floatPart);
};

Fraction.prototype.numerator = function() {
    return this.n;
};

Fraction.prototype.denominator = function() {
    return this.d;
};

Fraction.prototype.add = function(other) {
    return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d);
};

Fraction.prototype.multiply = function(other) {
    return new Fraction(this.n * other.n, this.d * other.d);
};

Fraction.prototype.reduce = function() {
    let gcd = this.gcd(this.n, this.d);
    this.n = this.n / gcd;
    this.d = this.d / gcd;
};

Fraction.prototype.gcd = function() {
    let fn = (n, d) => d ? fn(d, n % d) : n;
    return fn(this.n, this.d);
};

Fraction.prototype.toFloat = function() {
    return this.n / this.d;
};

Fraction.prototype.toString = function() {
    if (this.d == 1) { return "" + this.n }
    return this.n + "/" + this.d;
};

module.exports = Fraction;

// Tests
(function() {
    assert.deepEqual(Fraction(2, 4), Fraction(1, 2));
    assert.deepEqual(Fraction(-2, 4), Fraction(-1, 2));
    assert.deepEqual(Fraction(2, -4), Fraction(-1, 2));
    assert.deepEqual(Fraction(-2, -4), Fraction(1, 2));
    assert.deepEqual(Fraction(3, 4).multiply(Fraction(5, 6)), Fraction(5, 8));
    assert.deepEqual(Fraction(3, 4).add(Fraction(5, 6)), Fraction(19, 12));
})();