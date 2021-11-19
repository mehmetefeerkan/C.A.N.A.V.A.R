module.exports = {
    apps : [{
      name   : "canavarmaster",
      script : "./index.js",
      watch: ["server", "client"],
      ignore_watch : ["db.json"],
    }]
  }