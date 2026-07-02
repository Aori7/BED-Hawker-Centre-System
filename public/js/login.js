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
regbtn.addEventListener("click", () => {
    toggleLoginState("register-acc")
})
// when the user clicks proceed after choosing their role in login..
proceedbtn.addEventListener("click", () => {
    const role = roleselect.value;
    //storing the selected role in session storage
    sessionStorage.setItem("selectedRole", role);
    //prevent proceeding if there is no role selected
    if (!role) return;

    // 1. if role selected is customer, state adds "active" for customer login state.
    if (role === "customer"){
        toggleLoginState("customer-login");
    }
    //2. if other role than customer is selected, state changes to active for other-login state
    else{
        toggleLoginState("other-login");
    }
});

//mock login for non-customer login? for nea,operator and vendors
document.querySelectorAll(".login-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const role = sessionStorage.getItem("selectedRole");
    //check
    if (!role) {
      alert("No role selected");
      return;
    }

    // mock login success
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", role);

    // redirect by role to specific page - aka redirecting to calista's,dayana's and ruimin's pages.
    if (role === "vendor") {
      window.location.href = "vendor-home.html";
    } else if (role === "nea-officer") {
      window.location.href = "nea-main.html";
    } else if (role === "operator") {
      window.location.href = "operator-main.html";
    }
  });
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
        




//customer login email and password - temporary login without firebase
const customerLoginBtn = document.getElementById("customer-login-btn");

if (customerLoginBtn) {
    customerLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const email = document.querySelector("#customer-login input[type='email']").value;
        const password = document.querySelector("#customer-login input[type='password']").value;

        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        // temporary mock login success
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", "customer");
        sessionStorage.setItem("userEmail", email);

        window.location.href = "../index.html";
    });
}

//registering customers - temporary register without firebase
const submit = document.querySelector(".reg-btn");

if (submit) {
    submit.addEventListener("click", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (!email || !password || !confirmPassword) {
            alert("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // temporary mock register
        alert("Account created successfully. Please log in.");

        sessionStorage.setItem("registeredEmail", email);
        toggleLoginState("customer-login");
    });
}

