gulp       = require "gulp"
babel      = require "gulp-babel"
concat     = require "gulp-concat"
rename     = require "gulp-rename"
plumber    = require "gulp-plumber"
notify     = require "gulp-notify"
uglify     = require "gulp-uglify"
babelify   = require "babelify"
browserify = require "browserify"
source     = require "vinyl-source-stream"
bs         = require "browser-sync"

src = "./src/index.js"

dist = "./demo/"

name =
  js: "evoker.js"
  min: "evoker.min.js"

gulp.task "build", ["babelify"], ->
  gulp.src "#{dist}#{name.js}"
    .pipe do uglify
    .pipe rename name.min
    .pipe gulp.dest distgu
  
gulp.task "babelify", ->
  browserify({
    # debug: true
    extensions: [".js"]
    standalone: "evoker"
  })
  .transform babelify.configure ({ blacklist: ["strict"], modules: "umd" })
  .require(src, entry: true)
  .bundle()
  .on "error", (err) ->
    console.log "Error: #{err.message}"
    @emit "end"
  .pipe source name.js
  .pipe gulp.dest dist
    
gulp.task "default", ->
  bs.init
    server:
      baseDir: [dist]
      directory: false
    notify: false
    host: "localhost"
  
  gulp.watch ["src/**/*.js"], ["babelify", bs.reload]
  gulp.watch ["#{dist}index.html", "#{dist}*.css"], bs.reload

gulp.task "watch", ["default"]
