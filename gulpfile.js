const gulp            = require( "gulp"            );
const ts              = require( "gulp-typescript" );
const sourcemaps      = require( "gulp-sourcemaps" );
const Path            = require( "path"            );
const del             = require( "del"             );
const runSequence     = require( "run-sequence"    );
const through         = require( "through2"        );
const uglifyJS        = require( "uglify-js"       );
const exec            = require( "child_process"   ).exec;

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

function preparePipeline( tsProj, opts )
{
    opts = opts || {
        minify: false,
        mangle: false
    };

    const SCR_DIR_ABS = Path.resolve( opts.srcRoot || tsProj.projectDirectory );
    const OUT_DIR_ABS = Path.resolve( OUT_DIR );

    let srcRoot       = Path.relative( OUT_DIR_ABS, SCR_DIR_ABS ).replace( /\\/g, "/" );

   
    // Compile Typescript
    var tsResult = tsProj.src()
        .pipe( sourcemaps.init() )
        .pipe( tsProj() );
    
    var js = tsResult.js;

    // Minify & mangle
    if( opts.minify )
        js = js.pipe( uglifyOutput( opts.mangle ) );

    // Write sourceMaps
    if( opts.sourceMaps )
    {
        js = js.pipe( sourcemaps.write( ".", {
            includeContent : false, 
            sourceRoot     : srcRoot
        } ))
    }

    // Write output
    js = js.pipe( gulp.dest( OUT_DIR ) );

    return js;
}

function compile( opts )
{
    // Create TS project
    var proj = ts.createProject(  SRC_ROOT + "/tsconfig.json", {
        noEmitOnError : true,
    });

    return () => { return preparePipeline( proj, opts ); }
}

// Compile for debugging
function build()
{
   return compile({
       sourceMaps: true
   });
}

// Compile release version
function buildRelease()
{
    return compile({});
}

// Create .vsix
function packageRelease( cb )
{
    console.log( "Packaging extension..." );

    const isWin32 = /^win/.test( process.platform );

    const args = [
        "package",
        "duk-debug.vsix"
    ];

    const cmd = "vsce" + (isWin32 ? ".cmd " : " ") +
        args.join( " " );
    console.log( `CMD: ${cmd}`);

    exec( cmd, ( error, stdout, stderr ) => {

        console.log( stdout );
        console.log( stderr );

        if( error )
            return cb( error );
        
        cb();
    });
}



/// Tasks
gulp.task( "build", build() );

gulp.task( "build-release", buildRelease() );

gulp.task( "clean",  () => {
	return del( [OUT_DIR+"/**"] );
});

gulp.task( "package", packageRelease );

gulp.task( "watch", ["build"], () => {
    gulp.watch( "./src/**/*.ts", ["build"] );
});

gulp.task( "lint", () => {
   var tslint      = require( 'gulp-tslint' );
   return gulp.src( SRC_ROOT + "/*.ts" )
            .pipe( tslint() )
            .pipe( tslint.report("verbose") ); 
});