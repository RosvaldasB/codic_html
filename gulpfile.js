//=================================================
// Gulpfile
//=================================================
'use strict';

import gulp from 'gulp';
import runSequence from 'gulp4-run-sequence';
import autoprefixer from 'gulp-autoprefixer';
import cssbeautify from 'gulp-cssbeautify';
import removeComments from 'gulp-strip-css-comments';
import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import nodeSass from 'node-sass';
import cssnano from 'gulp-cssnano';
import rigger from 'gulp-rigger';
import uglify from 'gulp-uglify';
import watch from 'gulp-watch';
import plumber from 'gulp-plumber';
import imagemin from 'gulp-imagemin';
import rimraf from 'rimraf';
import webserver from 'browser-sync';

const sass = gulpSass( nodeSass );

//=================================================
// Paths to source/dist/watch files
//=================================================
var path = {
    build: {
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        img: 'dist/assets/img/',
        fonts: 'dist/assets/fonts/',
        icons: 'dist/assets/icons/',
        json: 'dist/assets/'
    },
    src: {
        html: 'src/*.{htm,html,php}',
        js: 'src/assets/js/*.js',
        css: 'src/assets/sass/style.scss',
        img: 'src/assets/img/**/*.*',
        fonts: 'src/assets/fonts/**/*.*',
        icons: 'src/assets/icons/**/*.*',
        json: 'src/assets/*.json'
    },
    watch: {
        html: 'src/**/*.{htm,html,php}',
        js: 'src/assets/js/**/*.js',
        css: 'src/assets/sass/**/*.scss',
        img: 'src/assets/img/**/*.*',
        fonts: 'src/assets/fonts/**/*.*',
        icons: 'src/assets/icons/**/*.*',
        json: 'src/assets/*.json'
    },
    clean: './dist'
};

//=================================================
// Tasks
//=================================================
gulp.task( 'webserver', function( done ) {
    webserver.init( {
        server: {
            baseDir: './dist'
        },
        notify: false,
        open: true,
        ui: false
    } );

    done();
} );

gulp.task( 'html:build', function() {
    return gulp.src( path.src.html ).pipe( plumber() ).pipe( rigger() ).pipe( gulp.dest( path.build.html ) ).pipe( webserver.reload( { stream: true } ) );
} );

gulp.task( 'css:build', function() {
    return gulp.src( path.src.css ).pipe( plumber() ).pipe( sass().on( 'error', sass.logError ) ).pipe( autoprefixer( {
        cascade: true
    } ) ).pipe( cssbeautify() ).pipe( gulp.dest( path.build.css ) ).pipe( cssnano( {
        zindex: false,
        discardComments: {
            removeAll: true
        }
    } ) ).pipe( removeComments() ).pipe( rename( 'style.min.css' ) ).pipe( gulp.dest( path.build.css ) ).pipe( webserver.reload( { stream: true } ) );
} );

gulp.task( 'js:build', function() {
    return gulp.src( path.src.js ).pipe( plumber() ).pipe( rigger() ).pipe( gulp.dest( path.build.js ) ).pipe( uglify() ).pipe( rename( 'main.min.js' ) ).pipe( gulp.dest( path.build.js ) ).pipe( webserver.reload( { stream: true } ) );
} );

gulp.task( 'fonts:build', function() {
    return gulp.src( path.src.fonts ).pipe( gulp.dest( path.build.fonts ) );
} );

gulp.task( 'icons:build', function() {
    return gulp.src( path.src.icons ).pipe( gulp.dest( path.build.icons ) );
} );

gulp.task( 'image:build', function() {
    return gulp.src( path.src.img ).pipe( imagemin( {
        optimizationLevel: 3,
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true
    } ) ).pipe( gulp.dest( path.build.img ) );
} );

gulp.task( 'json:build', function() {
    return gulp.src( path.src.json ).pipe( gulp.dest( path.build.json ) );
} );

gulp.task( 'clean', function( resolve ) {
    rimraf.sync( path.clean );

    resolve();
} );

gulp.task( 'build', function( cb ) {
    runSequence(
        'clean',
        'html:build',
        'css:build',
        'js:build',
        'fonts:build',
        'icons:build',
        'image:build',
        'json:build'
        , cb );
} );

gulp.task( 'watch', function( done ) {
    watch( [path.watch.html], function() {
        runSequence( 'html:build' );
    } );

    watch( [path.watch.css], function() {
        runSequence( 'css:build' );
    } );

    watch( [path.watch.js], function() {
        runSequence( 'js:build' );
    } );

    watch( [path.watch.img], function() {
        runSequence( 'image:build' );
    } );

    watch( [path.watch.fonts], function() {
        runSequence( 'fonts:build' );
    } );

    watch( [path.watch.icons], function() {
        runSequence( 'icons:build' );
    } );

    watch( [path.watch.json], function() {
        runSequence( 'json:build' );
    } );

    done();
} );

gulp.task( 'default', function( done ) {
    runSequence(
        'clean',
        'build',
        'webserver',
        'watch' );
    done();
} );
