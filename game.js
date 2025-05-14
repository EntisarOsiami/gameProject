let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let GameState = {
  MENU: "menu",
  PLAYING: "playing",
  GAMEOVER: "gameover",
  WIN: "win",
};
let gameState = GameState.MENU;

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

let bgImage = loadImage("img/bg.jpg");
let grassImg = loadImage("img/Base pack/Tiles/grassMid.png");
let hudCoin = loadImage("img/Base pack/HUD/hud_coins.png");
let hudHeart = loadImage("img/Base pack/HUD/hud_heartFull.png");
let hudHeartEmpty = loadImage("img/Base pack/HUD/hud_heartEmpty.png");
let spaceshipImg = loadImage("img/spaceship.png");
let stoneBlockImg = loadImage("img/Base pack/Tiles/stoneMid.png");
let bushImg = loadImage("img/Base pack/Items/bush.png");
let mushroomRedImg = loadImage("img/Base pack/Items/mushroomRed.png");
let mushroomBrownImg = loadImage("img/Base pack/Items/mushroomBrown.png");
let cloud1Img = loadImage("img/Base pack/Items/cloud1.png");
let cloud2Img = loadImage("img/Base pack/Items/cloud2.png");
let cloud3Img = loadImage("img/Base pack/Items/cloud3.png");
let playerStand = loadImage("img/Base pack/Player/p1_stand.png");
let playerJump = loadImage("img/Base pack/Player/p1_jump.png");
let playerHurt = loadImage("img/Base pack/Player/p1_hurt.png");
let walkFrames = [];
for (let i = 1; i <= 11; i++) {
  let frameNumber = i < 10 ? "0" + i : i;
  walkFrames.push(
    loadImage(`img/Base pack/Player/p1_walk/PNG/p1_walk${frameNumber}.png`)
  );
}

let slimeWalk1Img = loadImage("img/Base pack/Enemies/slimeWalk1.png");
let slimeWalk2Img = loadImage("img/Base pack/Enemies/slimeWalk2.png");
let slimeDeadImg = loadImage("img/Base pack/Enemies/slimeDead.png");
let snailWalk1Img = loadImage("img/Base pack/Enemies/snailWalk1.png");
let snailWalk2Img = loadImage("img/Base pack/Enemies/snailWalk2.png");
let snailShellImg = loadImage("img/Base pack/Enemies/snailShell.png");

let stats = {
  coins: 0,
  health: 3,
  maxHP: 5,
  score: 0,
};

let GAME_WIDTH = 1280;
let GAME_HEIGHT = 720;

function resize() {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  let aspectRatio = GAME_WIDTH / GAME_HEIGHT;
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (width / height > aspectRatio) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}
resize();
window.addEventListener("resize", resize);

const GRAVITY = 0.5;
const FLOOR_Y = canvas.height - 60;

let keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") {
    if (gameState === GameState.MENU) {
      gameState = GameState.PLAYING;
    } else if (gameState === GameState.WIN) {
      window.location.href = "level2.html";
    } else if (gameState === GameState.GAMEOVER) {
      gameState = GameState.PLAYING;
      stats.health = stats.maxHP;
      stats.coins = 0;
      player.x = 100;
      player.y = FLOOR_Y - player.height;
      player.vx = 0;
      player.vy = 0;
      player.isHurt = false;
      player.invincible = false;
      player.invinceTimer = 0;
      collectibles.forEach((item) => (item.collected = false));
      enemies.forEach((enemy) => {
        enemy.reset();
      });
    }
  } else if (e.code === "Escape") {
    if (gameState === GameState.GAMEOVER || gameState === GameState.WIN) {
      window.location.href = "index.html";
    }
  }
});
document.addEventListener("keyup", (e) => (keys[e.code] = false));

class Player {
  constructor() {
    this.width = 72;
    this.height = 97;
    this.x = 100;
    this.y = FLOOR_Y - this.height;
    this.vx = 0;
    this.vy = 0;
    this.speed = 5;
    this.jumpForce = -13;
    this.isOnGround = true;
    this.facingRight = true;
    this.isHurt = false;
    this.hurtTimer = null;
    this.invincible = false;
    this.invinceTimer = 0;
    this.INVINCE_TIME = 1500;
    this.blinkSpeed = 100;
    this.lastAnim = 0;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.FRAME_TIME = 50;
  }
  blockCheck(block) {
    return (
      this.x < block.x + block.width &&
      this.x + this.width > block.x &&
      this.y < block.y + block.height &&
      this.y + this.height > block.y
    );
  }
  getInput() {
    if (keys["ArrowRight"] || keys["KeyD"]) {
      this.vx = this.speed;
      this.facingRight = true;
    } else if (keys["ArrowLeft"] || keys["KeyA"]) {
      this.vx = -this.speed;
      this.facingRight = false;
    } else {
      this.vx = 0;
    }

    if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && this.isOnGround) {
      this.vy = this.jumpForce;
      this.isOnGround = false;
    }
  }

  applyGravity() {
    this.vy += GRAVITY;
  }

  move() {
    let prevX = this.x;
    let prevY = this.y;
    let nextX = this.x + this.vx;

    if (nextX > 0 || (nextX === 0 && this.vx > 0)) {
      this.x = nextX;
    } else {
      this.x = 0;
    }
    this.y += this.vy;
    return { prevX, prevY };
  }
  hitBlock(prevX, prevY) {
    let isOnBlock = false;
    blocks.forEach((block) => {
      if (this.blockCheck(block)) {
        if (prevY + this.height <= block.y) {
          this.y = block.y - this.height;
          this.vy = 0;
          this.isOnGround = true;
          isOnBlock = true;
        } else if (prevX + this.width <= block.x) {
          this.x = block.x - this.width;
        } else if (prevX >= block.x + block.width) {
          this.x = block.x + block.width;
        }
      }
    });
    return isOnBlock;
  }
  checkGround(isOnBlock) {
    if (!isOnBlock) {
      let isOverHole = holes.some((hole) => {
        let overlapStart = Math.max(this.x, hole.start);
        let overlapEnd = Math.min(this.x + this.width, hole.start + hole.width);
        return (
          overlapEnd > overlapStart &&
          overlapEnd - overlapStart > this.width * 0.7
        );
      });

      if (!isOverHole && this.y + this.height >= FLOOR_Y) {
        this.y = FLOOR_Y - this.height;
        this.vy = 0;
        this.isOnGround = true;
      } else if (this.y > DEATH_Y) {
        this.x = 100;
        this.y = FLOOR_Y - this.height;
        this.vx = 0;
        this.vy = 0;
        this.isOnGround = true;
        stats.health--;

        if (this.hurtTimer) {
          clearTimeout(this.hurtTimer);
        }
        this.isHurt = false;
        this.hurtTimer = null;

        if (stats.health <= 0) {
          gameState = GameState.GAMEOVER;
        }
      }
    }
  }
  update() {
    this.getInput();
    this.applyGravity();
    const { prevX, prevY } = this.move();
    const isOnBlock = this.hitBlock(prevX, prevY);
    this.checkGround(isOnBlock);

    if (this.invincible) {
      this.invinceTimer += 16.67;
      if (this.invinceTimer >= this.INVINCE_TIME) {
        this.invincible = false;
        this.invinceTimer = 0;
      }
    }
  }

  collect(collectibles) {
    collectibles.forEach((item) => {
      if (!item.collected && item.collides(this)) {
        item.collected = true;
        if (item.type === "coin") {
          stats.coins++;
        } else if (item.type === "heart") {
          stats.health = Math.min(stats.health + 1, stats.maxHP);
        }
      }
    });
  }
  enemyHit(enemies) {
    if (this.invincible) return;

    enemies.forEach((enemy) => {
      if (enemy.collides(this)) {
        if (this.vy > 0 && this.y + this.height < enemy.y + enemy.height / 2) {
          enemy.defeat();
          this.vy = -8;
        } else if (!enemy.isDefeated) {
          stats.health--;
          this.isHurt = true;
          this.invincible = true;
          this.invinceTimer = 0;

          if (this.hurtTimer) {
            clearTimeout(this.hurtTimer);
          }

          this.hurtTimer = setTimeout(() => {
            this.isHurt = false;
            this.hurtTimer = null;
          }, 300);

          this.vx = this.x < enemy.x ? -5 : 5;
          this.vy = -5;

          if (stats.health <= 0) {
            gameState = GameState.GAMEOVER;
          }
        }
      }
    });
  }
  draw(offsetX) {
    ctx.save();

    if (
      this.invincible &&
      Math.floor(this.invinceTimer / this.blinkSpeed) % 2 === 0
    ) {
      ctx.globalAlpha = 0.5;
    }

    let x = Math.round(this.x - offsetX);
    let y = Math.round(this.y);

    let currentSprite = playerStand;
    if (!this.isOnGround) {
      currentSprite = playerJump;
    } else if (this.vx !== 0) {
      this.walkTimer += 16.67;
      if (this.walkTimer >= this.FRAME_TIME) {
        this.walkFrame = (this.walkFrame + 1) % walkFrames.length;
        this.walkTimer = 0;
      }
      currentSprite = walkFrames[this.walkFrame];
    }
    if (this.isHurt) {
      currentSprite = playerHurt;
    }

    if (!this.facingRight) {
      ctx.scale(-1, 1);
      ctx.drawImage(currentSprite, -x - this.width, y, this.width, this.height);
    } else {
      ctx.drawImage(currentSprite, x, y, this.width, this.height);
    }

    ctx.restore();
  }
}

class Block {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
  draw(offsetX) {
    ctx.save();
    let x = Math.round(this.x - offsetX);
    let y = Math.round(this.y);
    ctx.drawImage(stoneBlockImg, x, y, this.width, this.height);
    ctx.restore();
  }
}

class Collectible {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.type = type;
    this.collected = false;
  }

  draw(offsetX) {
    if (this.collected) return;
    ctx.save();
    if (this.type === "coin") {
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(
        Math.round(this.x - offsetX + this.width / 2),
        Math.round(this.y + this.height / 2),
        10,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (this.type === "heart") {
      ctx.drawImage(
        hudHeart,
        Math.round(this.x - offsetX),
        Math.round(this.y),
        this.width,
        this.height
      );
    }
    ctx.restore();
  }

  collides(player) {
    return (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    );
  }
}

class Spaceship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 120;
    this.height = 120;
    this.hoverSpeed = 0.02;
    this.hitPad = 15;
  }

  update() {
    this.hover = Math.sin(Date.now() * this.hoverSpeed) * 10;
  }

  draw(offsetX) {
    ctx.save();
    let x = Math.round(this.x - offsetX);
    let y = Math.round(this.y + this.hover);

    if (spaceshipImg.complete) {
      ctx.drawImage(spaceshipImg, x, y, this.width, this.height);
    } else {
      ctx.fillStyle = "#4169E1";
      ctx.fillRect(x, y, this.width, this.height);
    }
    ctx.restore();
  }
  collides(player) {
    return (
      player.x < this.x + this.width + this.hitPad &&
      player.x + player.width > this.x - this.hitPad &&
      player.y < this.y + this.height + this.hitPad &&
      player.y + player.height > this.y - this.hitPad
    );
  }
}

class Decoration {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;

    switch (type) {
      case "bush":
        this.img = bushImg;
        this.width = 70;
        this.height = 70;
        break;
      case "mushroomRed":
        this.img = mushroomRedImg;
        this.width = 40;
        this.height = 40;
        break;
      case "mushroomBrown":
        this.img = mushroomBrownImg;
        this.width = 40;
        this.height = 40;
        break;
      case "cloud1":
        this.img = cloud1Img;
        this.width = 100;
        this.height = 60;
        this.offsetY = 0;
        break;
      case "cloud2":
        this.img = cloud2Img;
        this.width = 120;
        this.height = 60;
        this.offsetY = 0;
        break;
      case "cloud3":
        this.img = cloud3Img;
        this.width = 140;
        this.height = 70;
        this.offsetY = 0;
        break;
    }
  }

  draw(offsetX) {
    if (this.img) {
      let drawX = Math.round(this.x - offsetX);
      let drawY = Math.round(this.y + (this.offsetY || 0));

      if (drawX + this.width > 0 && drawX < canvas.width) {
        ctx.drawImage(this.img, drawX, drawY, this.width, this.height);
      }
    }
  }
}

class Enemy {
  constructor(x, y, type, startPos, endPos) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.type = type;
    this.patrolStart = startPos || x - 100;
    this.patrolEnd = endPos || x + 100;

    this.direction = 1;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.isDefeated = false;
    this.defeatTimer = 0;

    if (type === "slime") {
      this.width = 50;
      this.height = 28;
      this.speed = 1;
      this.animationSpeed = 300;
    } else if (type === "snail") {
      this.width = 54;
      this.height = 31;
      this.speed = 0.5;
      this.animationSpeed = 400;
    }
  }
  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.direction = 1;
    this.isDefeated = false;
    this.defeatTimer = 0;
  }
  update() {
    if (this.isDefeated) {
      this.defeatTimer += 16.67;
      if (this.defeatTimer >= 2000) {
        this.reset();
      }
      return;
    }
    let nextX = this.x + this.speed * this.direction;

    let overHole = holes.some((hole) => {
      return (
        nextX >= hole.start - this.width / 2 &&
        nextX <= hole.start + hole.width + this.width / 2
      );
    });

    if (!overHole) {
      this.x = nextX;
    } else {
      this.direction *= -1;
    }

    if (this.x <= this.patrolStart) {
      this.x = this.patrolStart;
      this.direction = 1;
    } else if (this.x >= this.patrolEnd) {
      this.x = this.patrolEnd;
      this.direction = -1;
    }

    this.animationTimer += 16.67;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationFrame = 1 - this.animationFrame;
      this.animationTimer = 0;
    }
  }

  defeat() {
    this.isDefeated = true;
    this.defeatTimer = 0;
  }

  collides(player) {
    if (this.isDefeated) return false;

    return (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    );
  }
  draw(offsetX) {
    ctx.save();
    let x = Math.round(this.x - offsetX);
    let y = Math.round(this.y);

    let img;

    if (this.isDefeated) {
      if (this.defeatTimer < 500) {
        if (this.type === "slime") {
          img = slimeDeadImg;
        } else if (this.type === "snail") {
          img = snailShellImg;
        }
      } else {
        ctx.restore();
        return;
      }
    } else {
      if (this.type === "slime") {
        img = this.animationFrame === 0 ? slimeWalk1Img : slimeWalk2Img;
      } else if (this.type === "snail") {
        img = this.animationFrame === 0 ? snailWalk1Img : snailWalk2Img;
      }
    }
    if (img && img.complete) {
      if (this.direction === 1 && !this.isDefeated) {
        ctx.scale(-1, 1);
        ctx.drawImage(img, -x - this.width, y, this.width, this.height);
      } else {
        ctx.drawImage(img, x, y, this.width, this.height);
      }
    } else {
      ctx.fillStyle = this.type === "slime" ? "green" : "brown";
      ctx.fillRect(x, y, this.width, this.height);
    }

    ctx.restore();
  }
}

let player = new Player();

let enemies = [
  new Enemy(250, FLOOR_Y - 28, "slime", 100, 400),

  new Enemy(1100, FLOOR_Y - 31, "snail", 1000, 1200),

  new Enemy(2000, FLOOR_Y - 28, "slime", 1800, 2300),
  new Enemy(2200, FLOOR_Y - 31, "snail", 2000, 2350),

  new Enemy(5000, FLOOR_Y - 31, "snail", 4800, 5100),
  new Enemy(5900, FLOOR_Y - 28, "slime", 5750, 6200),

  new Enemy(7300, FLOOR_Y - 31, "snail", 7250, 7450),
  new Enemy(7700, FLOOR_Y - 28, "slime", 7600, 7800),
];

let blocks = [
  new Block(1700, FLOOR_Y - 120, 100, 20),
  new Block(1950, FLOOR_Y - 190, 100, 20),
  new Block(2200, FLOOR_Y - 120, 100, 20),

  new Block(3600, FLOOR_Y - 90, 100, 20),

  new Block(4450, FLOOR_Y - 140, 100, 20),
  new Block(4600, FLOOR_Y - 200, 100, 20),

  new Block(5000, FLOOR_Y - 100, 150, 20),
  new Block(5300, FLOOR_Y - 170, 120, 20),
  new Block(5600, FLOOR_Y - 230, 100, 20),

  new Block(6100, FLOOR_Y - 120, 200, 20),
  new Block(6450, FLOOR_Y - 180, 150, 20),

  new Block(7000, FLOOR_Y - 150, 100, 20),
  new Block(7200, FLOOR_Y - 220, 100, 20),
  new Block(7400, FLOOR_Y - 150, 100, 20),

  new Block(7700, FLOOR_Y - 100, 150, 20),
  new Block(7950, FLOOR_Y - 180, 180, 20),
];

let holes = [
  { start: 450, width: 100 },
  { start: 920, width: 150 },
  { start: 1250, width: 180 },

  { start: 2400, width: 120 },
  { start: 2650, width: 120 },
  { start: 2900, width: 120 },

  { start: 3350, width: 280 },
  { start: 3850, width: 150 },

  { start: 4280, width: 150 },
  { start: 4650, width: 200 },

  { start: 5150, width: 120 },
  { start: 5450, width: 130 },

  { start: 6300, width: 120 },
  { start: 6650, width: 250 },

  { start: 7100, width: 80 },
  { start: 7520, width: 150 },

  { start: 7870, width: 70 },
  { start: 8150, width: 100 },
];

let DEATH_Y = canvas.height + 100;

let spaceship = new Spaceship(8000, FLOOR_Y - 200);

let collectibles = [
  new Collectible(300, FLOOR_Y - 50, "coin"),
  new Collectible(1050, FLOOR_Y - 160, "coin"),
  new Collectible(1800, FLOOR_Y - 180, "coin"),
  new Collectible(2720, FLOOR_Y - 160, "coin"),
  new Collectible(3200, FLOOR_Y - 50, "heart"),
  new Collectible(3650, FLOOR_Y - 120, "coin"),
  new Collectible(4080, FLOOR_Y - 130, "coin"),
  new Collectible(4470, FLOOR_Y - 220, "heart"),
  new Collectible(4620, FLOOR_Y - 220, "coin"),
  new Collectible(5020, FLOOR_Y - 130, "coin"),
  new Collectible(5320, FLOOR_Y - 200, "coin"),
  new Collectible(5620, FLOOR_Y - 260, "heart"),
  new Collectible(6150, FLOOR_Y - 150, "coin"),
  new Collectible(6300, FLOOR_Y - 150, "coin"),
  new Collectible(6500, FLOOR_Y - 210, "heart"),
  new Collectible(7020, FLOOR_Y - 180, "coin"),
  new Collectible(7220, FLOOR_Y - 250, "coin"),
  new Collectible(7420, FLOOR_Y - 180, "coin"),
  new Collectible(7750, FLOOR_Y - 130, "heart"),
  new Collectible(8000, FLOOR_Y - 210, "coin"),
];

let decorations = [
  new Decoration(200, FLOOR_Y - 70, "bush"),
  new Decoration(600, FLOOR_Y - 70, "bush"),
  new Decoration(1500, FLOOR_Y - 70, "bush"),
  new Decoration(2300, FLOOR_Y - 70, "bush"),
  new Decoration(3200, FLOOR_Y - 70, "bush"),
  new Decoration(4200, FLOOR_Y - 70, "bush"),
  new Decoration(5000, FLOOR_Y - 70, "bush"),
  new Decoration(5700, FLOOR_Y - 70, "bush"),
  new Decoration(6200, FLOOR_Y - 70, "bush"),
  new Decoration(7000, FLOOR_Y - 70, "bush"),
  new Decoration(7300, FLOOR_Y - 70, "bush"),
  new Decoration(8100, FLOOR_Y - 70, "bush"),

  new Decoration(350, FLOOR_Y - 40, "mushroomRed"),
  new Decoration(800, FLOOR_Y - 40, "mushroomBrown"),
  new Decoration(1900, FLOOR_Y - 40, "mushroomRed"),
  new Decoration(2600, FLOOR_Y - 40, "mushroomBrown"),
  new Decoration(3100, FLOOR_Y - 40, "mushroomRed"),
  new Decoration(5800, FLOOR_Y - 40, "mushroomBrown"),
  new Decoration(6500, FLOOR_Y - 40, "mushroomRed"),
  new Decoration(7000, FLOOR_Y - 40, "mushroomBrown"),
  new Decoration(7300, FLOOR_Y - 40, "mushroomRed"),
  new Decoration(7700, FLOOR_Y - 40, "mushroomBrown"),

  new Decoration(300, 50, "cloud1"),
  new Decoration(800, 100, "cloud2"),
  new Decoration(1400, 70, "cloud3"),
  new Decoration(2000, 60, "cloud1"),
  new Decoration(2600, 90, "cloud2"),
  new Decoration(3200, 40, "cloud3"),
  new Decoration(3800, 80, "cloud1"),
  new Decoration(4400, 50, "cloud2"),
  new Decoration(5000, 70, "cloud3"),
  new Decoration(5500, 60, "cloud1"),
  new Decoration(6000, 90, "cloud2"),
  new Decoration(6500, 40, "cloud3"),
  new Decoration(7000, 80, "cloud1"),
  new Decoration(7500, 50, "cloud2"),
  new Decoration(8000, 70, "cloud3"),
];

let scrollOffset = 0;

function drawGrass(offset) {
  let groundY = FLOOR_Y;

  if (grassImg.complete && grassImg.naturalWidth !== 0) {
    let currentX = -(offset % grassImg.width);
    while (currentX < canvas.width) {
      let worldX = currentX + offset;

      let isHole = holes.some(
        (hole) => worldX >= hole.start && worldX < hole.start + hole.width
      );

      if (!isHole) {
        ctx.fillStyle = "#228B22";
        ctx.fillRect(
          currentX,
          groundY,
          grassImg.width,
          canvas.height - groundY
        );
        ctx.drawImage(grassImg, Math.round(currentX), groundY - 4);
      }

      currentX += grassImg.width;
    }
  }
}

function drawMenu() {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Platform Adventure", canvas.width / 2, canvas.height / 3);

  ctx.font = "24px Arial";
  ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function drawHUD() {
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Coins: ${stats.coins}`, 20, 30);

  for (let i = 0; i < stats.maxHP; i++) {
    let img = i < stats.health ? hudHeart : hudHeartEmpty;
    if (img.complete) {
      ctx.drawImage(img, 20 + i * 40, 40, 30, 30);
    } else {
      ctx.fillStyle = i < stats.health ? "red" : "gray";
      ctx.fillRect(20 + i * 40, 40, 30, 30);
    }
  }
  ctx.restore();
}

function drawWinScreen() {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Level Complete!", canvas.width / 2, canvas.height / 3);

  ctx.fillStyle = "white";
  ctx.font = "28px Arial";
  ctx.fillText(
    `You reached the spaceship!`,
    canvas.width / 2,
    canvas.height / 2 - 30
  );
  ctx.fillText(
    `Coins Collected: ${stats.coins}`,
    canvas.width / 2,
    canvas.height / 2 + 20
  );
  ctx.fillText(
    `Final Score: ${stats.score}`,
    canvas.width / 2,
    canvas.height / 2 + 60
  );

  if (spaceshipImg.complete) {
    let iconSize = 80;
    ctx.drawImage(
      spaceshipImg,
      canvas.width / 2 - iconSize / 2,
      canvas.height / 2 + 60,
      iconSize,
      iconSize
    );
  }  ctx.font = "24px Arial";
  ctx.fillText(
    "Press SPACE to go to Level 2",
    canvas.width / 2,
    (canvas.height * 3) / 4 + 30
  );
  ctx.fillText(
    "Press ESC to return to main menu",
    canvas.width / 2,
    (canvas.height * 3) / 4 + 60
  );
  ctx.restore();
}

function drawGameOver() {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 3);
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText(
    `Coins Collected: ${stats.coins}`,
    canvas.width / 2,
    canvas.height / 2
  );  ctx.fillText(
    "Press SPACE to Try Again",
    canvas.width / 2,
    (canvas.height * 2) / 3
  );
  ctx.fillText(
    "Press ESC to return to main menu",
    canvas.width / 2,
    (canvas.height * 2) / 3 + 30
  );
  ctx.restore();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgImage.complete && bgImage.naturalWidth !== 0) {
    let bgShift = scrollOffset * 0.5;
    let bgOffset = bgShift % bgImage.naturalWidth;

    ctx.drawImage(
      bgImage,
      Math.floor(-bgOffset),
      0,
      bgImage.naturalWidth,
      canvas.height
    );
    ctx.drawImage(
      bgImage,
      Math.floor(-bgOffset + bgImage.naturalWidth),
      0,
      bgImage.naturalWidth,
      canvas.height
    );
  } else {
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawGrass(scrollOffset);

  if (gameState === GameState.MENU) {
    drawMenu();
  } else if (gameState === GameState.PLAYING) {
    player.update();
    player.collect(collectibles);
    scrollOffset = player.x - 100;
    decorations.forEach((decoration) => {
      decoration.draw(scrollOffset);
    });

    blocks.forEach((block) => {
      if (
        block.x - scrollOffset < canvas.width &&
        block.x + block.width - scrollOffset > 0
      ) {
        block.draw(scrollOffset);
      }
    });

    enemies.forEach((enemy) => {
      if (
        enemy.x - scrollOffset < canvas.width &&
        enemy.x + enemy.width - scrollOffset > 0
      ) {
        enemy.draw(scrollOffset);
      }
    });

    collectibles.forEach((item) => {
      if (
        item.x - scrollOffset < canvas.width &&
        item.x + item.width - scrollOffset > 0
      ) {
        item.draw(scrollOffset);
      }
    });
    if (
      spaceship.x - scrollOffset < canvas.width &&
      spaceship.x + spaceship.width - scrollOffset > 0
    ) {
      spaceship.update();
      spaceship.draw(scrollOffset);
      if (spaceship.collides(player)) {
        let finalScore = (stats.coins + stats.health) * 100;
        stats.score = finalScore;
        gameState = GameState.WIN;
      }
    }

    enemies.forEach((enemy) => {
      enemy.update();
    });
    player.enemyHit(enemies);
    player.draw(scrollOffset);
    drawHUD();
  } else if (gameState === GameState.WIN) {
    drawWinScreen();
  } else if (gameState === GameState.GAMEOVER) {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
