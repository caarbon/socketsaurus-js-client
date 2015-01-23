module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    force: true,
    // Task configuration.
    jshint: {
      all: {
        src: [
          '**/*.js',
          '!node_modules/**',
          '!ignore/**',
          '!Gruntfile.js',
          '!client.min.js'
        ],
        options: {
          jshintrc: true
        }
      }
    },
    jscs: {
      src: [
        '**/*.js',
        '!node_modules/**',
        '!ignore/**',
        '!Gruntfile.js',
        '!client.min.js'
      ],
      options: {
        config: '.jscsrc'
      }
    },
    concurrent: {
      options: {
        logConcurrentOutput: false
      },
      lint: ['jshint', 'jscs']
    },
    uglify: {
      my_target: {
        files: {
          'client.min.js': ['client.js']
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  require('matchdep').filterAll(['grunt-*']).forEach(grunt.loadNpmTasks);

  // syntax and code styles
  grunt.registerTask('lint', ['concurrent:lint']);

  // `$ grunt lint`
  grunt.registerTask('default', ['lint']);
};
