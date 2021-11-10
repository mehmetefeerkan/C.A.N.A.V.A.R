const { exec } = require('child_process');

const express = require('express');
const app = express()
let masterIP = 

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
}