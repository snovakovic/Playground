module.exports = function(grunt) {
  var stamp = new Date().getTime();

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.initConfig({

/* ========================================================================
    Build 
========================================================================== */ 
        /*
        * Remove production folder
        */
        clean: {
            build: {
                src: [ 'production' ]
            }
        },

        //minify js
        uglify: {
            js: {
                files: {
                    //need to be in order
                    'production/js/ttt.min.js': [
                        'app/js/namespace.js', 
                        'app/js/resources.js', 
                        'app/js/s.js',
                        'app/js/view.js',
                        'app/js/logic.js', 
                        'app/js/socket.js', 
                        'app/js/canvas.js', 
                        'app/js/ttt.js'
                    ]
                }
            }
        },

        copy: {
            build: {
                files: [
                    // includes files within
                    //  path
                    { 
                        expand: true, 
                        cwd: 'app/',
                        src: ['index.html', 'css/*', 'server.js', 'logo.png'], 
                        dest: 'production/', 
                        filter: 'isFile'
                    }
                ]
            }, 
        },

        /*
        * Html preprocesor
         */
        usemin: {
          html: ['production/index.html'],
        },


/* ========================================================================
    Grunt server and auto reload
    ========================================================================== */  
    // grunt-contrib-connect will serve the files of the project
    // on specified port and hostname
    connect: {
        all: {
            options:{
                port: 9000,
                hostname: "0.0.0.0",
                // No need for keepalive anymore as watch will keep Grunt running
                //keepalive: true,

                // Livereload needs connect to insert a cJavascript snippet
                // in the pages it serves. This requires using a custom connect middleware
                middleware: function(connect, options) {
                    return [
                        // Load the middleware provided by the livereload plugin
                        // that will take care of inserting the snippet
                        require('grunt-contrib-livereload/lib/utils').livereloadSnippet,

                        // Serve the project folder
                        connect.static(options.base)
                    ];
                }
              }
            }
        },

    // grunt-open will open your browser at the project's URL
    open: {
        all: {
            // Gets the port from the connect configuration
            path: 'http://localhost:<%= connect.all.options.port%>/app/'
        }
    },

    // grunt-regarde monitors the files and triggers livereload
    // Surprisingly, livereload complains when you try to use grunt-contrib-watch instead of grunt-regarde 
    regarde: {
        all: {
            // This'll just watch the index.html file, you could add **/*.js or **/*.css
            // to watch Javascript and CSS files too.
            files:['**/*.html', '**/*.js', '**/*.css'],
            // This configures the task that will run when the file change
            tasks: ['livereload']
        }
    },

  });


    // Creates the `server` task
    grunt.registerTask('server',['livereload-start', 'connect', 'open', 'regarde']);
    
    //register build task
    grunt.registerTask('build',['clean', 'uglify', 'copy', 'usemin']);
    
  };