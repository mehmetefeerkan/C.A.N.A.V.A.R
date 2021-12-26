
const firebaseConfig = {
    apiKey: "AIzaSyCOCFjgNGzL-Zs9gtwK6W3njfX8MUTfp1Q",
    authDomain: "canavar-access.firebaseapp.com",
    projectId: "canavar-access",
    storageBucket: "canavar-access.appspot.com",
    messagingSenderId: "172096021552",
    appId: "1:172096021552:web:3c3b4933c903c62fbeb9f5",
    measurementId: "${config.measurementId}"
};
firebase.initializeApp(firebaseConfig)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.uToken = user.Aa
        window.user = user
        window.pageAuthLoadedHandler()
        console.log(uToken);
    } else {
        toastr.error("Unknown Authorization Error!")
        setTimeout(() => {
            window.location = "sign-in.html"
        }, 1000);
    }
});


async function get(addr, params, body) {
    if (tabCount.tabsCount() < 2) {
        $(".wrapper").show()
        params = params || {
            headers: {}
        }
        body = body || {}
        params.headers["authorization"] = uToken
        return axios.get("https://canavarapi.licentia.xyz/" + addr, {
            headers: params.headers
        }).then(res => {
            return res.data
        }).catch(function (error) {
            console.log("hata");
            if (error.response.data && error.response.data.error && error.response.data.error.innerResponse) {
                toastr.error(error.response.data.error.innerResponse, "Authorization Error")
                if (error.response.data.error.message === "INVALID_TOKEN") {
                    console.log("invtoken");
                    setTimeout(() => {
                        window.location = "sign-in.html"
                    }, 1000);
                }
            } else if (error.response.status === 403 || error.response.status === "403" || error.response.status === 401 || error.response.status === "401") {
                toastr.error("Unknown Authorization Error")
                setTimeout(() => {
                    window.location = "sign-in.html"
                }, 1000);
            }
        })
    } else {
        $(".wrapper").hide()
        alert("Opening more than one tab is not allowed. Please close other open tabs to continue.")
        location.reload()
    }
}

async function post(addr, params, body) {
    if (tabCount.tabsCount() < 2) {
        $(".wrapper").show()
        params = params || {
            headers: {}
        }
        body = body || {}
        params.headers["authorization"] = uToken
        return axios.post("https://canavarapi.licentia.xyz/" + addr, params.body, {
            headers: params.headers

        })
            .then(res => {
                return res.data
            }).catch(function (error) {
                console.log("hata");
                if (error.response.data && error.response.data.error && error.response.data.error.innerResponse && error.response.status !== 500) {
                    toastr.error(error.response.data.error.innerResponse, "Authorization Error")
                    if (error.response.data.error.message === "INVALID_TOKEN") {
                        console.log("invtoken");
                        setTimeout(() => {
                            window.location = "signin.html"
                        }, 1000);
                    }
                } else if (error.response.status === 403 || error.response.status === "403" || error.response.status === 401 || error.response.status === "401") {
                    toastr.error("Unknown Authorization Error")
                    setTimeout(() => {
                        window.location = "signin.html"
                    }, 1000);
                } else {
                    toastr.error("Unknown Data Fetch Error")
                }
            })
    } else {
        $(".wrapper").hide()
        alert("Opening more than one tab is not allowed. Please close other open tabs to continue.")
        location.reload()
    }
}

function logOut() {
    firebase.auth().languageCode = 'tr';
    firebase.auth().signOut().then(() => {
        toastr.success("Signout success. Redirecting...")
        setTimeout(() => {
            window.location = "signin.html"
        }, 1500);
    }).catch((error) => {
        // An error happened.
        toastr.success(error, "Signout failed.")
    });
}