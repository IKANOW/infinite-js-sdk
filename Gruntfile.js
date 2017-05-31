/*******************************************************************************
 * Copyright 2015, The IKANOW Open Source Project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

// Node package description
var pkg = require('./package.json');

module.exports = function(grunt) {

    grunt.initConfig({

        pkg: pkg,

        // Angular package builder
        'angular-builder': {
            options: {
                mainModule: 'infinite-api'
            },
            app: {
                src:  [
                  'src/InfiniteApi.js',
                  'src/**/*.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        clean: {
            docs: {
                options: { force: true },
                src: ['docs']
            },
            pre: {
                options: { force: true },
                src: ['build', 'dist']
            },
            post: {
                options: { force: true },
                src: []
            }
        },

        express: {
            docs: {
                options: {
                    port: 8090,
                    hostname: "0.0.0.0",
                    bases: ["docs/"],
                    open: true
                }
            }
        },

        //Documentation generator config
        ngdocs: {
            options: {
                dest: 'docs',
                html5Mode: false,
                title: "Infinite Platform Javascript SDK"
            },
            api: {
                src: ['src/**/*.js'],
                title: 'Infinite Platform Javastipt SDK'
            }
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'dist/<%= pkg.name %>.map'
                },
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
                }
            }
        },

        // grunt-watch will monitor the projects files
        watch: {
            docs:{
                files: ['src/**/*.js'],
                tasks: ['ngdocs']
            }
        }

    });


    grunt.loadNpmTasks('grunt-angular-builder');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	  grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-ngdocs');

    grunt.registerTask ('release', [
        'clean:pre',
        'angular-builder',
        'uglify:dist',
        'clean:post'
    ]);

    // Generate JSDocs and display
    grunt.registerTask('docs', [
        'clean:docs',
        'ngdocs',
        'express:docs',
        "watch:docs"
    ]);
};