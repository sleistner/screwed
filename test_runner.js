var SCREWED_DIR = environment['screwed.dir'],
    SCREW_UNIT_DIR = SCREWED_DIR + '/screw-unit';

load(SCREWED_DIR + '/screwed.js');

Screwed.CommandLine = {

    require: function(file, options) {
        options = options || {};
        load(options.system ? file : this.prepareFilenameForRequireBasedOnSpecDirectory(file));
    },

    prepareFilenameForRequireBasedOnSpecDirectory: function(filename){
        if (filename === null || (/^\//).test(filename)) { return filename; }
        return (this.specDirname === null) ? filename : (this.specDirname + "/" + filename);
    },

    debug: function(message) {
        print(message);
    },

    get fixtureFile() {
        return "fixtures/" + this.specFile.replace(/^(.*?)_spec\.js$/, "$1.html");
    },

    get specDirname() {
        if (this.specFile === null) {
            return null;
        }
        var pathComponents = this.specFile.split("/");
        var filename = pathComponents.pop();
        return pathComponents.length > 0 ? pathComponents.join("/") : null;
    },

    get specBasename() {
        if (this.specFile === null) {
            return null;
        }
        return this.specFile.split("/").pop();
    }
};

if (Screwed.loaded !== true) {
    if (arguments.length === 0) {
        print('Usage: test_runner.js spec/javascripts/file_spec.js');
        quit(1);
    }

    Screwed.CommandLine.specFile = arguments[0];

    // Mock up the Firebug API for convenience.
    var console = console || { "debug": Screwed.CommandLine.debug };
    var require = function(file, options) { Screwed.CommandLine.require(file, options); };

    load(SCREWED_DIR + "/env.rhino.js");

    var helper = new java.io.File(SCREWED_DIR + '/../../screwed_helper.js');
    if (helper.exists()) {
        load(helper.toURL());
    }

    Envjs(Screwed.CommandLine.fixtureFile, {
        log: function(){}
    });

    Screwed.requireCommons(SCREWED_DIR, SCREW_UNIT_DIR);
    load(SCREWED_DIR + '/consoleReportForRake.js');

    Screwed.integrate();
    Screwed(function() { fire('before'); });

    print("Running " + Screwed.CommandLine.specFile + " with fixture '" + Screwed.CommandLine.fixtureFile + "'...");
    Screwed.loaded = true;

    load(Screwed.CommandLine.specFile);
    jQuery(window).trigger('load');

    Screwed(function() { fire('after'); });
}

