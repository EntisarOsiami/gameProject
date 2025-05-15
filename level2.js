document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  let scrollSpeed = 11;
  let offset = 0;
  const keys = {};
  let pipeInterval = 400;  let score = 0;
  let gameOver = false;
  
  const api = "https://68219a2d259dad2655afc2ba.mockapi.io";

  // Load images
  const marioImage = new Image();
  marioImage.src = "player.png";
  const tileImage = new Image();
  tileImage.src = "cactus.png";
  const floorImage = new Image();
  floorImage.src = "sand.png";  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;    if (e.key === " " && gameOver) {
        restartGame();
    }
      // ESC key to return to main menu
    if ((e.key === "Escape" || e.key === "Esc" || e.code === "Escape") && gameOver) {
        window.location.href = "./index.html"; 
    }
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  const player = {
    x: 100,
    y: canvas.height - 100,
    width: 80,
    height: 125,
    image: marioImage,
    changeY: 0,
    gravity: 1,
    jumpPower: -25,
    onGround: false,
    jumpCount: 0
  };

  const ground = {
    x: 0,
    y: canvas.height - 50,
    width: canvas.width,
    height: 50,
    image: floorImage,
  };

  let tiles = [];           
  let nextPipeX = canvas.width; 
  
  const generatePipe = () => {
    const pipeH = 50 + Math.random() * 150;
    tiles.push({
      x: nextPipeX,
      y: canvas.height - 40 - pipeH,
      width: 100,
      height: pipeH,
      image: tileImage,
    });
    nextPipeX += pipeInterval;
  };
  
  const restartGame = () => {
    player.y = canvas.height - 100;
    player.changeY = 0;
    player.onGround = false;
  
    tiles = [];
    nextPipeX = canvas.width;
    offset = 0;
    scrollSpeed = 7;
    score = 0;
    gameOver = false;
  
    update();
  };
  
  const drawScore = () => {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + Math.floor(score), 30, 40);
  };
  

  const isColliding = (a, b) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  const drawImage = (obj) => {
    ctx.drawImage(obj.image, obj.x - offset, obj.y, obj.width, obj.height);
  };

  
  const update = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (!gameOver) {
        score += 0.1; 
      }

    player.changeY += player.gravity;
    player.y += player.changeY;
  
    if (player.y + player.height >= ground.y) {
      player.y = ground.y - player.height;
      player.changeY = 0;
      player.onGround = true;
      player.jumpCount = 0; 
    } else {
      player.onGround = false;
    }
  
    // Handle jumping 
    if (keys["ArrowUp"] && player.jumpCount < 2) {
      player.changeY = player.jumpPower;
      player.jumpCount++;
      keys["ArrowUp"] = false; 
    }
  
    // Draw & scroll ground
    ctx.drawImage(
      ground.image,
      0,
      ground.y,
      canvas.width,
      ground.height
    );
  
    // Cactus logic
    if (tiles.length === 0 || nextPipeX - tiles[tiles.length - 1].x >= pipeInterval) {
      generatePipe();
    }
  
    tiles.forEach((pipe) => pipe.x -= scrollSpeed);
  
    tiles = tiles.filter((pipe) => {
      // Collision detection
      if (isColliding(player, pipe)) {
        gameOver = true;
      }
  
      // Draw cactus
      ctx.drawImage(pipe.image, pipe.x, pipe.y, pipe.width, pipe.height);
  
      return pipe.x + pipe.width > 0;
    });
  
    // Draw player
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Score: " + Math.floor(score), canvas.width / 2, 40);
  

    drawScore();

    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      ctx.fillStyle = "white";
      ctx.textAlign = "center";  
      ctx.textBaseline = "middle"; 
      
      ctx.font = "60px Arial";
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60);
        ctx.font = "30px Arial";
      ctx.fillText("Final Score: " + Math.floor(score), canvas.width / 2, canvas.height / 2);
      ctx.fillText("Press SPACE to play again", canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText("Press ESC to return to main menu", canvas.width / 2, canvas.height / 2 + 80);      
      const finalScore = Math.floor(score);
      localStorage.setItem("level2_score", finalScore);
      const username = localStorage.getItem("username") || "guest";
      
      try {
        fetch(`${api}/inGame`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username, score: finalScore, level: 2, createdAt: new Date().toISOString() }),
        }).catch(error => {
          console.error("error:", error);
        });
      } catch(error) {
        console.error("error:", error);
      }
      return;
    }
    


    requestAnimationFrame(update);
  };
  

  let imagesLoaded = 0;
  const checkImagesLoaded = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) {
      update();
    }
  };

  marioImage.onload = checkImagesLoaded;
  tileImage.onload = checkImagesLoaded;
  floorImage.onload = checkImagesLoaded;
});
