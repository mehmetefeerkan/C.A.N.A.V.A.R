$(".loading").show()
$(".wrapper").hide()
async function placeData() {
    if (!(localStorage.getItem("lazy") === "true")) {
        await get("machines/count").then(async (ret) => {
            $("#machineCount").html(ret)
        })
        await get("setup").then(async (ret) => {
            $("#scriptCount").html(Object.keys(ret).length)
        })
        await get("stats").then(async (ret) => {
            $("#activeAttackCount").html(ret.activeAttacks || "0")
            $("#totalAttacks").html(ret.totalAttacks || "0")
        })
        await get("machines/list").then(async (ret) => {
            console.log(ret);
            $("#machinesTableTitle").html(`${ret.length} Machines`)
            $(".machineLine").remove()
            ret.forEach(element => {
                $("#machinesTableBody").append(machineTableBase(element.id, element.machine.port.number, element.machine.busy, element.machine.systemInfo.dynamic.net[0].operstate))
            });
        })
        console.log("loaded");
        $(".loading").hide()
        $(".wrapper").show()
        lastDataFetch = Date.now()
    } else {
        $("#machineCount").html("16")
        $("#scriptCount").html("5")
        $("#activeAttackCount").html("2")
        $("#totalAttacks").html("22")
        $("#machinesTableBody").append(mteedata)
    }
    

}



async function getMethodName(id) {
    return get(`scripts?${id}`).then(async (ret) => {
        console.log(ret);
        return ret.name
    })
}

window.pageAuthLoadedHandler = function () {
    console.log("hey");
    placeData()
    let atts = JSON.parse(localStorage.getItem("attacks")).attacks
    if (atts[0]) {
        $(".lAttackLine").remove()
        atts.forEach(async (element) => {
            console.log(element);
            $("#latestAttacksCarrier").append(`
            <div class="timeline-block mb-3 lAttackLine">
                  <span class="timeline-step">
                    <i class="material-icons text-success text-gradient"></i>
                  </span>
                  <div class="timeline-content">
                    <h6 class="text-white text-sm font-weight-bold mb-0">${element.host} | ${element.attackLength} Seconds | ${await getMethodName(element.method)} </h6>
                    <p class="text-white font-weight-bold text-xs mt-1 mb-0">${moment(element.init).format("DD-MM-YY | hh:mm:ss")}</p>
                  </div>
                </div>
            `)
        });
    } else {
        $("#lattackCarrier").hide()
        $("#machinesMainCarrier").addClass("col-lg-12")
    }
    setInterval(() => {
        placeData()
    }, 5000);
}

function machineTableBase(a, b, c, d) {
    console.log(a, b, c, d);
    if (c === true || c === "true") {
        c = `                                                                            
        <span class="badge rounded-pill badge-soft-danger" key="t-new">Busy</span>`
    } else {
        c = `                                                                            
        <span class="badge rounded-pill badge-soft-success" key="t-new">Available</span>`
    }
    if (d === "down") {
        d = `                                                                            
        <span class="badge rounded-pill badge-soft-danger" key="t-new">Inactive</span>`
    } else {
        d = `                                                                            
        <span class="badge rounded-pill badge-soft-success" key="t-new">Active</span>`
    }
    return `

            <tr class="machineLine">
                <td class="text-center">
                    ${a}
                </td>
                <td class="text-center">
                    ${b}
                </td>
                <td class="text-center">
                    ${c}
                </td>
                <td class="text-center">
                    ${d}
                </td>
            </tr>

    `
}

async function triggerPortRefresh() {
    alert("This function is not active yet.")
}