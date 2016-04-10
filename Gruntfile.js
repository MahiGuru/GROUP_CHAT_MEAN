module.exports = function (grunt) {
    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    grunt.initConfig({ 
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        concat : {
            js : {
                src : ["public/src/scripts/controllers/module.js", "public/src/scripts/controllers/loginCtrl.js", "public/src/scripts/controllers/signupCtrl.js", "public/src/scripts/controllers/editCtrl.js", "public/src/scripts/controllers/chatCtrl.js",  
                    "public/src/scripts/directives/**/*.js"],
                dest : "public/dest/app-debug.js"
            },
            css : {
                src : ["public/src/stylesheets/**/*.css"],
                dest : "public/dest/style-debug.css"
            }
        },
        uglify : {
            build: {
                files: {
                    'public/dest/app.min.js': 'public/dest/app-debug.js'
                }
            }
        },
        cssmin: {
            options: {
                banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
            },
            build: {
                files: {
                    'public/dest/style.min.css': 'public/dest/style-debug.css'
                }
            }
        },
        watch : {
            js : {
                files : ["<%= concat.js.src %>"],
                tasks : ["concat:js"]
            },
            css : {
                files : ["<%= concat.css.src %>"],
                tasks : ["concat:css"]
            }
        }  
    });
    
    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // =========================================================================== 
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify'); 
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", ["concat", "uglify", "watch"])

};