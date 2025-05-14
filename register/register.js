let api = "https://68219a2d259dad2655afc2ba.mockapi.io";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".register-form");
  const register = document.querySelector(".register-btn");
  const inputFields = document.querySelectorAll('input');
  inputFields.forEach(input => {
    input.addEventListener('input', function() {
      const marioImage = document.getElementById("mario-register");
      marioImage.src = "../images/mario.gif";
      marioImage.style.width = ""; 
    });
  });

  register.addEventListener("click", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const confirmPass = document.getElementById("conPass").value;

    const fullNameSpan = document.getElementById("fullName-span");
    const usernameSpan = document.getElementById("username-span");
    const emailSpan = document.getElementById("email-span");
    const passSpan = document.getElementById("pass-span");
    const conPassSpan = document.getElementById("conPass-span");

    fullNameSpan.textContent =
      "Please enter your first and last name";
    usernameSpan.textContent = "Your unique username for logging in.";
    emailSpan.textContent = "We'll never share your email with anyone else.";
    passSpan.textContent = "Use at least 8 characters, including a number.";
    conPassSpan.textContent = "Make sure both passwords match.";

    fullNameSpan.style.color = "";
    usernameSpan.style.color = "";
    emailSpan.style.color = "";
    passSpan.style.color = "";
    conPassSpan.style.color = "";

    let isValid = true;

    if (!fullName) {
      fullNameSpan.textContent = "Full name is required";
      fullNameSpan.style.color = "red";
      isValid = false;
    } else if (!/^[a-zA-Z ]{2,30}$/.test(fullName)) {
      fullNameSpan.textContent =
        "Please enter a valid name (letters and spaces only)";
      fullNameSpan.style.color = "red";
      isValid = false;
    }

    if (!username) {
      usernameSpan.textContent = "Username is required";
      usernameSpan.style.color = "red";
      isValid = false;
    } else if (username.length < 3) {
      usernameSpan.textContent = "Username must be at least 3 characters";
      usernameSpan.style.color = "red";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameSpan.textContent =
        "Username can only contain letters, numbers, and underscores";
      usernameSpan.style.color = "red";
      isValid = false;
    }

    if (!email) {
      emailSpan.textContent = "Email is required";
      emailSpan.style.color = "red";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailSpan.textContent = "Please enter a valid email address";
      emailSpan.style.color = "red";
      isValid = false;
    }

    if (!password) {
      passSpan.textContent = "Password is required";
      passSpan.style.color = "red";
      isValid = false;
    } else if (password.length < 8) {
      passSpan.textContent = "Password must be at least 8 characters";
      passSpan.style.color = "red";
      isValid = false;
    } else if (!/\d/.test(password)) {
      passSpan.textContent = "Password must contain at least one number";
      passSpan.style.color = "red";
      isValid = false;
    }

    if (!confirmPass) {
      conPassSpan.textContent = "Please confirm your password";
      conPassSpan.style.color = "red";
      isValid = false;
    } else if (password !== confirmPass) {
      conPassSpan.textContent = "Passwords do not match";
      conPassSpan.style.color = "red";
      isValid = false;
    }

    if (!isValid) {
      let marioImage = document.getElementById("mario-register");
      marioImage.src = "../images/game-over.png";
      marioImage.style.width = "50%";
      return; 
    }

    checkUserExists(username, email)
      .then(exists => {
        if (exists) {
          if (exists.username) {
            usernameSpan.textContent = "Username already taken";
            usernameSpan.style.color = "red";
          }
          if (exists.email) {
            emailSpan.textContent = "Email already registered";
            emailSpan.style.color = "red";
          }
          let marioImage = document.getElementById("mario-register");
          marioImage.src = "../images/game-over.png";
          marioImage.style.width = "50%";          return;
        }
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        registerUser(fullName, username, email, password)
          .then(() => {
            window.location.href = "../index.html";
          })
          .catch(error => {
            console.error("Registration failed:", error);
          });
      });
  });
});

async function registerUser(fullName, username, email, password) {
  const response = await fetch(`${api}/register`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      fullName: fullName,
      username: username,
      email: email,
      password: password,
    }),
  });
  console.log(response);
  
  
  if (!response.ok) {
    throw new Error("Failed to register user");
  }
  return response.json();
}

async function checkUserExists(username, email) {
  const response = await fetch(`${api}/register`);
  if (!response.ok) return false;
  const users = await response.json();
  let exists = { username: false, email: false };
  users.forEach(user => {
    if (user.username === username) exists.username = true;
    if (user.email === email) exists.email = true;
  });
  return (exists.username || exists.email) ? exists : false;
}
