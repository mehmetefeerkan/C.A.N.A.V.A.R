const { exec } = require('child_process');

const express = require('express');
const app = express()

const fs = require('fs')
const axios = require('axios');
const EventEmitter = require('events')

let master = null
const masterIsHere = new EventEmitter()

function checkLocalMaster() {
    fs.readFile('master.txt', 'utf8', (err, data) => {
        if (err) {
            if ((err.errno === -4058) && (err.code === "ENOENT")) {
                axios.get("http://disaster.api.canavar.licentia.xyz")
                    .then(res => {
                        let mdata = res.data
                        fs.writeFile('master.txt', master, err => {
                            if (err) {
                                console.error(err)
                                return
                            }
                        })
                        masterIsHere.emit(true)

                    })
                    .catch(err => {
                        console.error(err);
                    })
    
    
            }
            console.error(err)
            return
        }
        console.log("found master locally.", master);
        masterIsHere.emit(true)
    })
}

checkLocalMaster()

masterIsHere.on(true, () => {
    console.log("checking master comms...");
    axios.get("http://" + master)
        .then(res => {
            console.log(res)
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