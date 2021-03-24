var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
	files: {
            baseDir: "./"
        },
        https: {
            key: "cert/server.key",
            cert: "cert/server.crt"
        }
    });
gulp.watch("js/buzz.js").on('change', browserSync.reload);

});
