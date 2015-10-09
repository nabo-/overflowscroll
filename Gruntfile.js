/* ---------------------------------------------
* name: Gruntfile.js format
*
* 開発手順
*
* $ npm i
* $ grunt
*
*
--------------------------------------------- */
module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({

		path: {
			src: 'src',
			build: 'build',
			tmp: 'tmp',
			html_src: 'src/html',
			scss_src: 'src/scss',
			js_src: 'src/js',
			ts_src: 'src/ts',
		},

		clean: ['**/.DS_Store','**/.sass-cache','<%= path.tmp %>'],

		connect: {
			livereload: {
				options: {
					port: 8000
				}
			}
		},

		sass: {
			dist: {
				options: {
					style: 'compact',
					sourcemap: 'none',
					noCache: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= path.scss_src %>',
						src: ['**/*.scss'],
						dest: '<%= path.tmp %>/css/',
						ext: '.css'
					}
				]
			},
		},

		autoprefixer: {
			options: {
				browsers: ['iOS >= 4','Android >= 2.3','Firefox ESR']
			},
			file: {
				src: '<%= path.tmp %>/css/*.css'
			}
		},

		csso: {
			app: {
				expand: true,
				cwd: '<%= path.tmp %>/css/',
				src: ['**/*.css'],
				dest: '<%= path.build %>/css/',
				options: {
					restructure: false
				}
			}
		},

		typescript: {
			// ファイル数の数だけタスクを記述
			overflowscroll: {
				src: ['<%= path.ts_src %>/overflowscroll/*.ts'],
				dest: '<%= path.js_src %>/overflowscroll.js',
				options:{
					sourceMap: false,
					comments : true
				}
			},
		},

		concat: {
			build: {
				src : [
					'<%= path.js_src %>/*.js'
				],
				dest: '<%= path.tmp %>/js/all.js'
			},
			dev: {
				src : [
					'<%= path.js_src %>/*.js'
				],
				dest: '<%= path.build %>/js/all.js'
			}
			
		},

		uglify: {
			normal: {
				files: {
					'<%= path.build %>/js/all.js' : '<%= path.tmp %>/js/all.js',
				}
			}
		},


		assemble: {
			options: {
				layoutdir: '<%= path.html_src %>/layouts/',
				partials: '<%= path.html_src %>/partials/*.hbs',
				helpers: ['handlebars-helper-prettify'],
				prettify: {
					condense: true,
					padcomments: true,
					indent: 4,
					unformatted: ['br', 'strong', 'span', 'a', 'sub', 'sup', 'b', 'i', 'u']
				},
				flatten: true
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'src/html/pages/',
					src: '**/*.hbs',
					dest: 'build/'
				}]
			}
		},

		watch: {
			css: {
				files: ['<%= path.scss_src %>/**/*.scss'],
				tasks: ['build:css']
			},
			javascript: {
				files: ['<%= path.js_src %>/**/*.js'],
				tasks: ['dev:js']
			},
			typescript: {
				files: ['<%= path.ts_src %>/**/*.ts'],
				tasks: ['dev:ts']
			},
			html: {
				files: ['<%= path.html_src %>/**/*.hbs'],
				tasks: ['build:html']
			},
			options: {
				livereload: true
			}
		}

	});

	grunt.registerTask('build:html', ['assemble']);
	grunt.registerTask('build:css', ['sass', 'autoprefixer', 'csso']);
	grunt.registerTask('build:ts', ['typescript', 'concat:build', 'uglify']);
	grunt.registerTask('build:js', ['concat:build', 'uglify']);
	grunt.registerTask('build', ['build:html', 'build:css', 'build:ts', 'build:js', 'clean']);
	
	grunt.registerTask('dev:ts', ['typescript', 'concat:dev']);
	grunt.registerTask('dev:js', ['concat:dev']);

	grunt.registerTask('live', ['connect', 'watch']);

	grunt.registerTask('default', 'build');
}