$(".loading").show()
$(".wrapper").hide()
let restartinprogress = false
window.pageAuthLoadedHandler = async function () {
    // $(`#${elem}Carrier`).hover(function () {
    //     $(`#${elem}Carrier`).fadeOut(200, function() {
    //         $(`#${elem}Carrier`).css("background-color", "rgba(245, 0, 9, 0.57)")
    //     });
    //     $(`#${elem}Carrier`).fadeIn(400)
    // });

    twoSteps("restartMaster", restartMaster)
    twoSteps("updateMaster", updateMaster)

    let luptime = null
    await placeSysInfo()
    await versionControl()
    setInterval(async () => {
        if (!restartinprogress) {
            await placeSysInfo()
        }
    }, 5000);

}

function twoSteps(elem, act) {
    $(`#${elem}_Sure`).hide()
    $(`#${elem}_Loading`).hide()
    $(`#${elem}_Carrier`).hover(function () {
        if (!this.inProgress) {

            $(`#${elem}_Sure`).show(300)
            $(`#${elem}_Carrier`).fadeOut(300, function () {
                $(`#${elem}_Carrier`).css("background-color", "rgba(245, 0, 9, 0.57)")
            });
            $(`#${elem}_Carrier`).fadeIn(300, function () {
                $(`#${elem}_Sure`).hover(function () {
                    $(`#${elem}_Sure`).html("check")
                    $(`#${elem}_Sure`).click(function () {
                        $(`#${elem}_Carrier`).fadeOut(300, function () {
                            $(`#${elem}_Sure`).hide()
                            $(`#${elem}_Carrier`).css("background-color", "rgba(245, 245, 9, 0.57)")
                            $(`#${elem}_Loading`).show(300)
                            this.inProgress = true
                            act()
                            setTimeout(() => {
                                $(`#${elem}_Carrier`).css("background-color", "rgba(0, 245, 9, 0.57)")
                                $(`#${elem}_Loading`).hide(300)
                            }, 3000);
                            setTimeout(() => {
                                this.hideCarrier()
                            }, 5000);
                        });
                    });
                }, function () {
                    $(`#${elem}_Sure`).hide()
                });
            });
        }
    }, function () {
        this.hideCarrier = function () {
            $(`#${elem}_Sure`).hide(300)
            $(`#${elem}_Sure`).html("circle")
            $(`#${elem}_Carrier`).fadeOut(300, function () {
                $(`#${elem}_Carrier`).css("background-color", "transparent")
            })
            $(`#${elem}_Carrier`).fadeIn(300)
        }
        if (!this.inProgress) {
            this.hideCarrier()
        }
    });
}


async function placeSysInfo() {
    let asked = Date.now()
    get("mgmt/systeminfo", {
        headers: {
            accesskey: "foobar"
        }
    }).then(res => {
        let systeminfo = res.dynamic
        console.log(systeminfo);
        $("#mCpuBrand").html(`CPU Brand : ${systeminfo.cpu.brand}`)
        $("#mCpuSpeed").html(`CPU Speed : ${systeminfo.cpu.speed} Gigahertz`)
        $("#mMemCap").html(`Memory Capacity : ${(systeminfo.mem.total / 1000000000).toFixed(2)} GB`)
        luptime = (Date.now() - (parseInt(res.uptime) * 1000))
        $("#mUptime").html(`${moment(luptime).fromNow(true)}`)
        $("#mUptimeSince").html(`Running since ${moment(luptime).format("DD/MM/YYYY | hh:mm")}`)
        $("#mMemUsed").html(`Memory Used : ${(systeminfo.mem.used / 1000000000).toFixed(2)} GB`)
        $("#mLoadAvg").html(`Average Load : ${(systeminfo.load.avgLoad).toFixed(1)}%`)
        $("#mCLoad").html(`Current Load : ${(systeminfo.load.currentLoad).toFixed(3)}%`)
        $("#mNetRxBytes").html(`Recieved : ${(formatBytes(systeminfo.net[0].rx_bytes))}`)
        $("#mNetTxBytes").html(`Transmitted : ${(formatBytes(systeminfo.net[0].tx_bytes))}`)
        $("#mNetActiveLinks").html(`Active Links : ${systeminfo.all.networkConnections.length}`)
        $("#mNetTxDrops").html(`Tx Drops : ${systeminfo.all.networkStats[0].tx_dropped}`)
        $("#mProcCount").html(`Process Count : ${systeminfo.all.processes.all}`)
        $("#mProcSleeping").html(`Sleeping Processes : ${systeminfo.all.processes.sleeping}`)
        $("#masterPing").html(`${Date.now() - asked}ms`)
        $(".loading").fadeOut(100)
        $(".wrapper").fadeIn(100)

    })
}
async function versionControl() {
    post("mgmt/vcontrol", {
        headers: {
            accesskey: "foobar"
        }
    }).then(res => {
        if (res.upToDate) {
            $("#mUpToDate").html("Up to Date")
        } else {
            $("#mUpToDate").html("Running behind.")
        }
    }).catch(err => {
        toastr.error("Version control will not be available.", "Github rate limit is reached.")
        $("#mUpToDate").html("Unavailable.")
    })
}

async function restartMaster() {
    restartinprogress = true
    post("mgmt/restart", {
        headers: {
            accesskey: "foobar"
        }
    }).then(res => {
        console.log("success");
        toastr.success("Restart successful.")
        setTimeout(() => {
            restartinprogress = false
        }, 3000);
    }).catch(err => {
        toastr.error("Restart unsuccessful.")
        restartinprogress = false
    })
}

async function updateMaster() {
    alert("This function is a WIP.")
}


function formatBytes(bytes) {
    var marker = 1024; // Change to 1000 if required
    var decimal = 3; // Change as required
    var kiloBytes = marker; // One Kilobyte is 1024 bytes
    var megaBytes = marker * marker; // One MB is 1024 KB
    var gigaBytes = marker * marker * marker; // One GB is 1024 MB
    var teraBytes = marker * marker * marker * marker; // One TB is 1024 GB

    // return bytes if less than a KB
    if (bytes < kiloBytes) return bytes + " Bytes";
    // return KB if less than a MB
    else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB";
    // return MB if less than a GB
    else if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB";
    // return GB if less than a TB
    else return (bytes / gigaBytes).toFixed(decimal) + " GB";
}