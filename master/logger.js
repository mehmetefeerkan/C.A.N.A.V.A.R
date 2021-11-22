const activeLogging = true
function consoleLog(d) { if (activeLogging) { console.log(d) } }
const {Signale} = require('signale');
let timestampType = "UTC"
const moment = require('moment')
let idcache = null
function timestamp() {
    let time = Date.now()
    switch (timestampType) {
        case "UTC":
            time = moment().format()
            break;
        case "UNIX":
            time = time
            break;
    }
    return time
}
const options = {
    disabled: false,
    interactive: false,
    logLevel: 'info',
    scope: timestamp(),
    secrets: [],
    stream: process.stdout,
    types: {
      info: {
        badge: '📣',
        color: 'blue',
        label: 'Info: ',
        logLevel: 'info'
      },
      error: {
        badge: '🎅',
        color: 'red',
        label: 'Error: ',
        logLevel: 'error'
      }
    }
  };
   
const slog = new Signale(options);

const fs = require('fs');
let log = {
    error: function (trace_, type_, data_, write_) {
        let trace = trace_
        let type = type_
        let data = data_
        let write = write_
        let logged = true
        if ((write !== undefined) || (write !== null) || (write !== true)) {
            logged = false
        }
        //consoleLog(`Error - ${type} | ${data}`)
        slog.error(`${type} | ${data}`)
        
        if (trace !== idcache) {
            fs.appendFile('logger.log', `-\n`, function (err) {
                if (err) throw err;
            });
        }
        fs.appendFile('logger.log', `${timestamp()} [${trace}] ERROR : ${type} | ${data}\n`, function (err) {
            if (err) throw err;
        });
        idcache = trace
    },
    info: function (trace_, type_, data_, write_) {
        let trace = trace_
        let type = type_
        let data = data_
        let write = write_
        let logged = true
        if ((write !== undefined) || (write !== null) || (write !== true)) {
            logged = false
        }
        consoleLog(`Info - ${type} | ${data}`)
        slog.info(`${type} | ${data}`)
        if (trace !== idcache) {
            fs.appendFile('logger.log', `-\n`, function (err) {
                if (err) throw err;
            });
        }
        fs.appendFile('logger.log', `${timestamp()} [${trace}] INFO : ${type} | ${data}\n`, function (err) {
            if (err) throw err;
        });
        idcache = trace
    },
    init: function (trace_, data_, write_) {
        let trace = trace_
        let data = data_
        let write = write_
        let logged = true
        if ((write !== undefined) || (write !== null) || (write !== true)) {
            logged = false
        }
        consoleLog(`Init | ${data}`)
        //slog.info(` | ${data}`)
        if (trace !== idcache) {
            fs.appendFile('logger.log', `-\n`, function (err) {
                if (err) throw err;
            });
        }
        fs.appendFile('logger.log', `${timestamp()} [${trace}] INIT : ${data}\n`, function (err) {
            if (err) throw err;
        });
        idcache = trace
    }
}



module.exports = {
    log: log
};