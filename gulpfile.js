const gulp = require('gulp'); //подключаем Gulp
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gcmq = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
const pug = require('gulp-pug');
const del = require('del');

// Таск для сборки gulp файлов
gulp.task('pug', function(callback){
    return gulp.src('./src/pug/pages/**/*.pug')
        .pipe( plumber({
            errorHandler: notify.onError(function(err){
                return {
                    title: 'Pug',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.stream())
    callback();
});

// Таск для компиляции SCSS в CSS
gulp.task('scss', function(callback) {
	return gulp.src('./src/scss/main.scss')
        .pipe( plumber({
            errorHandler: notify.onError(function(err){
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
		.pipe(
            sass({
                indentType: "tab",
                indentWidth: 1,
                outputStyle: "expanded"
        }))
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 versions']
        }))
        .pipe(sourcemaps.write())
		.pipe( gulp.dest('./build/css/') )
        .pipe(browserSync.stream())
	callback();
});

// Копирование изображений 
gulp.task('copy:img', function(callback){
    return gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./build/img/'))
    callback();
});

// Копирование скриптов 
gulp.task('copy:js', function(callback){
    return gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./build/js/'))
    callback();
});

// Следим за изменениями и обновляем сервер
gulp.task('watch', function() {

    // Следим за картинками и скриптами, и обновляем браузер
    watch(['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload));

    // Слежение и компиляция SCSS с задержкой в 50мск
    // watch('./src/scss/**/*.scss', function(){
    //     setTimeout( gulp.parallel('scss'), 500 ) 
    // })
    watch('./src/scss/**/*.scss', gulp.parallel('scss'))


    // Слежение за PUG и сборки
    watch('./src/pug/**/*.pug', gulp.parallel('pug'))

    // Следим за картинками и скриптами, и копируем их в build
    watch('./src/img/**/*.*', gulp.parallel('copy:img'))
    watch('./src/js/**/*.*', gulp.parallel('copy:js'))

});

// Задача для старта сервера из папки app
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });
});

gulp.task('clean:build', function(){
    return del('./build')
});

// Дефолтный таск
// Запускаем сервер и слежение
gulp.task(
    'default', 
    gulp.series( 
        gulp.parallel('clean:build'),
        gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'), 
        gulp.parallel('server', 'watch') 
        )
    );

