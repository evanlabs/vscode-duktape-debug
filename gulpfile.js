
var gulp            = require( "gulp"            );
var path            = require( "path"            );
var del             = require( "del"             );
var ts              = require( "gulp-typescript" );
var sourcemaps      = require( "gulp-sourcemaps" );
var runSequence     = require( "run-sequence"    );
var through         = require( "through2"        );
var uglifyJS        = require( "uglify-js"       );

// Config
var SRC_ROOT      = "./src";
var OUT_DIR       = "./out";
var EXT_OUT_DIR   = "./builds";


/// Methods
function uglifyOutput( mangle )
{
    return through.obj( function(file, encoding, cb) {

        if( file.isNull() ) 
            return cb( null, file )
        
        var opts = {
            fromString       : true,
            mangle           : mangle,
            sourceRoot       : "../src",
            inSourceMap      : file.sourceMap,
            outSourceMap     : file.basename + ".map"
        };

        if( file.isStream() ) {
            throw new Error( "Build Pipeline: Cannot handle streams." );
        }

        let fstr   = file.contents.toString();
        let inFile = {}
        inFile[file.basename] = file.contents.toString();

        var result = uglifyJS.minify( inFile, opts );
        file.contents  = new Buffer( result.code );
        file.sourceMap = JSON.parse( result.map );
        
        cb( null, file );
    });
}

function preparePipeline( opts )
{
    opts = opts || {
        minify: false,
        mangle: false
    };

    var tsProj = opts.tsProj;

    // Compile Typescript
    var tsResult = tsProj.src()
        .pipe( sourcemaps.init() )
        .pipe( tsProj() );
    
    var js  = tsResult.js;

    // Minify & mangle
    if( opts.minify )
        js.pipe( uglifyOutput() );

    // Write sourceMaps and output
    js.pipe( sourcemaps.write( ".", {
        includeContent : false, 
        sourceRoot     : opts.srcRoot
    } ))
    .pipe( gulp.dest( OUT_DIR ) );

    return js;
}

function compileV1_5_0()
{
    // Create TS project
    var proj = ts.createProject(  SRC_ROOT + "/tsconfig.json", {
        noEmitOnError : true,
    });

    opts = {
        tsProj   : proj,
        srcRoot  : "../src"
    };

    return () => { return preparePipeline( opts ); }
}

function packageRelease()
{
    console.log( "Packaging extension..." );

    var copyDirs = [
        "./out"
    ];
}

function buildRelease()
{
    return function() { 
        var pipeline = preparePipeline(); //{ minify:true, mangle:true });
        pipeline.on( "end", packageRelease );
        return pipeline; 
    };
}



/// Tasks
gulp.task( "build", compileV1_5_0() );

gulp.task( "build-release", buildRelease() );

gulp.task( "clean", function() {
	return del( [OUT_DIR+"/**"] );
});

gulp.task( "watch", ["build"], function() {
    gulp.watch( "./src/**/*.ts", ["build"] );
});

gulp.task( "lint", function() {
   var tslint      = require( 'gulp-tslint' );
   return gulp.src( SRC_ROOT + "/*.ts" )
            .pipe( tslint() )
            .pipe( tslint.report("verbose") ); 
});