const { exec } = require('child_process');

const express = require('express');
const app = express()

const fs = require('fs')
const axios = require('axios');
const EventEmitter = require('events')

let master = null
const masterIsHere = new EventEmitter()
process.chdir(__dirname)
let mtxtl = `${__dirname}\\master.txt`
console.log(mtxtl);
function checkLocalMaster() {
    var localMaster;
    try {
        localMaster = fs.readFileSync(mtxtl, { encoding: 'utf8', flag: 'r' })
    } catch (err) {
        if ((err.errno === -4058) && (err.code === "ENOENT")) {
            axios.get("http://disaster.api.canavar.licentia.xyz")
                .then(res => {
                    let mdata = res.data
                    master = mdata
                    fs.writeFileSync("./master.txt", mdata);
                    masterIsHere.emit(true)
                })
                .catch(err => {
                    console.error(err);
                })
        }
        console.error(err)
        return
    }
    console.log("master = " + master);
    if (master === null || master === "") {
        fs.unlinkSync("master.txt");
        checkLocalMaster()
        console.log("empty master file. fallback again.");
    }
}

checkLocalMaster()

masterIsHere.on(true, () => {
    console.log("checking master comms...");
    axios.get("http://" + master)
        .then(res => {
            //console.log(res)
        })
        .catch(err => {
            console.error(err);
        })
})

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