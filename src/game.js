const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const startPanel = document.querySelector("#start-panel");
const startButton = document.querySelector("#start-button");
const pauseBadge = document.querySelector("#pause-badge");
const timerText = document.querySelector("#timer");
const healthFill = document.querySelector("#health-fill");
const healthText = document.querySelector("#health-text");
const killCountText = document.querySelector("#kill-count");
const levelText = document.querySelector("#level-text");
const experienceText = document.querySelector("#experience-text");
const experienceFill = document.querySelector("#experience-fill");
const upgradePanel = document.querySelector("#upgrade-panel");
const upgradeOptions = document.querySelector("#upgrade-options");
const gameOverPanel = document.querySelector("#game-over-panel");
const gameOverSummary = document.querySelector("#game-over-summary");
const restartButton = document.querySelector("#restart-button");
const resultKicker = document.querySelector("#result-kicker");
const resultTitle = document.querySelector("#result-title");
const bestRecordText = document.querySelector("#best-record");
const soundToggle = document.querySelector("#sound-toggle");
const joystickBase = document.querySelector("#joystick-base");
const joystickKnob = document.querySelector("#joystick-knob");
const touchControls = document.querySelector("#touch-controls");
const buildText = document.querySelector("#build-text");

const pageParameters = new URLSearchParams(window.location.search);
const localTestMode = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
  && pageParameters.get("test") === "1";
const requestedTestDuration = Number.parseFloat(pageParameters.get("roundDuration") || "");
const requestedTestDefeatTime = Number.parseFloat(pageParameters.get("defeatAfter") || "");
const ROUND_DURATION_SECONDS = localTestMode && Number.isFinite(requestedTestDuration)
  ? clamp(requestedTestDuration, 1, 300)
  : 5 * 60;
const QUICK_LEVEL_TEST = localTestMode && pageParameters.get("quickLevel") === "1";
const TEST_DEFEAT_AFTER = localTestMode && Number.isFinite(requestedTestDefeatTime)
  ? clamp(requestedTestDefeatTime, 0.5, 300)
  : null;
const FORCED_TEST_UPGRADES = localTestMode
  ? (pageParameters.get("upgrades") || "").split(",").filter(Boolean)
  : [];
const BEST_RECORD_KEY = localTestMode
  ? "spud-star-survivor-test-best-seconds"
  : "spud-star-survivor-best-seconds";

// 所有会变化的游戏状态集中在这里。重新开始时，我们只要把它们恢复初始值。
const game = {
  started: false,
  paused: false,
  over: false,
  elapsedSeconds: 0,
  lastFrameTime: 0,
  spawnTimer: 0,
  attackTimer: 0,
  kills: 0,
  level: 1,
  experience: 0,
  experienceToNext: 6,
  choosingUpgrade: false,
  touchX: 0,
  touchY: 0,
  activePointerId: null,
  keys: new Set(),
  enemies: [],
  projectiles: [],
  particles: [],
  gems: [],
};

const audio = {
  context: null,
  enabled: true,
};

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 24,
  speed: 240,
  facingX: 1,
  facingY: 0,
  maxHealth: 100,
  health: 100,
  invulnerableTimer: 0,
  pickupRadius: 105,
};

const weapon = {
  damage: 26,
  cooldown: 0.58,
  projectileSpeed: 520,
  projectileCount: 1,
  orbitCount: 0,
  orbitAngle: 0,
  starBurstLevel: 0,
  starBurstTimer: 0,
};

const UPGRADES = [
  {
    id: "damage",
    icon: "🌰",
    name: "硬壳种子",
    description: "种子伤害 +8",
    apply() {
      weapon.damage += 8;
    },
  },
  {
    id: "attack-speed",
    icon: "⚡",
    name: "快速发芽",
    description: "攻击间隔缩短 15%",
    apply() {
      weapon.cooldown = Math.max(0.18, weapon.cooldown * 0.85);
    },
  },
  {
    id: "move-speed",
    icon: "👟",
    name: "轻快根须",
    description: "移动速度 +25",
    apply() {
      player.speed += 25;
    },
  },
  {
    id: "health",
    icon: "❤️",
    name: "厚实外皮",
    description: "最大生命 +20，并恢复 20 点",
    apply() {
      player.maxHealth += 20;
      player.health = Math.min(player.maxHealth, player.health + 20);
    },
  },
  {
    id: "pickup",
    icon: "🧲",
    name: "能量磁场",
    description: "拾取范围 +40",
    apply() {
      player.pickupRadius += 40;
    },
  },
  {
    id: "multishot",
    icon: "🌱",
    name: "分叉嫩芽",
    description: "每次多发射 1 颗种子（最多 3 颗）",
    isAvailable() {
      return weapon.projectileCount < 3;
    },
    apply() {
      weapon.projectileCount = Math.min(3, weapon.projectileCount + 1);
    },
  },
  {
    id: "orbit-leaf",
    icon: "🍃",
    name: "守护叶片",
    description: "增加 1 片环绕叶片，接触敌人时造成伤害",
    isAvailable() {
      return weapon.orbitCount < 3;
    },
    apply() {
      weapon.orbitCount += 1;
    },
  },
  {
    id: "star-burst",
    icon: "✨",
    name: "星芒爆发",
    description: "解锁或强化周期性的八方向星芒",
    isAvailable() {
      return weapon.starBurstLevel < 3;
    },
    apply() {
      weapon.starBurstLevel += 1;
      weapon.starBurstTimer = 0.4;
    },
  },
];

const COLORS = {
  grass: "#273a27",
  grassLight: "#2e432d",
  grid: "rgba(232, 238, 212, 0.07)",
  shadow: "rgba(0, 0, 0, 0.28)",
  potato: "#c9864d",
  potatoLight: "#e6ad67",
  potatoDark: "#795033",
  leaf: "#77a64f",
  enemy: "#914e61",
  enemyLight: "#c46c7f",
  enemyDark: "#552d3a",
  seed: "#f5d27a",
};

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getBestRecord() {
  try {
    return Number.parseFloat(localStorage.getItem(BEST_RECORD_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

function saveBestRecord(seconds) {
  const bestRecord = Math.max(getBestRecord(), seconds);
  try {
    localStorage.setItem(BEST_RECORD_KEY, String(bestRecord));
  } catch {
    // 隐私模式可能禁止本地存储；这不会影响游戏本身。
  }
  bestRecordText.textContent = `最高纪录：${formatTime(bestRecord)}`;
}

function ensureAudio() {
  if (!audio.enabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audio.context) audio.context = new AudioContextClass();
  if (audio.context.state === "suspended") audio.context.resume();
}

function playSound(name) {
  if (!audio.enabled || !audio.context) return;
  const sounds = {
    shoot: { frequency: 300, endFrequency: 220, duration: 0.055, volume: 0.018, type: "square" },
    pickup: { frequency: 620, endFrequency: 880, duration: 0.09, volume: 0.035, type: "sine" },
    level: { frequency: 440, endFrequency: 920, duration: 0.22, volume: 0.055, type: "triangle" },
    hurt: { frequency: 150, endFrequency: 75, duration: 0.16, volume: 0.07, type: "sawtooth" },
    burst: { frequency: 720, endFrequency: 340, duration: 0.16, volume: 0.035, type: "sine" },
    end: { frequency: 260, endFrequency: 110, duration: 0.45, volume: 0.07, type: "triangle" },
    win: { frequency: 520, endFrequency: 1040, duration: 0.5, volume: 0.075, type: "triangle" },
  };
  const sound = sounds[name];
  if (!sound) return;

  const now = audio.context.currentTime;
  const oscillator = audio.context.createOscillator();
  const gain = audio.context.createGain();
  oscillator.type = sound.type;
  oscillator.frequency.setValueAtTime(sound.frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(sound.endFrequency, now + sound.duration);
  gain.gain.setValueAtTime(sound.volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);
  oscillator.connect(gain);
  gain.connect(audio.context.destination);
  oscillator.start(now);
  oscillator.stop(now + sound.duration);
}

function distanceSquared(first, second) {
  const differenceX = first.x - second.x;
  const differenceY = first.y - second.y;
  return differenceX * differenceX + differenceY * differenceY;
}

function resetGame() {
  game.started = true;
  game.paused = false;
  game.over = false;
  game.elapsedSeconds = 0;
  game.spawnTimer = 0.3;
  game.attackTimer = 0;
  game.kills = 0;
  game.level = 1;
  game.experience = 0;
  game.experienceToNext = QUICK_LEVEL_TEST ? 1 : 6;
  game.choosingUpgrade = false;
  game.touchX = 0;
  game.touchY = 0;
  game.activePointerId = null;
  game.enemies = [];
  game.projectiles = [];
  game.particles = [];
  game.gems = [];

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.health = player.maxHealth;
  player.maxHealth = 100;
  player.health = 100;
  player.speed = 240;
  player.pickupRadius = 105;
  player.invulnerableTimer = 0;

  weapon.damage = 26;
  weapon.cooldown = 0.58;
  weapon.projectileCount = 1;
  weapon.orbitCount = 0;
  weapon.orbitAngle = 0;
  weapon.starBurstLevel = 0;
  weapon.starBurstTimer = 0;

  joystickKnob.style.transform = "translate(-50%, -50%)";
  touchControls.hidden = false;

  startPanel.hidden = true;
  gameOverPanel.hidden = true;
  pauseBadge.hidden = true;
  upgradePanel.hidden = true;
  updateHud();
}

function updateHud() {
  const healthPercent = Math.max(0, player.health / player.maxHealth) * 100;
  healthFill.style.width = `${healthPercent}%`;
  healthText.textContent = `${Math.max(0, Math.ceil(player.health))} / ${player.maxHealth}`;
  killCountText.textContent = String(game.kills);
  levelText.textContent = String(game.level);
  experienceText.textContent = `${game.experience} / ${game.experienceToNext}`;
  experienceFill.style.width = `${(game.experience / game.experienceToNext) * 100}%`;
  timerText.textContent = formatTime(game.elapsedSeconds);
  const activeWeapons = ["种子发射器"];
  if (weapon.orbitCount > 0) activeWeapons.push(`守护叶片 ×${weapon.orbitCount}`);
  if (weapon.starBurstLevel > 0) activeWeapons.push(`星芒 Lv.${weapon.starBurstLevel}`);
  buildText.textContent = `武器：${activeWeapons.join(" · ")}`;
}

function updatePlayer(deltaTime) {
  let directionX = game.touchX;
  let directionY = game.touchY;

  if (game.keys.has("KeyA") || game.keys.has("ArrowLeft")) directionX -= 1;
  if (game.keys.has("KeyD") || game.keys.has("ArrowRight")) directionX += 1;
  if (game.keys.has("KeyW") || game.keys.has("ArrowUp")) directionY -= 1;
  if (game.keys.has("KeyS") || game.keys.has("ArrowDown")) directionY += 1;

  // 对角线长度会大于 1，所以先“归一化”，避免斜着走更快。
  const directionLength = Math.hypot(directionX, directionY);
  if (directionLength > 0) {
    directionX /= directionLength;
    directionY /= directionLength;
    player.facingX = directionX;
    player.facingY = directionY;
  }

  player.x += directionX * player.speed * deltaTime;
  player.y += directionY * player.speed * deltaTime;
  player.x = clamp(player.x, player.radius, canvas.width - player.radius);
  player.y = clamp(player.y, player.radius + 58, canvas.height - player.radius);
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - deltaTime);
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  const margin = 30;
  let x;
  let y;

  if (side === 0) {
    x = Math.random() * canvas.width;
    y = -margin;
  } else if (side === 1) {
    x = canvas.width + margin;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + margin;
  } else {
    x = -margin;
    y = Math.random() * canvas.height;
  }

  // 不同敌人会随着时间逐步加入战场。
  const typeRoll = Math.random();
  let type = "spore";
  if (game.elapsedSeconds >= 35 && typeRoll < 0.22) {
    type = "bulwark";
  } else if (game.elapsedSeconds >= 15 && typeRoll < 0.48) {
    type = "runner";
  }

  const enemyStats = {
    spore: { radius: 18, speed: 66, health: 34, damage: 12 },
    runner: { radius: 12, speed: 122, health: 22, damage: 9 },
    bulwark: { radius: 27, speed: 43, health: 105, damage: 20 },
  }[type];

  // 生存越久，敌人会稍微变快、变耐打。
  const difficulty = 1 + game.elapsedSeconds / 95;
  game.enemies.push({
    x,
    y,
    type,
    radius: enemyStats.radius,
    speed: (enemyStats.speed + Math.random() * 12) * Math.min(difficulty, 1.65),
    maxHealth: enemyStats.health * difficulty,
    health: enemyStats.health * difficulty,
    damage: enemyStats.damage,
    hitFlash: 0,
    leafHitTimer: 0,
  });
}

function findNearestEnemy() {
  let nearestEnemy = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const enemy of game.enemies) {
    const currentDistance = distanceSquared(player, enemy);
    if (currentDistance < nearestDistance) {
      nearestEnemy = enemy;
      nearestDistance = currentDistance;
    }
  }

  return nearestEnemy;
}

function addProjectile(directionX, directionY, settings = {}) {
  game.projectiles.push({
    x: player.x + directionX * player.radius,
    y: player.y + directionY * player.radius,
    velocityX: directionX * weapon.projectileSpeed,
    velocityY: directionY * weapon.projectileSpeed,
    radius: settings.radius ?? 5,
    damage: settings.damage ?? weapon.damage,
    color: settings.color ?? COLORS.seed,
    remainingLife: settings.remainingLife ?? 1.6,
  });
}

function fireAtNearestEnemy() {
  const target = findNearestEnemy();
  if (!target) return;

  const differenceX = target.x - player.x;
  const differenceY = target.y - player.y;
  const length = Math.hypot(differenceX, differenceY) || 1;
  const directionX = differenceX / length;
  const directionY = differenceY / length;

  player.facingX = directionX;
  player.facingY = directionY;
  const baseAngle = Math.atan2(directionY, directionX);
  const spread = 0.15;
  for (let index = 0; index < weapon.projectileCount; index += 1) {
    const offset = (index - (weapon.projectileCount - 1) / 2) * spread;
    addProjectile(Math.cos(baseAngle + offset), Math.sin(baseAngle + offset));
  }
  playSound("shoot");
}

function fireStarBurst() {
  const projectileAmount = 8 + (weapon.starBurstLevel - 1) * 4;
  for (let index = 0; index < projectileAmount; index += 1) {
    const angle = (Math.PI * 2 * index) / projectileAmount + weapon.orbitAngle;
    addProjectile(Math.cos(angle), Math.sin(angle), {
      radius: 4,
      damage: weapon.damage * (0.45 + weapon.starBurstLevel * 0.12),
      color: "#e5a2ff",
      remainingLife: 1.15,
    });
  }
  createBurst(player.x, player.y, "#e5a2ff", 14);
  playSound("burst");
}

function dropGem(x, y) {
  game.gems.push({
    x,
    y,
    radius: 6,
    value: 1,
    wobble: Math.random() * Math.PI * 2,
  });
}

function gainExperience(amount) {
  game.experience += amount;
  if (game.experience >= game.experienceToNext && !game.choosingUpgrade) {
    game.experience -= game.experienceToNext;
    game.level += 1;
    game.experienceToNext = Math.round(game.experienceToNext * 1.35 + 2);
    playSound("level");
    openUpgradeChoices();
  }
}

function sampleUpgradeChoices() {
  const available = UPGRADES.filter((upgrade) => !upgrade.isAvailable || upgrade.isAvailable());
  if (FORCED_TEST_UPGRADES.length > 0) {
    const forced = FORCED_TEST_UPGRADES
      .map((upgradeId) => available.find((upgrade) => upgrade.id === upgradeId))
      .filter(Boolean);
    const remaining = available.filter((upgrade) => !forced.includes(upgrade));
    return [...forced, ...remaining].slice(0, 3);
  }
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function openUpgradeChoices() {
  game.choosingUpgrade = true;
  game.paused = true;
  pauseBadge.hidden = true;
  upgradeOptions.replaceChildren();

  for (const upgrade of sampleUpgradeChoices()) {
    const button = document.createElement("button");
    button.className = "upgrade-card";
    button.type = "button";
    button.dataset.upgradeId = upgrade.id;
    button.innerHTML = `
      <span class="upgrade-icon" aria-hidden="true">${upgrade.icon}</span>
      <span class="upgrade-name">${upgrade.name}</span>
      <span class="upgrade-description">${upgrade.description}</span>
    `;
    button.addEventListener("click", () => chooseUpgrade(upgrade));
    upgradeOptions.append(button);
  }

  upgradePanel.hidden = false;
  updateHud();
}

function chooseUpgrade(upgrade) {
  upgrade.apply();
  game.choosingUpgrade = false;
  game.paused = false;
  upgradePanel.hidden = true;
  updateHud();

  // 如果一次捡到很多经验，升级后可能仍然足够再升一级。
  if (game.experience >= game.experienceToNext) gainExperience(0);
}

function updateGems(deltaTime) {
  for (let index = game.gems.length - 1; index >= 0; index -= 1) {
    const gem = game.gems[index];
    gem.wobble += deltaTime * 5;
    const differenceX = player.x - gem.x;
    const differenceY = player.y - gem.y;
    const distance = Math.hypot(differenceX, differenceY) || 1;

    // 远处的能量会非常缓慢地漂向玩家，进入拾取范围后会快速被吸过来。
    const attractionSpeed = QUICK_LEVEL_TEST ? 950 : distance < player.pickupRadius ? 380 : 14;
    gem.x += (differenceX / distance) * attractionSpeed * deltaTime;
    gem.y += (differenceY / distance) * attractionSpeed * deltaTime;

    if (distance <= player.radius + gem.radius + 4) {
      gainExperience(gem.value);
      playSound("pickup");
      createBurst(gem.x, gem.y, "#6de0ce", 5);
      game.gems.splice(index, 1);
    }
  }
}

function createBurst(x, y, color, amount = 6) {
  for (let index = 0; index < amount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 35 + Math.random() * 80;
    game.particles.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color,
      remainingLife: 0.35 + Math.random() * 0.3,
      maxLife: 0.65,
    });
  }
}

function defeatEnemy(enemyIndex) {
  const enemy = game.enemies[enemyIndex];
  if (!enemy) return;
  createBurst(enemy.x, enemy.y, COLORS.enemyLight, 10);
  dropGem(enemy.x, enemy.y);
  game.enemies.splice(enemyIndex, 1);
  game.kills += 1;
}

function getOrbitLeafPosition(index) {
  const angle = weapon.orbitAngle + (Math.PI * 2 * index) / weapon.orbitCount;
  return {
    x: player.x + Math.cos(angle) * 58,
    y: player.y + Math.sin(angle) * 58,
    angle,
  };
}

function updateSpecialWeapons(deltaTime) {
  weapon.orbitAngle += deltaTime * 2.4;

  if (weapon.starBurstLevel > 0) {
    weapon.starBurstTimer -= deltaTime;
    if (weapon.starBurstTimer <= 0) {
      fireStarBurst();
      weapon.starBurstTimer = Math.max(1.9, 4.1 - weapon.starBurstLevel * 0.55);
    }
  }

  if (weapon.orbitCount === 0) return;

  for (let enemyIndex = game.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
    const enemy = game.enemies[enemyIndex];
    enemy.leafHitTimer = Math.max(0, enemy.leafHitTimer - deltaTime);
    if (enemy.leafHitTimer > 0) continue;

    for (let leafIndex = 0; leafIndex < weapon.orbitCount; leafIndex += 1) {
      const leaf = getOrbitLeafPosition(leafIndex);
      const hitDistance = enemy.radius + 11;
      if (distanceSquared(leaf, enemy) > hitDistance * hitDistance) continue;

      enemy.health -= 18 + weapon.damage * 0.45;
      enemy.hitFlash = 0.1;
      enemy.leafHitTimer = 0.38;
      createBurst(leaf.x, leaf.y, COLORS.leaf, 5);
      if (enemy.health <= 0) defeatEnemy(enemyIndex);
      break;
    }
  }
}

function updateCombat(deltaTime) {
  game.spawnTimer -= deltaTime;
  if (game.spawnTimer <= 0) {
    spawnEnemy();
    const spawnInterval = Math.max(0.42, 1.15 - game.elapsedSeconds * 0.006);
    game.spawnTimer = spawnInterval;
  }

  game.attackTimer -= deltaTime;
  if (game.attackTimer <= 0 && game.enemies.length > 0) {
    fireAtNearestEnemy();
    game.attackTimer = weapon.cooldown;
  }

  updateSpecialWeapons(deltaTime);

  for (let projectileIndex = game.projectiles.length - 1; projectileIndex >= 0; projectileIndex -= 1) {
    const projectile = game.projectiles[projectileIndex];
    projectile.x += projectile.velocityX * deltaTime;
    projectile.y += projectile.velocityY * deltaTime;
    projectile.remainingLife -= deltaTime;

    let hitEnemy = false;
    for (let enemyIndex = game.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = game.enemies[enemyIndex];
      const hitDistance = projectile.radius + enemy.radius;
      if (distanceSquared(projectile, enemy) > hitDistance * hitDistance) continue;

      enemy.health -= projectile.damage;
      enemy.hitFlash = 0.1;
      createBurst(projectile.x, projectile.y, COLORS.seed, 4);
      hitEnemy = true;

      if (enemy.health <= 0) {
        defeatEnemy(enemyIndex);
      }
      break;
    }

    if (hitEnemy || projectile.remainingLife <= 0) {
      game.projectiles.splice(projectileIndex, 1);
    }
  }

  for (const enemy of game.enemies) {
    const differenceX = player.x - enemy.x;
    const differenceY = player.y - enemy.y;
    const length = Math.hypot(differenceX, differenceY) || 1;
    enemy.x += (differenceX / length) * enemy.speed * deltaTime;
    enemy.y += (differenceY / length) * enemy.speed * deltaTime;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);

    const touchDistance = player.radius + enemy.radius;
    if (distanceSquared(player, enemy) <= touchDistance * touchDistance && player.invulnerableTimer <= 0) {
      player.health -= enemy.damage;
      playSound("hurt");
      player.invulnerableTimer = 0.7;
      enemy.x -= (differenceX / length) * 22;
      enemy.y -= (differenceY / length) * 22;
      createBurst(player.x, player.y, "#f28c62", 9);

      if (player.health <= 0) {
        endGame();
        return;
      }
    }
  }
}

function updateParticles(deltaTime) {
  for (let index = game.particles.length - 1; index >= 0; index -= 1) {
    const particle = game.particles[index];
    particle.x += particle.velocityX * deltaTime;
    particle.y += particle.velocityY * deltaTime;
    particle.velocityX *= 0.94;
    particle.velocityY *= 0.94;
    particle.remainingLife -= deltaTime;
    if (particle.remainingLife <= 0) game.particles.splice(index, 1);
  }
}

function endGame(won = false) {
  game.over = true;
  game.started = false;
  game.keys.clear();
  game.touchX = 0;
  game.touchY = 0;
  touchControls.hidden = true;
  saveBestRecord(game.elapsedSeconds);

  resultKicker.textContent = won ? "远征完成" : "训练结束";
  resultTitle.textContent = won ? "你守住了薯星！" : "探险员倒下了";
  gameOverSummary.textContent = won
    ? `你坚持了 ${formatTime(ROUND_DURATION_SECONDS)}，共击败 ${game.kills} 个敌人。`
    : `你坚持了 ${formatTime(game.elapsedSeconds)}，击败了 ${game.kills} 个敌人。`;
  restartButton.textContent = won ? "再次远征" : "再试一次";
  gameOverPanel.hidden = false;
  playSound(won ? "win" : "end");
}

function drawBackground() {
  context.fillStyle = COLORS.grass;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gridSize = 48;
  context.strokeStyle = COLORS.grid;
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 0; x <= canvas.width; x += gridSize) {
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
  }
  for (let y = 0; y <= canvas.height; y += gridSize) {
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  }
  context.stroke();

  context.fillStyle = COLORS.grassLight;
  context.beginPath();
  context.ellipse(130, 420, 115, 42, -0.2, 0, Math.PI * 2);
  context.ellipse(770, 150, 150, 55, 0.15, 0, Math.PI * 2);
  context.fill();
}

function drawEnemy(enemy) {
  const styles = {
    spore: { body: "#914e61", light: "#c46c7f", dark: "#552d3a" },
    runner: { body: "#d47a3f", light: "#f0b15e", dark: "#713b28" },
    bulwark: { body: "#62727d", light: "#9eabb1", dark: "#354047" },
  };
  const style = styles[enemy.type];

  context.save();
  context.translate(enemy.x, enemy.y);
  context.fillStyle = COLORS.shadow;
  context.beginPath();
  context.ellipse(0, enemy.radius * 0.8, enemy.radius * 1.05, enemy.radius * 0.38, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = enemy.hitFlash > 0 ? "#fff4d2" : style.body;
  context.strokeStyle = style.dark;
  context.lineWidth = 3;
  context.beginPath();
  if (enemy.type === "runner") {
    context.ellipse(0, 0, enemy.radius * 1.2, enemy.radius * 0.85, 0, 0, Math.PI * 2);
  } else if (enemy.type === "bulwark") {
    for (let point = 0; point < 9; point += 1) {
      const angle = (Math.PI * 2 * point) / 9;
      const rockRadius = enemy.radius * (point % 2 === 0 ? 1 : 0.88);
      const pointX = Math.cos(angle) * rockRadius;
      const pointY = Math.sin(angle) * rockRadius;
      if (point === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    }
    context.closePath();
  } else {
    context.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  }
  context.fill();
  context.stroke();

  context.fillStyle = style.light;
  context.beginPath();
  context.arc(-enemy.radius * 0.34, -enemy.radius * 0.38, enemy.radius * 0.28, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = style.dark;
  context.beginPath();
  context.arc(-enemy.radius * 0.32, -1, 2.4, 0, Math.PI * 2);
  context.arc(enemy.radius * 0.32, -1, 2.4, 0, Math.PI * 2);
  context.fill();

  if (enemy.health < enemy.maxHealth) {
    const barWidth = enemy.radius * 1.7;
    context.fillStyle = "rgba(20, 15, 18, 0.75)";
    context.fillRect(-barWidth / 2, -enemy.radius - 10, barWidth, 4);
    context.fillStyle = "#e07870";
    context.fillRect(-barWidth / 2, -enemy.radius - 10, barWidth * (enemy.health / enemy.maxHealth), 4);
  }
  context.restore();
}

function drawProjectile(projectile) {
  context.fillStyle = projectile.color;
  context.strokeStyle = "#8d632d";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
}

function drawOrbitLeaves() {
  for (let index = 0; index < weapon.orbitCount; index += 1) {
    const leaf = getOrbitLeafPosition(index);
    context.save();
    context.translate(leaf.x, leaf.y);
    context.rotate(leaf.angle + Math.PI / 2);
    context.fillStyle = "#8fbe5f";
    context.strokeStyle = "#385b37";
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(0, 0, 7, 13, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }
}

function drawGem(gem) {
  const pulse = 1 + Math.sin(gem.wobble) * 0.12;
  context.save();
  context.translate(gem.x, gem.y);
  context.scale(pulse, pulse);
  context.rotate(Math.PI / 4);
  context.fillStyle = "#64d7c4";
  context.strokeStyle = "#d4fff1";
  context.lineWidth = 2;
  context.fillRect(-gem.radius, -gem.radius, gem.radius * 2, gem.radius * 2);
  context.strokeRect(-gem.radius, -gem.radius, gem.radius * 2, gem.radius * 2);
  context.restore();
}

function drawPlayer() {
  context.save();
  context.translate(player.x, player.y);

  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 18) % 2 === 0) {
    context.globalAlpha = 0.45;
  }

  context.fillStyle = COLORS.shadow;
  context.beginPath();
  context.ellipse(0, 20, 23, 9, 0, 0, Math.PI * 2);
  context.fill();

  context.rotate(-0.08);
  context.fillStyle = COLORS.potato;
  context.strokeStyle = COLORS.potatoDark;
  context.lineWidth = 3;
  context.beginPath();
  context.ellipse(0, 0, 22, 27, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = COLORS.potatoLight;
  context.beginPath();
  context.ellipse(-7, -8, 6, 11, -0.25, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = COLORS.leaf;
  context.beginPath();
  context.ellipse(-4, -29, 7, 12, -0.6, 0, Math.PI * 2);
  context.ellipse(6, -28, 6, 10, 0.7, 0, Math.PI * 2);
  context.fill();

  const lookX = player.facingX * 2;
  const lookY = player.facingY * 1.5;
  context.fillStyle = "#231b15";
  context.beginPath();
  context.arc(-7 + lookX, -3 + lookY, 2.8, 0, Math.PI * 2);
  context.arc(7 + lookX, -3 + lookY, 2.8, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#4a2f22";
  context.lineWidth = 2;
  context.lineCap = "round";
  context.beginPath();
  context.arc(0, 3, 7, 0.2, Math.PI - 0.2);
  context.stroke();
  context.restore();
}

function drawParticles() {
  for (const particle of game.particles) {
    context.globalAlpha = Math.max(0, particle.remainingLife / particle.maxLife);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function render() {
  drawBackground();
  for (const gem of game.gems) drawGem(gem);
  for (const enemy of game.enemies) drawEnemy(enemy);
  for (const projectile of game.projectiles) drawProjectile(projectile);
  drawOrbitLeaves();
  drawPlayer();
  drawParticles();
}

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - game.lastFrameTime) / 1000, 0.05);
  game.lastFrameTime = currentTime;

  if (game.started && !game.paused && !game.over) {
    game.elapsedSeconds += deltaTime;
    if (TEST_DEFEAT_AFTER !== null && game.elapsedSeconds >= TEST_DEFEAT_AFTER) {
      player.health = 0;
      endGame(false);
    } else if (game.elapsedSeconds >= ROUND_DURATION_SECONDS) {
      game.elapsedSeconds = ROUND_DURATION_SECONDS;
      endGame(true);
    } else {
      updatePlayer(deltaTime);
      updateCombat(deltaTime);
      updateGems(deltaTime);
      updateParticles(deltaTime);
    }
    updateHud();
  }

  render();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (!game.started || game.over || game.choosingUpgrade) return;
  game.paused = !game.paused;
  pauseBadge.hidden = !game.paused;
}

function updateJoystick(pointerEvent) {
  const bounds = joystickBase.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const maximumDistance = bounds.width * 0.34;
  let offsetX = pointerEvent.clientX - centerX;
  let offsetY = pointerEvent.clientY - centerY;
  const distance = Math.hypot(offsetX, offsetY);

  if (distance > maximumDistance) {
    offsetX = (offsetX / distance) * maximumDistance;
    offsetY = (offsetY / distance) * maximumDistance;
  }

  game.touchX = offsetX / maximumDistance;
  game.touchY = offsetY / maximumDistance;
  joystickKnob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
}

function releaseJoystick(pointerEvent) {
  if (pointerEvent.pointerId !== game.activePointerId) return;
  game.activePointerId = null;
  game.touchX = 0;
  game.touchY = 0;
  joystickKnob.style.transform = "translate(-50%, -50%)";
}

joystickBase.addEventListener("pointerdown", (event) => {
  ensureAudio();
  game.activePointerId = event.pointerId;
  joystickBase.setPointerCapture(event.pointerId);
  updateJoystick(event);
});

joystickBase.addEventListener("pointermove", (event) => {
  if (event.pointerId === game.activePointerId) updateJoystick(event);
});

joystickBase.addEventListener("pointerup", releaseJoystick);
joystickBase.addEventListener("pointercancel", releaseJoystick);

startButton.addEventListener("click", () => {
  ensureAudio();
  resetGame();
});

restartButton.addEventListener("click", () => {
  ensureAudio();
  resetGame();
});

soundToggle.addEventListener("click", () => {
  audio.enabled = !audio.enabled;
  soundToggle.setAttribute("aria-pressed", String(audio.enabled));
  soundToggle.textContent = audio.enabled ? "音效：开" : "音效：关";
  if (audio.enabled) {
    ensureAudio();
    playSound("pickup");
  }
});

window.addEventListener("keydown", (event) => {
  const gameKeys = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
  if (gameKeys.includes(event.code)) event.preventDefault();

  if (event.code === "Space" && !event.repeat) {
    togglePause();
    return;
  }
  game.keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  game.keys.delete(event.code);
});

window.addEventListener("blur", () => {
  game.keys.clear();
  game.touchX = 0;
  game.touchY = 0;
  joystickKnob.style.transform = "translate(-50%, -50%)";
  if (game.started && !game.over) {
    game.paused = true;
    pauseBadge.hidden = false;
  }
});

bestRecordText.textContent = `最高纪录：${formatTime(getBestRecord())}`;
updateHud();
render();
requestAnimationFrame((time) => {
  game.lastFrameTime = time;
  requestAnimationFrame(gameLoop);
});
