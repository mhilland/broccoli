var fs = require('fs')
var program = require('commander')
var copyDereferenceSync = require('copy-dereference').sync

var broccoli = require('./index')
var config = require('config')

module.exports = broccoliCLI
function broccoliCLI () {
  var actionPerformed = false
  program
    .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version)
    .usage('[options] <command> [<args ...>]')

  program.command('serve')
    .description('start a broccoli server')
    .option('--port <port>', 'the port to bind to [4200]', 4200)
    .option('--host <host>', 'the host to bind to [localhost]', 'localhost')
    .option('--live-reload-port <port>', 'the port to start LiveReload on [35729]', 35729)
    .action(function(options) {
      actionPerformed = true
      broccoli.server.serve(getBuilder(), options)
    })

  program.command('build <target> <locale>')
    .description('output files to target directory')
    .action(function(outputDir, locale) {
      actionPerformed = true
      config.broccoli.build = true
      config.current_locale = locale

      var fetch = require('./fetch')

      fetch.getData
        .then(function(data) {
          var builder = getBuilder()
          builder.build()
            .then(function (hash) {
              var dir = hash.directory
              outputDir = outputDir + '/' + locale
              try {
                copyDereferenceSync(dir, outputDir)
              } catch (err) {
                if (err.code === 'EEXIST') err.message += ' (we cannot build into an existing directory)'
                throw err
              }
            })
            .finally(function () {
              builder.cleanup()
            })
            .then(function () {
              process.exit(0)
            })
            .catch(function (err) {
              // Should show file and line/col if present
              if (err.file) {
                console.error('File: ' + err.file)
              }
              console.error(err.stack)
              console.error('\nBuild failed')
              process.exit(1)
            })
        })
    })

  program.parse(process.argv)
  if(!actionPerformed) {
    program.outputHelp()
    process.exit(1)
  }
}

function getBuilder () {
  var tree = broccoli.loadBrocfile()
  return new broccoli.Builder(tree)
}