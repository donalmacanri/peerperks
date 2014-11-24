'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		uglify: {
			options: {
				mangle: false,
				sourceMap: true,
				sourceMapIncludeSources: true,
				beautify: true
			},
			deps: {
				files: {
					'build/js/compiled/deps.js': [
						'web/components/lodash/dist/lodash.js',
						'web/components/angular/angular.min.js',
						'web/components/angular-route/angular-route.min.js',
						'web/components/firebase/firebase.js',
						'web/components/angularfire/dist/angularfire.min.js',
						'web/components/angularjs-gravatardirective/dist/angularjs-gravatardirective.min.js'
					]
				}
			},
			client: {
				files: {
					'build/js/compiled/client.js': [
						'build/js/app-templates.js',
						'build/js/compiled/config.app.js',
						'web/js/client.js',
						'web/js/directives/**/*.js',
						'web/js/services/**/*.js',
						'web/js/filters/**/*.js'
					]
				}
			},
			compress: {
				options: {
					compress: true,
					sourceMap: false,
					mangle: false
				},
				files: {
					'build/js/compiled/deps.js': 'build/js/compiled/deps.js',
					'build/js/compiled/client.js': 'build/js/compiled/client.js'
				}
			}
		},
		sass: {
			build: {
				options: {
					outputStyle: 'nested',
					includePaths: [
						'web/components/bootstrap-sass-official/vendor/assets/stylesheets'
					]
				},
				files: {
					'build/css/compiled/base.css': 'web/css/base.scss'
				}
			}
		},
		cssmin: {
			options: {
				keepSpecialComments: 0
			},
			build: {
				files: {
					'build/css/compiled/site.css': [
						'build/css/compiled/base.css'
					]
				}
			}
		},
		html2js: {
			options: {
				base: '.',
				module: 'app-templates',
				rename: function (modulePath) {
					return modulePath.replace('web/js/', '');
				}
			},
			templates: {
				src: [
					'web/js/directives/**/*.html'
				],
				dest: 'build/js/app-templates.js'
			}
		},
		clean: {
			build: [
				'build'
			],
			css: [
				'build/css/compiled'
			],
			js: [
				'build/js/compiled'
			]
		},
		copy: {
			build: {
				expand: true,
				cwd: 'web',
				src: [
					'*',
					'components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/*'
				],
				dest: 'build/'
			},
			html: {
				expand: true,
				cwd: 'web',
				src: [
					'*.html'
				],
				dest: 'build/'
			}
		},
		connect: {
			server: {
				options: {
					port: 3002,
					hostname: '*',
					base: 'build/',
					livereload: 35730
				}
			}
		},
		ngconstant: {
			options: {
				space: '	',
				name: 'config.app',
				dest: 'build/js/compiled/config.app.js'
			},
			build: {
				constants: grunt.file.readJSON('config.json')
			}
		},
		watch: {
			options: {
				livereload: 35730
			},
			css: {
				files: ['web/css/*.scss'],
				tasks: ['sass:build', 'cssmin:build']
			},
			js: {
				files: ['test/**/*.spec.js', 'web/js/*.js', 'web/js/directives/**/*.js', 'web/js/services/**/*.js', 'web/js/filters/**/*.js'],
				tasks: ['uglify:client']
			},
			html: {
				files: ['web/*.html'],
				tasks: ['copy:html']
			}
		}
	});
	
	grunt.registerTask('default', ['build', 'connect:server', 'watch']);
	grunt.registerTask('server', ['connect:server']);
	
	grunt.registerTask('build', ['clean:build', 'build:css', 'build:js', 'copy:build',]);
	grunt.registerTask('build:js', ['clean:js', 'html2js:templates', 'ngconstant:build', 'uglify:deps', 'uglify:client']);
	grunt.registerTask('build:css', ['clean:css', 'sass:build', 'compress:css']);
	grunt.registerTask('build:dist', ['build', 'uglify:compress']);
	grunt.registerTask('compress:css', ['cssmin:build']);
};
