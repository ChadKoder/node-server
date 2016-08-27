var fs = require('fs');

module.exports = function(grunt) { 
	grunt.initConfig({
		clean:{
			options: {
				'no-write': false,
				'force': true
			},
			all: ['./output']
		},
		sync: {
                main: {
                    files: [
						{
							expand: true,
							cwd: 'src/',
							src: ['server.js'],
							dest: './output/'
						},
						{
							expand: true,
							cwd: 'src/',
							src: ['users.json'],
							dest: './output/'
						},
						{
							expand: true,
							cwd: 'src/js/functions',
							src: ['*.js'],
							dest: './output/js/functions/'
						}
                    ]
                }
		}
	});
 
    grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-sync');
	
	grunt.registerTask('default', ['clean', 'sync']);
	grunt.registerTask('test', ['sync', 'karma']);
	
};