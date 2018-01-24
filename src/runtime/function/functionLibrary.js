const RawFunction = require("./rawFunction");
const Fraction = require("./../../math/fraction");
const Element = require("./../../elements/element");
const Elements = require("./../../elements/elements");
const Note = require("./../../elements/note");
const assert = require("assert");
const List = require("./../../elements/list");

let FunctionLibrary = {};

FunctionLibrary.tuple = RawFunction.templates.dispatching(function(note) {
    return note.modifyDuration(Fraction(2, 3));
});
FunctionLibrary.halveDuration = RawFunction.templates.dispatching(function(note) {
    return note.modifyDuration(Fraction(1, 2));
});
FunctionLibrary.doubleDuration = RawFunction.templates.dispatching(function(note) {
    return note.modifyDuration(Fraction(2));
});
FunctionLibrary.check = (x) => RawFunction.templates.castList(function(list, origin) {
    if (list.size == 1 && origin == Element.LIST) {
        return List(FunctionLibrary.check(x).applyAll(list.getElements(0)));
    } else {
        return List(RawFunction.templates.check(x).apply(list));
    }

});
FunctionLibrary.repeat = (x) => RawFunction.templates.castList(function(list) {
    if (list.size > 1) {
        return List(FunctionLibrary.repeat(x).apply(List(Elements(list))));
    }
    let elements = list.getElements(0);
    let checkedElements = RawFunction.templates.check(x).applyAll(elements);
    let checkedElementArray = checkedElements.getArray();
    let res = Elements();
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < checkedElementArray.length; j++) {
            let list = checkedElementArray[j];
            assert.deepEqual(list.type, Element.LIST);
            res = Elements.join(res, list.getElements(i));
        }
    }
    return List(res);
});
FunctionLibrary.reverse = (x) => RawFunction.templates.castList(function(list) {
    let checkedElements = RawFunction.templates.check(x).apply(list); //?
    return List(RawFunction.templates.castList((list) => {
        return List(...list.elementsGroups.reverse());
    }).applyAll(checkedElements));
});
FunctionLibrary.flatten = (x) => RawFunction.templates.castList(function(list) {
    let checkedElements = RawFunction.templates.check(x).apply(list); //?
    return List(RawFunction.templates.castList((list) => {
        return List(Elements.join(...list.elementsGroups));
    }).applyAll(checkedElements));
});
FunctionLibrary.merge = (x) => RawFunction.templates.castList(function(list) {
    if (list.size > 1) {
        console.warn("Merge" + x + " had no effect on " + list.toString());
        return list;
    }
    let elements = list.getElements(0);
    let checkedElements = RawFunction.templates.check(x).applyAll(elements);
    let res = []; // [[Elements]]
    for (let i = 0; i < x; i++) {
        res[i] = [];
    }
    checkedElements.getArray().forEach((list) => {
        for (let i = 0; i < x; i++) {
            res[i].push(list.getElements(i));
        }
    });
    let res2 = []; // [Elements]
    for (let i = 0; i < x; i++) {
        res2[i] = Elements.join(...res[i]);
    }
    return List(...res2);
});
FunctionLibrary.inverse = (x) => RawFunction.templates.castList(function(list) {
    let checkedElements = RawFunction.templates.check(x).apply(list); //?
    return List(RawFunction.templates.castList((list) => {
        let copy = list.elementsGroups.slice();
        let first = copy.shift();
        return List(...copy, first);
    }).applyAll(checkedElements));
});
FunctionLibrary.get = (x) => RawFunction.templates.castList(function(list) {
    return List(list.elementsGroups[x % list.size]);
});


module.exports = FunctionLibrary;