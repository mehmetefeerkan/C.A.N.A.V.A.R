const express = require('express')
const app = express()
const port = 3000
const axios = require('axios')
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(function (req, res, next) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    console.log(ip);
    next()
})

app.get('/*', (req, res) => {
    console.log(req.originalUrl);
    var options = {
        method: 'GET',
        url: "http://localhost:5001/canavar/us-central1" + req.originalUrl,
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress },
        data: req.body
    };

    axios.request(options).then(function (response) {
        res.send(200, response.data)
    }).catch(function (error) {
        res.send(error.response.status, error.response.data || "")
    });
})

app.post('/*', (req, res) => {
    console.log(req.originalUrl);
    var options = {
        method: 'POST',
        url: "http://localhost:5001/canavar/us-central1" + req.originalUrl,
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress },
        data: req.body
    };

    axios.request(options).then(function (response) {
        res.send(200, response.data)
    }).catch(function (error) {
        res.send(error.response.status, error.response.data || "")
    });
})

app.patch('/*', (req, res) => {
    console.log(req.originalUrl);
    var options = {
        method: 'PATCH',
        url: "http://localhost:5001/canavar/us-central1" + req.originalUrl,
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress },
        data: req.body
    };

    axios.request(options).then(function (response) {
        res.send(200, response.data)
    }).catch(function (error) {
        res.send(error.response.status, error.response.data || "")
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})