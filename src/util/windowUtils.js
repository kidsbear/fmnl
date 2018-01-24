let WindowUtils = {};

WindowUtils.registerFrame = function(callback) {
    let step = function() {
        callback();
        window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
};

module.exports = WindowUtils;