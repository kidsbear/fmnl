
let ArrayUtils = {};

ArrayUtils.flatMap = function(arr, fn) {
    return arr.map(fn).reduce((acc, xs) => acc.concat(xs), []);
};

ArrayUtils.mapAndFlip = function(arr, fn) {
    let newArr = arr.map(fn);
    let res = [];
    let i = 0;
    while (true) {
        let inner = [];
        for (let j = 0; j < newArr.length; j++) {
            if (newArr[j][i] !== undefined) {
                inner.push(newArr[j][i]);
            }
        }
        if (inner.length > 0) {
            res.push(inner);
            i++;
        } else {
            break;
        }
    }
    return res;
};

module.exports = ArrayUtils;