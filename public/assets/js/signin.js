// $("#sign-in-button").prop( "disabled", true );
// $("#send-code-button").prop( "disabled", true );
$(".loading").show()
$(".wrapper").hide()
const firebaseConfig = {
    apiKey: "AIzaSyCOCFjgNGzL-Zs9gtwK6W3njfX8MUTfp1Q",
    authDomain: "canavar-access.firebaseapp.com",
    projectId: "canavar-access",
    storageBucket: "canavar-access.appspot.com",
    messagingSenderId: "172096021552",
    appId: "1:172096021552:web:3c3b4933c903c62fbeb9f5",
    measurementId: "${config.measurementId}"
};
const app = firebase.initializeApp(firebaseConfig)
firebase.auth().languageCode = 'tr';

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.uToken = user.Aa
        toastr.warning("You are already logged in. Redirecting.")
        setTimeout(() => {
            window.location = "dashboard.html"
        }, 1000);
    } else {
        $(".loading").hide()
$(".wrapper").show()
        function cr() {
            let email = "mehmetefe.taner1@gmail.com"
            let password = "mehmetefeselam"
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in 
                    var user = userCredential.user;
                    console.log(user);
                    // ...
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(error);
                    // ..
                });

        }
        let captchaok = false

        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('send-code-button', {
            'size': 'invisible',
            'callback': (response) => {
                captchaok = true
            }
        });
        $("#2faentry").hide()
        $("#sign-in-button").hide()


        $("#send-code-button").click(function () {
            let pnVal = $("#pNumber").val()
            if (pnVal) {
                if (pnVal.length === 10 && pnVal.startsWith("5")) {
                    $("#send-code-button").addClass("disabled");
                    $("#send-code-button").html("Sending code...")
                    const phoneNumber = "+90" + pnVal
                    const appVerifier = window.recaptchaVerifier;
                    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
                        .then((confirmationResult) => {
                            window.confirmationResult = confirmationResult;
                            if (captchaok) {
                                $("#send-code-button").hide(500)
                                $("#sign-in-button").show(500)
                                $("#2faentry").show()
                                $("#pNumber").prop("disabled", true);
                                toastr.success("Code sent.")
                            }
                            // ...
                        }).catch((error) => {
                            console.log(error);
                            alert("Sign in failed. Code cant be sent.")
                        });
                } else {
                    alert("Invalid or short number.")
                    location.reload()
                }
            } else {
                alert("No number was provided.")
                location.reload()
            }
        });

        $("#sign-in-button").click(function () {
            let tfaval = $("#2fanum").val()
            if (tfaval) {
                if (tfaval.length === 6) {
                    tfSend(tfaval)
                } else {
                    alert("Invalid or short code.")
                    location.reload()
                }
            } else {
                alert("No code was provided.")
                location.reload()
            }
        });

        function tfSend(code) {

            confirmationResult.confirm(code).then((result) => {
                // User signed in successfully.
                const user = result.user;
                console.log(user);
                var credential = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, code);
                firebase.auth().signInWithCredential(credential);
                console.log(credential);
                firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
                    // Send token to your backend via HTTPS
                    // ...
                    localStorage.setItem("token", idToken)
                    toastr.success("Login successful. Redirecting...")
                    setTimeout(() => {
                        window.location = "dashboard.html"
                    }, 1500);
                }).catch(function (error) {
                    localStorage.removeItem("token")
                    setTimeout(() => {
                        toastr.error("Authorization error. Redirecting to sign-in page.")
                    }, 1500);
                });
                // ...
            }).catch((error) => {
                localStorage.removeItem("token")
                toastr.error("SMS Code incorrect.")
            });
        }
    }
});

