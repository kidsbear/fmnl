const assert = require("assert");

const Fraction = require('./../../math/fraction');
const Element = require('./../../elements/element');
const Elements = require('./../../elements/elements');
const Note = require('./../../elements/note');
const List = require('./../../elements/list');
const Wrapper = require('./../../elements/wrapper');

/**
 * A rawFunction can be applied to an Elements to form a new Elements.
 * 1-Lists will be automatically flattened.
 * @param fn - Element => Element
 * @constructor
 */
let RawFunction = function(fn) {
    // Allow constructor usage without 'new'
    if (!(this instanceof RawFunction)){
        return new RawFunction(fn);
    }

    this.mapFn = fn;
};

/**
 * Apply this function to each element.
 * @param elements - Elements
 */
RawFunction.prototype.applyAll = function(elements) {
    return elements.flatMap(this.apply.bind(this));
};

/**
 * Apply this function to each element with wrapper style. Returns a List.
 * @param elements - Elements
 * @returns List
 */
RawFunction.prototype.applyAllAndFlip = function(elements) {
    return elements.mapAndFlip(this.apply.bind(this));
};

/**
 * Apply this function to an element.
 * @param element - Element
 * @returns Elements
 */
RawFunction.prototype.apply = function(element) {
    let newElement = this.mapFn(element);
    if (newElement.type == Element.LIST && newElement.size == 1) {
        return newElement.getElements(0);
    } else {
        return Elements(newElement);
    }
};

RawFunction.templates = {};

/**
 * A template that handles 3 cases with 3 function passed
 * @param caseNote - Note => Element
 * @param caseList - List => Element
 * @param caseWrapper => Wrapper => Element
 */
RawFunction.templates.case3 = function(caseNote, caseList, caseWrapper) {
    return RawFunction((e) => {
        switch (e.type) {
            case Element.NOTE: return caseNote(e);
            case Element.LIST: return caseList(e);
            case Element.WRAPPER: return caseWrapper(e);
        }
    });
};

/**
 * A template that handles note with given function and dispatch others.
 * @param caseNote - Note => Element
 */
RawFunction.templates.dispatching = function(caseNote) {
    let fn = RawFunction.templates.case3(caseNote,
        function(list) {
            let newElementsArray = [];
            for (let i = 0; i < list.size; i++) {
                let elements = list.getElements(i);
                let newElements = fn.applyAll(elements);
                newElementsArray.push(newElements);
            }
            return List(...newElementsArray);
        },
        function(wrapper) {
            let elements = wrapper.getElements();
            let newElementsList = fn.applyAllAndFlip(elements);

            // Wrap each segment of result in a Wrapper
            return List(Elements(...newElementsList.elementsGroups.map((es) => Wrapper(es))));
        }
    );
    return fn;
};

RawFunction.templates.castList = function(caseList) {
    let fn = RawFunction.templates.case3(
        function(note) {
            return caseList(List(Elements(note)), Element.NOTE, note);
        },
        (list) => caseList(list, Element.LIST),
        function(wrapper) {
            return caseList(List(Elements(wrapper)), Element.WRAPPER, wrapper);
        }
    );
    return fn;
};

RawFunction.templates.skipList = function(fn) {
    return RawFunction.templates.case3(
        function(note) {
            throw new Error("SkipList applied to note");
        },
        function(list) {
            let newElementsArray = [];
            for (let i = 0; i < list.size; i++) {
                let elements = list.getElements(i);
                let newElements = fn.applyAll(elements);
                newElementsArray.push(newElements);
            }
            return List(...newElementsArray);
        },
        function(wrapper) {
            throw new Error("SkipList applied to wrapper");
        }
    );
};

RawFunction.templates.check = function(x) {
    return RawFunction.templates.castList(
        function(list) {
            let elements = [];
            for (let i = 0; i < x; i++) {
                elements.push(list.getElements(i % list.size));
            }
            return List(...elements);
        }
    )
};

RawFunction.templates.wrapperOnly = function(caseWrapper) {
    return RawFunction.templates.case3(
        (note) => { throw new Error("WrapperOnly applied to note") },
        (list) => { throw new Error("WrapperOnly applied to list") },
        (wrapper) => caseWrapper(wrapper)
    )
};

RawFunction.templates.fromFunction1 = function(elementsStr) {
    const FunctionEvaluator = require('./../evaluator/functionEvaluater');
    const NoteNameResolver = require('./../noteNameResolver');
    const FunctionNameResolver = require('./../functionNameResolver');

    let noteNameResolver = NoteNameResolver.default();
    noteNameResolver.register("1", () => Note(Fraction(1),0,0));
    let elements = FunctionEvaluator.evaluate(elementsStr, FunctionNameResolver.default(), noteNameResolver);
    return RawFunction.templates.fromElements(elements, 1);
};

RawFunction.templates.fromElements = function(elements, patternMatcherSize) {
    let fn = RawFunction.templates.castList(function(list, actualType, original) {
        let mainFn = RawFunction.templates.dispatching(function (note) {
            return List(RawFunction.templates.dispatching(function (originNote) {
                return originNote.modifyDuration(note.duration).modifyPitch(note.pitch);
            }).applyAll(list.getElements(note.origin)));
        });
        let skipFn = RawFunction.templates.skipList(fn);
        let wrapperFn = RawFunction.templates.wrapperOnly(function(wrapper) {
            return List(mainFn.applyAll(elements));
        });

        switch (actualType) {
            case Element.LIST:
                if (list.size == patternMatcherSize && patternMatcherSize > 1) {
                    return List(mainFn.applyAll(elements));
                } else {
                    return List(skipFn.apply(list));
                }
            case Element.NOTE:
                if (patternMatcherSize == 1) {
                    return List(mainFn.applyAll(elements));
                } else {
                    console.warn(`Custom function ${name} applied to note`);
                    return original;
                }
            case Element.WRAPPER:
                if (patternMatcherSize == 1) {
                    return List(wrapperFn.apply(original));
                } else {
                    console.warn(`Custom function ${name} applied to wrapper`);
                    return original;
                }
        }
    });
    return fn;
};

module.exports = RawFunction;

// Tests
(function() {
    let Es = Elements;
    let N = Note;
    let L = List;

    let copy = RawFunction((e) => L(Es(e, e)));
    assert.deepEqual(copy.applyAll(Es(N())), Es(N(), N()));

    let parallel = RawFunction((e) => L(Es(e), Es(e)));
    assert.deepEqual(parallel.applyAll(Es(N())), Es(L(Es(N()), Es(N()))));
})();