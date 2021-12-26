window.pageAuthLoadedHandler = function () {
    console.log("hey");
    get("mgmt/getusers", {
        headers: {
            accesskey: "foobar"
        }
    }).then(res => {
        console.log(res);
        res.forEach(element => {
            console.log(element);
            let userstatespan = `
            <span class="badge badge-sm bg-gradient-success">Online</span>`
            let useradminspan = `
            <span class="badge badge-sm bg-gradient-success">User</span>`
            if (element.disabled) {
                userstatespan = `
                <span class="badge badge-sm bg-gradient-danger">Disabled</span>`
            } else {
                userstatespan = `
                <span class="badge badge-sm bg-gradient-success">Enabled</span>`
            }
            if (element.customClaims) {
                if (element.customClaims.admin) {
                    useradminspan = `<span class="badge badge-sm bg-gradient-warning">Admin</span>`
                }
            }
            $("#usersTableBody").append(
                `
                <tr>
                    <td>
                        <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                                <h6 class="mb-0 text-sm">${element.phoneNumber}</h6>
                                <p class="text-xs text-secondary mb-0">${element.uid}</p>
                            </div>
                        </div>
                    </td>
                    <td class="align-middle text-center">
                        ${userstatespan}
                    </td>
                    <td class="align-middle text-center">
                    ${useradminspan}
                    </td>
                    <td class="align-middle text-center">
                    ${element.metadata.creationTime}
                    </td>
                    <td class="align-middle text-center">
                    ${element.metadata.lastSignInTime}
                    </td>
                </tr>
                
                `
            )
        });
        $(".loading").hide(500)
        $(".wrapper").show(500)
    })
}

/* <tr>
                    <td>
                   ${element.uid}
                    </td>
                    <td>
                    ${userstatespan}
                    </td>
                    <td>
                    ${element.metadata.creationTime}
                    </td>
                    <td>
                    ${element.metadata.lastSignInTime}
                    </td>
                    <td>
                        ${element.phoneNumber}
                    </td>
                    <td class="text-center">
                        ${useradminspan}
                    </td>
                </tr> */