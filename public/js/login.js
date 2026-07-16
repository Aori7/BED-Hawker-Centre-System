 // implemented by Ada
// login.html js

// for login states - 3 different types of login states
// choose-role state, customer-login state, and other-login state
//adding the function to toggle between the states
function toggleLoginState(loginstate){
    // remove all the "active" from all the login states first
    document.querySelectorAll(".login-state").forEach(state => {
        state.classList.remove("active");
    })
    //then add "active" to the login state depending on user request
    document.getElementById(loginstate).classList.add("active");
}

//handling all the "back" button - allows the users to return to the role selection screen
document.querySelectorAll(".back-btn").forEach(btn => {
    //if button clicked, adds "active" to toggle state for choose-role state
    btn.addEventListener("click", () => {
        toggleLoginState("choose-role");
    });
});

//get the user input for the role login
//if user selects customer, state active changed to customer login state
// if user selects nea,operator,vendor, state active changed to other-login state
const proceedbtn = document.querySelector(".proceed-btn");
const roleselect = document.getElementById("role-select");
const regbtn = document.querySelector(".sign-up");

//if user click "sign up", show the registeration form
if (regbtn) {
    regbtn.addEventListener("click", () => {
        toggleLoginState("register-acc");
    });
}
// when the user clicks proceed after choosing their role in login..
proceedbtn.addEventListener("click", () => {
    const role = roleselect.value;
    //storing the selected role in session storage
    sessionStorage.setItem("selectedRole", role);
    //prevent proceeding if there is no role selected
    if (!role) return;

    // 1. if role selected is customer, state adds "active" for customer login state.
    if (role === "Customer"){
        toggleLoginState("customer-login");
    }
    //2. if other role than customer is selected, state changes to active for other-login state
    else{
        toggleLoginState("other-login");
    }
});



const otherLoginForm =
    document.getElementById("other-login-form");

otherLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document
        .getElementById("other-login-email")
        .value
        .trim();

    const password = document
        .getElementById("other-login-password")
        .value;

    const role = sessionStorage.getItem("selectedRole");

    if (!email || !password || !role) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                role
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Login failed");
            return;
        }

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userID", data.user.userID);
        sessionStorage.setItem("userEmail", data.user.email);
        sessionStorage.setItem("userRole", data.user.role);

        console.log("Login successful:", data.user);

        if (data.user.role === "Stall Owner") {
            window.location.href = "vendor-home.html";
        } else if (data.user.role === "NEA Officer") {
            window.location.href = "nea-main.html";
        } else if (data.user.role === "Operator") {
            window.location.href = "main-operator.html";
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Unable to connect to the server");
    }
});
//in other-login state method
//there are 2 states to choose from
//either login via singpass manual password OR singpass qr app
const singpassbtn = document.querySelectorAll(".singpass-login");
const loginmethod = document.querySelectorAll(".login-method");
// loop, toggle between singpass login methods - manual id input or qr code
singpassbtn.forEach(btn => {
    btn.addEventListener("click", () => {
        const method = btn.dataset.method;
        // modify the active state accordingly - update ui
        singpassbtn.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        //states for the login method
        //singpass manual password login or
        // singpass qr app login
        loginmethod.forEach(m => m.classList.remove("active"));
        
        //handle the toggle states
        if(method=== "password"){
            document.getElementById("login-password").classList.add("active");
            //add "active" to the class to toggle active state
        }
        else{
            document.getElementById("login-qr").classList.add("active");
        }
    });
});
        





// customer registration form
const registerForm = document.getElementById("register-form"); // in login.html, get the form's id

//detects when a user click submmit
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    //retrieve user input values
    const email = document
        .getElementById("register-email")
        .value
        .trim();

    const name = document
        .getElementById("register-name")
        .value
        .trim();

    const password = document
        .getElementById("register-password")
        .value;

    if (!email || !name || !password) {
        alert("Please fill in all fields");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
    }

    try {
        const response = await fetch("/customers/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                name: name,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        alert("Account created successfully. Please log in.");

        registerForm.reset();
        toggleLoginState("customer-login");

    } catch (error) {
        console.error("Registration error:", error);
        alert("Unable to connect to the server");
    }
});



// customer login form
const customerLoginForm =
    document.getElementById("customer-login-form");

customerLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document
        .getElementById("customer-login-email")
        .value
        .trim();

    const password = document
        .getElementById("customer-login-password")
        .value;

    if (!email || !password) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const response = await fetch("/customers/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Login failed");
            return;
        }

        // save login details only after backend confirms login
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", data.user.role);
        sessionStorage.setItem("userID", data.user.userID);
        sessionStorage.setItem("customerID", data.user.customerID);
        sessionStorage.setItem(
            "customerName",
            data.user.customerName
        );
        sessionStorage.setItem("userEmail", data.user.email);

        //debug
        console.log("User data:", data.user);

        alert("Login successful");

        // temporarily comment this out if you want to inspect console
        // window.location.href = "../index.html";

    } catch (error) {
        console.error("Login error:", error);
        alert("Unable to connect to the server");
    }
});


// //customer login email and password - temporary login without firebase
// const customerLoginBtn = document.getElementById("customer-login-btn");

// if (customerLoginBtn) {
//     customerLoginBtn.addEventListener("click", (e) => {
//         e.preventDefault();

//         const email = document.querySelector("#customer-login input[type='email']").value;
//         const password = document.querySelector("#customer-login input[type='password']").value;

//         if (!email || !password) {
//             alert("Please fill in all fields");
//             return;
//         }

//         // temporary mock login success
//         sessionStorage.setItem("isLoggedIn", "true");
//         sessionStorage.setItem("userRole", "customer");
//         sessionStorage.setItem("userEmail", email);

//         window.location.href = "../index.html";
//     });
// }

// //registering customers - temporary register without firebase
// const submit = document.querySelector(".reg-btn");

// if (submit) {
//     submit.addEventListener("click", function(event) {
//         event.preventDefault();

//         const email = document.getElementById("email").value;
//         const password = document.getElementById("password").value;
//         const confirmPassword = document.getElementById("confirm-password").value;

//         if (!email || !password || !confirmPassword) {
//             alert("Please fill in all fields");
//             return;
//         }

//         if (password !== confirmPassword) {
//             alert("Passwords do not match");
//             return;
//         }

//         // temporary mock register
//         alert("Account created successfully. Please log in.");

//         sessionStorage.setItem("registeredEmail", email);
//         toggleLoginState("customer-login");
//     });
// }

