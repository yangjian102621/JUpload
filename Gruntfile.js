
module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var BANNER = '/* <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>), Copyright (C)' +
		' r9it.com,*/\r\n';
	var lang = grunt.option('lang') || 'zh-CN';

	grunt.initConfig({
		pkg : pkg,

		uglify : {
			//压缩js
			build : {

				files: [
					{
						src : 'bupload/BUpload.js',
						dest : 'BUpload.js'
					},
					{
						src : 'jupload/JUpload.js',
						dest : 'JUpload.js'
					}
				]

			}
		},

		//压缩css
		cssmin : {
			options: {
				banner : BANNER,
				beautify: {
					//中文ascii化
					ascii_only: true
				}
			},
			build : {
				files: [
					{
						src: 'bupload/css/bupload.css',
						dest: 'bupload.css'
					},
					{
						src: 'jupload/css/jupload.css',
						dest: 'jupload.css'
					}
				]
			}
		},

		// 打包压缩文件
		compress : {
			main : {
				options: {
					archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip',
				},
				files: [
					{src: ['bupload/css/icons/**'], dest: '<%= pkg.name %>/'},
					{src: ['bupload/css/images/**'], dest: '<%= pkg.name %>/'},
					{src: ['jupload/css/images/**'], dest: '<%= pkg.name %>/'},
					{src: ['libs/**'], dest: '<%= pkg.name %>/'},
					{src: ['php/**'], dest: '<%= pkg.name %>/'},
					{src: ['bupload.css'], dest: '<%= pkg.name %>/bupload/css/'},
					{src: ['jupload.css'], dest: '<%= pkg.name %>/jupload/css/'},
					{src: ['BUpload.js'], dest: '<%= pkg.name %>/bupload/'},
					{src: ['JUpload.js'], dest: '<%= pkg.name %>/jupload/'},
					{src: ['index.html'], dest: '<%= pkg.name %>/'},
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	// clean temp file
	grunt.registerTask('clean', function(){
		grunt.file.delete("bupload.css");
		grunt.file.delete("BUpload.js");
		grunt.file.delete("jupload.css");
		grunt.file.delete("JUpload.js");
	});

	grunt.registerTask('build', ['uglify', 'cssmin']);
	grunt.registerTask('zip', ['build', 'compress', 'clean']);

	grunt.registerTask('default', 'zip');

};
