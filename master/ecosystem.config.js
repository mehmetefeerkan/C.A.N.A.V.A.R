module.exports = {
    apps : [{
      name   : "canavarmaster",
      script : "./index.js",
      watch: ["server", "client", "index.js"],
      ignore_watch : ["db.json"],
    }]
  }