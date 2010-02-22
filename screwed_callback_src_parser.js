/** [AGI]
 * Execute a passed callback, if any, in a crossbrowser way and respecting scripts order.
 * @param {HTMLCollection} script a list of all script node prsent in the current dom
 */
(function(script){
    for (var i = 0, length = script.length; i < length; ++i) {
        if (!script[i]._screwed && (/\?callback=([^&]+)(?:&|$)/).test(script[i].src)) {
            script[i]._screwed = true;
            Function(decodeURIComponent(RegExp.$1))();
        }
    }
})(document.getElementsByTagName("script"));
