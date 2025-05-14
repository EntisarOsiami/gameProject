document.addEventListener("DOMContentLoaded", function () {
  const playBtn = document.querySelector(".btn-start");
  const registerBtn = document.querySelector(".btn-register");
  
  playBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const username = localStorage.getItem("username");
    
    if (username) {
      window.location.href = "level1.html";
    } else {
      window.location.href = "login/log-in.html";
    }
  });
  
  registerBtn.addEventListener("click", function(e) {
    e.preventDefault();
    window.location.href = "register/register.html";
  });
});
