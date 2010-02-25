var Screwed = Screwed || (function() {

    var $FtoString = Function.prototype.toString;
    var filter = { before: [], after: [] };

    var api = {
        before: function(callback) {
            filter.before.push(callback);
        },

        after: function(callback) {
            filter.after.push(callback);
        },

        fire: function(context) {
            var callbacks = filter[context], callback;
            while((callback = callbacks.pop())) {
                callback();
            }
        }
    };

    return function(fn) {
        if (!(/^[^{]*?\{([^\x00]*)\}\s*$/).test($FtoString.call(fn))) {
            throw new Error("RegExp unable to parse the callback\n" + fn);
        }
        new Function('api', 'with (api) { ' + RegExp.$1 + ' }').call(this, api);
    };

})();

Screwed.requireCommons = function(screwed_dir, screw_unit_dir) {
    require(screw_unit_dir + '/jquery-1.3.2.js', { system: true });
    require(screw_unit_dir + '/jquery.fn.js', { system: true });
    require(screw_unit_dir + '/jquery.print.js', { system: true });
    require(screw_unit_dir + '/screw.builder.js', { system: true });
    require(screw_unit_dir + '/screw.matchers.js', { system: true });
    require(screw_unit_dir + '/screw.events.js', { system: true });
    require(screw_unit_dir + '/screw.behaviors.js', { system: true });
    require(screwed_dir + '/js-mocka-minified.js', { system: true });
    require(screwed_dir + '/nwevents.js', { system: true });
};

Screwed.integrate = function() {
    JSMocka.Integration.ScrewUnit();
    jQuery.extend(Screw.Matchers, {
        fire: function (query, type) {
            jQuery(query).each(function (i, node) {
                NW.Event.dispatch(node, type, false);
            });
        }
    });
};

if (typeof document !== 'undefined') {
    Screwed.Browser = {

        require: function(url, options) {
            options = options || {};
            this.createScriptTag(options.system ? url : this.treatUrlAsAbsoluteToSpecFile(url), options.callback);
        },

        treatUrlAsAbsoluteToSpecFile: (function () {
            var protocol = location.protocol === "file:" ? location.protocol : "";
            return function (url) {
                if (/^(file:\/\/|https?\:\/)/.test(url)) {
                    return url;
                }
                return protocol + ((/^\//).test(url) ? url : location.pathname.replace(/fixtures.*$/, '') + url);
            };
        }()),

        createScriptTag: function(url, callback) {
            var html = '';
            if (callback) {
                html += '<script src="' + url + '?callback=' + encodeURIComponent(callback) + '&_=' + new Date().getTime() + '" type="text/javascript"><' + '/script>';
                html += '<script src="' + Screwed.Browser.screwedDir() + '/screwed_callback_src_parser.js?_=' + new Date().getTime() + '"><' + '/script>';
            } else {
                html += '<script src="' + url + '?_=' + new Date().getTime() + '" type="text/javascript"><' + '/script>';
            }
            document.writeln(html);
        },

        link: function(url) {
            var link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = url;
            document.getElementsByTagName('head')[0].appendChild(link);
        },

        debug: function(message) {
            document.writeln(message + ' <br/>');
        },

        deriveSpecNameFromCurrentFile: function() {
            return location.pathname.replace('fixtures/', '').replace('.html', '_spec.js');
        },

        screwedDir: function() {
            var scripts = document.getElementsByTagName('script'), __fileName = '/screwed.js';
            for (var i = 0, src, len = scripts.length; i < len; i++) {
                src = scripts[i].getAttribute('src');
                if (new RegExp(__fileName).test(src)) {
                    return src.replace(__fileName, '');
                }
            }
            return null;
        }
    };

    if (!Screwed.loaded) {
        var require = function(url, options) { Screwed.Browser.require(url, options); },
            load = require,
            debug = Screwed.Browser.debug,
            screwed_dir = Screwed.Browser.screwedDir();
            screw_unit_dir = screwed_dir + '/screw-unit';

        Screwed.Browser.link(screw_unit_dir + '/screw.css');
        Screwed.requireCommons(screwed_dir, screw_unit_dir);

        Screwed(function() {
            before(function() {
                Screwed.loaded = true;
                Screwed.integrate();
                if (!(/suite(-.*?)?\.html/).test(document.location)) {
                    require(Screwed.Browser.deriveSpecNameFromCurrentFile());
                }
                fire('after');
            });
        });

        require(screwed_dir + '/../../screwed_helper.js', {
            callback: "Screwed(function() { fire('before'); })",
            system: true
        });
    }
}
