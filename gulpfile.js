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

/// ====================================================
/// Methods
/// ====================================================
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

// Create compilation pipeline
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

// Compile project w/ options
function compile( opts )
{
    // Create TS project
    var proj = ts.createProject(  SRC_ROOT + "/tsconfig.json", {
        noEmitOnError : true,
    });

    return () => { return preparePipeline( proj, opts ); }
}

// Generate version file
function genVersion( cb )
{
    const FS = require( "fs-extra"   );
    const DF = require( "dateformat" );

    // Load package.json
    try {
        var package = JSON.parse( FS.readFileSync( "package.json", "utf-8" ) );
    }
    catch( err ) { 
        console.error( "Failed to parse package.json" );
        return cb( err );
    }

    const isWin32 = /^win/.test( process.platform );

    // Get git commit hash
    const cmd = "git" + (isWin32 ? ".exe" : "") + " rev-parse HEAD";
    
    exec( cmd, ( error, stdout, stderr ) => {

        if( error )
        {
            console.error( stdout );
            console.error( stderr );
            return cb( error );
        }

        const hash      = stdout;
        const timestamp = DF( new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT", true ) + " UTC\n";

        // Write file
        try {
            FS.writeFileSync( "VERSION",
                `version: ${package.version}\n`     +
                `Built from git commit: ${hash}\n`  +
                `Built on: ${timestamp}`,
                { encoding: "utf-8" } );
        }
        catch( err ) {
            console.error( "Failed write VERSION file." );
            return cb( err );
        }

        cb();
    });
}

// Compile for debugging
function build()
{
   return compile({
       sourceMaps: true
   });
}

/// ====================================================
/// Task Functions
/// ====================================================

// Compile release version
function buildRelease()
{
    return compile({});
}

// Create .vsix package
function packageRelease( cb )
{
    console.log( "Packaging extension..." );

    // Write version file
    genVersion( (err) => {
            
        if( err )
        {
            console.error( "Failed generate version file." );
            return cb( err );
        }

        const isWin32 = /^win/.test( process.platform );

        // Generate vsix
        const args = [
            "package",
            "duk-debug.vsix"
        ];

        const cmd = "vsce" + (isWin32 ? ".cmd " : " ") +
            args.join( " " );

        exec( cmd, ( error, stdout, stderr ) => {

            console.log( stdout );

            if( error )
            {
                console.error( stderr );
                return cb( error );
            }
            
            cb();
        });
    });
}

/// ====================================================
/// Tasks
/// ====================================================
gulp.task( "build", build() );

gulp.task( "build-release", buildRelease() );

gulp.task( "clean",  () => {
	return del( [OUT_DIR+"/**"] );
});

gulp.task( "package", ["clean", "build"], packageRelease );

gulp.task( "watch", ["build"], () => {
    gulp.watch( "./src/**/*.ts", ["build"] );
});

gulp.task( "lint", () => {
   var tslint      = require( 'gulp-tslint' );
   return gulp.src( SRC_ROOT + "/*.ts" )
            .pipe( tslint() )
            .pipe( tslint.report("verbose") ); 
});