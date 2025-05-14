const api = "https://68219a2d259dad2655afc2ba.mockapi.io";

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.querySelector(".sign-in-btn");

  loginBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById("username-login");
    const passwordInput = document.getElementById("pass-login");
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const usernameSpan = document.getElementById("login-username-span");
    const passwordSpan = document.getElementById("login-pass-span");

    usernameSpan.textContent = "Your unique username for logging in.";
    usernameSpan.style.color = "";
    passwordSpan.textContent = "Enter your password.";
    passwordSpan.style.color = "";

    let isValid = true;

    if (!username) {
      usernameSpan.textContent = "Username is required";
      usernameSpan.style.color = "red";
      isValid = false;
    }

    if (!password) {
      passwordSpan.textContent = "Password is required";
      passwordSpan.style.color = "red";
      isValid = false;
    } else if (password.length < 6) {
      passwordSpan.textContent = "Password must be at least 6 characters";
      passwordSpan.style.color = "red";
      isValid = false;
    }

    if (!isValid) return;

    try {
      loginBtn.disabled = true;
      loginBtn.textContent = "Loading...";

      const response = await fetch(`${api}/register`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const users = await response.json();
      
      if (!Array.isArray(users)) {
        throw new Error("Invalid data format from API");
      }

      const user = users.find(u => u.username === username && u.password === password);      if (user) {
        localStorage.setItem("username", user.username);
        localStorage.setItem("fullName", user.fullName || "");
        
        await createInGameProfile(user.username);
        
        alert(`Welcome ${user.fullName || user.username}`);
        window.location.href = "../index.html";
      } else {
        usernameSpan.textContent = "Username or password is incorrect";
        usernameSpan.style.color = "red";
        passwordSpan.textContent = "Username or password is incorrect";
        passwordSpan.style.color = "red";
        
        passwordInput.value = "";
        passwordInput.focus();
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to connect to server. Please try again later.");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";
    }
  });

  async function createInGameProfile(username) {
    try {
      const checkResponse = await fetch(`${api}/inGame?username=${username}`);
      const existingProfiles = await checkResponse.json();
      
      if (existingProfiles.length > 0) {
        console.log("In-game profile already exists");
        return existingProfiles[0];
      }
      
      const response = await fetch(`${api}/inGame`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          score: 0,
          level: 0,
          createdAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create in-game profile: ${response.status}`);
      }
      
      const inGameData = await response.json();
      console.log("In-game profile created:", inGameData);
      return inGameData;
    } catch (error) {
      console.error("Error creating in-game profile:", error);
      return null;
    }
  }
});