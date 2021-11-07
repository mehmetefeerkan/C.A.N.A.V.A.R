const express = require('express')
const app = express()
const config = require("./config.json")
console.log(config)

app.get('/layer7/setup.sh', (req, res) => {
    res.send(200, `
    
    `)
})