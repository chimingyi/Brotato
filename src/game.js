import {
  BASE_STATS,
  CHARACTERS,
  ENEMY_ARCHETYPES,
  ITEMS,
  LEVEL_UPGRADES,
  MAX_WAVES,
  MAX_WEAPON_SLOTS,
  RARITIES,
  STAT_LABELS,
  WEAPON_TAG_BONUSES,
  WEAPONS,
  getWaveDefinition,
} from "./data.js";

const $ = (selector) => document.querySelector(selector);
const canvas = $("#game-canvas");
const context = canvas.getContext("2d");

const ui = {
  battleHud: $("#battle-hud"),
  healthFill: $("#health-fill"),
  healthText: $("#health-text"),
  waveText: $("#wave-text"),
  timer: $("#timer"),
  materialText: $("#material-text"),
  levelText: $("#level-text"),
  weaponBar: $("#weapon-bar"),
  loadoutPanel: $("#loadout-panel"),
  loadoutTitle: $("#loadout-title"),
  loadoutCopy: $("#loadout-copy"),
  characterOptions: $("#character-options"),
  weaponOptions: $("#weapon-options"),
  selectionBack: $("#selection-back"),
  upgradePanel: $("#upgrade-panel"),
  upgradeOptions: $("#upgrade-options"),
  upgradeRemaining: $("#upgrade-remaining"),
  shopPanel: $("#shop-panel"),
  shopTitle: $("#shop-title"),
  waveSummary: $("#wave-summary"),
  shopMaterials: $("#shop-materials"),
  shopOffers: $("#shop-offers"),
  rerollButton: $("#reroll-button"),
  statsList: $("#stats-list"),
  weaponCount: $("#weapon-count"),
  shopInventory: $("#shop-inventory"),
  tagBonuses: $("#tag-bonuses"),
  nextWaveButton: $("#next-wave-button"),
  pauseBadge: $("#pause-badge"),
  gameOverPanel: $("#game-over-panel"),
  resultKicker: $("#result-kicker"),
  resultTitle: $("#result-title"),
  gameOverSummary: $("#game-over-summary"),
  resultStats: $("#result-stats"),
  restartButton: $("#restart-button"),
  soundToggle: $("#sound-toggle"),
  touchControls: $("#touch-controls"),
  joystickBase: $("#joystick-base"),
  joystickKnob: $("#joystick-knob"),
  experienceWrap: $("#experience-wrap"),
  experienceText: $("#experience-text"),
  experienceFill: $("#experience-fill"),
};

const parameters = new URLSearchParams(window.location.search);
const localTestMode = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
  && parameters.get("test") === "1";
const requestedWaveDuration = Number.parseFloat(parameters.get("waveDuration") || "");
const requestedStartMaterials = Number.parseInt(parameters.get("startMaterials") || "", 10);
const requestedStartExperience = Number.parseInt(parameters.get("startExperience") || "", 10);
const requestedShopRarity = Number.parseInt(parameters.get("shopRarity") || "", 10);
const requestedShopWeapon = parameters.get("shopWeapon") || "";
const requestedShopRaritySequence = (parameters.get("shopRarities") || "")
  .split(",")
  .map((value) => Number.parseInt(value, 10))
  .filter((value) => Number.isFinite(value));
const forceWeaponShop = localTestMode
  && (parameters.get("shopWeapons") === "1" || Boolean(WEAPONS[requestedShopWeapon]));

const game = {
  phase: "loadout",
  paused: false,
  selectedCharacter: null,
  wave: 1,
  waveDefinition: null,
  waveTime: 0,
  totalTime: 0,
  materials: 0,
  waveStartMaterials: 0,
  waveCollected: 0,
  waveKills: 0,
  totalKills: 0,
  level: 1,
  experience: 0,
  experienceToNext: 8,
  pendingUpgrades: 0,
  rerollCost: 1,
  shopOffers: [],
  inventory: [],
  items: [],
  stats: { ...BASE_STATS },
  spawnTimer: 0,
  enemies: [],
  projectiles: [],
  meleeEffects: [],
  gems: [],
  particles: [],
  keys: new Set(),
  touchX: 0,
  touchY: 0,
  activePointerId: null,
  lastFrameTime: 0,
  nextUid: 1,
  testShopOfferIndex: 0,
};

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 23,
  health: 100,
  facingX: 1,
  facingY: 0,
  invulnerableTimer: 0,
  regenAccumulator: 0,
};

const audio = { context: null, enabled: true };

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function distanceSquared(first, second) {
  const x = first.x - second.x;
  const y = first.y - second.y;
  return x * x + y * y;
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
    shoot: [290, 210, 0.045, 0.012, "square"],
    hit: [180, 100, 0.055, 0.02, "triangle"],
    pickup: [590, 850, 0.075, 0.025, "sine"],
    buy: [430, 720, 0.1, 0.035, "sine"],
    level: [470, 930, 0.18, 0.045, "triangle"],
    hurt: [150, 70, 0.14, 0.055, "sawtooth"],
    wave: [340, 680, 0.25, 0.05, "triangle"],
    fail: [230, 90, 0.4, 0.06, "triangle"],
  };
  const sound = sounds[name];
  if (!sound) return;
  const now = audio.context.currentTime;
  const oscillator = audio.context.createOscillator();
  const gain = audio.context.createGain();
  oscillator.type = sound[4];
  oscillator.frequency.setValueAtTime(sound[0], now);
  oscillator.frequency.exponentialRampToValueAtTime(sound[1], now + sound[2]);
  gain.gain.setValueAtTime(sound[3], now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + sound[2]);
  oscillator.connect(gain);
  gain.connect(audio.context.destination);
  oscillator.start(now);
  oscillator.stop(now + sound[2]);
}

function applyModifiers(modifiers, healForMaxHealth = true) {
  const oldMaxHealth = game.stats.maxHealth;
  for (const [stat, amount] of Object.entries(modifiers)) {
    game.stats[stat] = (game.stats[stat] ?? 0) + amount;
  }
  if (healForMaxHealth && game.stats.maxHealth > oldMaxHealth) {
    player.health += game.stats.maxHealth - oldMaxHealth;
  }
  player.health = Math.min(player.health, game.stats.maxHealth);
}

function getWeaponTagState() {
  const counts = {};
  for (const instance of game.inventory) {
    for (const tag of WEAPONS[instance.id].tags) counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return Object.entries(WEAPON_TAG_BONUSES).map(([tag, definition]) => {
    const count = counts[tag] ?? 0;
    let bonus = 0;
    let activeCount = 0;
    for (const [required, amount] of definition.tiers) {
      if (count < required) break;
      activeCount = required;
      bonus = amount;
    }
    return { tag, count, bonus, activeCount, ...definition };
  });
}

function getEffectiveStat(stat) {
  let value = game.stats[stat] ?? 0;
  for (const tagState of getWeaponTagState()) {
    if (tagState.stat === stat) value += tagState.bonus;
  }
  return value;
}

function createWeapon(id, rarity = 1) {
  return { uid: game.nextUid++, id, rarity, cooldown: 0 };
}

function getWeaponDamage(instance) {
  const definition = WEAPONS[instance.id];
  let damage = definition.baseDamage * RARITIES[instance.rarity - 1].multiplier;
  for (const [stat, scaling] of Object.entries(definition.scaling)) {
    damage += getEffectiveStat(stat) * scaling;
  }
  return Math.max(1, damage * (1 + getEffectiveStat("damage") / 100));
}

function getWeaponCooldown(instance) {
  return WEAPONS[instance.id].cooldown / Math.max(0.2, 1 + getEffectiveStat("attackSpeed") / 100);
}

function getMovementSpeed() {
  return 235 * Math.max(0.4, 1 + getEffectiveStat("speed") / 100);
}

function getDamageAfterArmor(rawDamage) {
  const armor = getEffectiveStat("armor");
  const reduction = armor >= 0 ? armor / (armor + 18) : armor / (18 - armor);
  return Math.max(1, rawDamage * (1 - reduction));
}

function renderCharacterChoices() {
  ui.characterOptions.replaceChildren();
  for (const character of CHARACTERS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.dataset.characterId = character.id;
    button.innerHTML = `
      <span class="choice-icon">${character.icon}</span>
      <span class="choice-name">${character.name}</span>
      <span class="choice-tagline">${character.tagline}</span>
      <span class="choice-rules">${character.rules.join("<br>")}</span>
    `;
    button.addEventListener("click", () => selectCharacter(character.id));
    ui.characterOptions.append(button);
  }
}

function selectCharacter(characterId) {
  game.selectedCharacter = CHARACTERS.find((character) => character.id === characterId);
  ui.characterOptions.hidden = true;
  ui.weaponOptions.hidden = false;
  ui.selectionBack.hidden = false;
  ui.loadoutTitle.textContent = `为${game.selectedCharacter.name}选择武器`;
  ui.loadoutCopy.textContent = "武器决定前几波的战斗方式，之后还能在商店购买并合成。";
  ui.weaponOptions.replaceChildren();

  for (const weaponId of game.selectedCharacter.allowedWeapons) {
    const weapon = WEAPONS[weaponId];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.dataset.weaponId = weapon.id;
    button.innerHTML = `
      <span class="choice-icon">${weapon.icon}</span>
      <span class="choice-name">${weapon.name}</span>
      <span class="choice-tagline">${weapon.description}</span>
      <span class="choice-rules">${weapon.type === "melee" ? "近战" : "远程"} · ${weapon.tags.join(" / ")}<br>基础伤害 ${weapon.baseDamage}</span>
    `;
    button.addEventListener("click", () => beginRun(weapon.id));
    ui.weaponOptions.append(button);
  }
}

function showCharacterSelection() {
  game.phase = "loadout";
  game.selectedCharacter = null;
  game.paused = false;
  ui.loadoutPanel.hidden = false;
  ui.characterOptions.hidden = false;
  ui.weaponOptions.hidden = true;
  ui.selectionBack.hidden = true;
  ui.loadoutTitle.textContent = "选择探险员";
  ui.loadoutCopy.textContent = "每位探险员都有不同优势。第一次建议选择“嫩芽先锋”。";
  ui.upgradePanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.gameOverPanel.hidden = true;
  ui.battleHud.hidden = true;
  ui.weaponBar.hidden = true;
  ui.experienceWrap.hidden = true;
  ui.touchControls.hidden = true;
  renderCharacterChoices();
  render();
}

function beginRun(startingWeaponId) {
  ensureAudio();
  game.wave = 1;
  game.totalTime = 0;
  game.materials = localTestMode && Number.isFinite(requestedStartMaterials)
    ? clamp(requestedStartMaterials, 0, 9999)
    : 0;
  game.waveCollected = 0;
  game.waveKills = 0;
  game.totalKills = 0;
  game.level = 1;
  game.experience = 0;
  game.experienceToNext = 8;
  game.pendingUpgrades = 0;
  if (localTestMode && Number.isFinite(requestedStartExperience)) {
    gainExperience(clamp(requestedStartExperience, 0, 9999));
  }
  game.rerollCost = 1;
  game.shopOffers = [];
  game.testShopOfferIndex = 0;
  game.inventory = [createWeapon(startingWeaponId)];
  game.items = [];
  game.stats = { ...BASE_STATS };
  applyModifiers(game.selectedCharacter.modifiers, false);
  player.health = game.stats.maxHealth;
  startWave();
}

function getCurrentWaveDuration() {
  if (localTestMode && Number.isFinite(requestedWaveDuration)) {
    return clamp(requestedWaveDuration, 2, 120);
  }
  return game.waveDefinition.duration;
}

function startWave() {
  game.phase = "wave";
  game.paused = false;
  game.waveDefinition = getWaveDefinition(game.wave);
  game.waveTime = getCurrentWaveDuration();
  game.waveStartMaterials = game.materials;
  game.waveCollected = 0;
  game.waveKills = 0;
  game.spawnTimer = 0.2;
  game.enemies = [];
  game.projectiles = [];
  game.meleeEffects = [];
  game.gems = [];
  game.particles = [];
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.health = game.stats.maxHealth;
  player.invulnerableTimer = 0;
  player.regenAccumulator = 0;
  for (const weapon of game.inventory) weapon.cooldown = Math.random() * 0.2;

  ui.loadoutPanel.hidden = true;
  ui.upgradePanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.gameOverPanel.hidden = true;
  ui.pauseBadge.hidden = true;
  ui.battleHud.hidden = false;
  ui.weaponBar.hidden = false;
  ui.experienceWrap.hidden = false;
  ui.touchControls.hidden = false;
  updateHud();
  playSound("wave");
}

function spawnEnemy() {
  const definition = game.waveDefinition;
  const type = randomItem(definition.types);
  const base = ENEMY_ARCHETYPES[type];
  const margin = 34;
  const side = Math.floor(Math.random() * 4);
  let x;
  let y;
  if (side === 0) { x = Math.random() * canvas.width; y = -margin; }
  else if (side === 1) { x = canvas.width + margin; y = Math.random() * canvas.height; }
  else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + margin; }
  else { x = -margin; y = Math.random() * canvas.height; }
  game.enemies.push({
    type,
    x,
    y,
    radius: base.radius,
    maxHealth: base.health * definition.healthMultiplier,
    health: base.health * definition.healthMultiplier,
    speed: base.speed * definition.speedMultiplier,
    damage: base.damage * definition.damageMultiplier,
    material: base.material,
    hitFlash: 0,
  });
}

function findNearestEnemy(maxRange = Number.POSITIVE_INFINITY) {
  let nearest = null;
  let nearestDistance = maxRange * maxRange;
  for (const enemy of game.enemies) {
    const currentDistance = distanceSquared(player, enemy);
    if (currentDistance < nearestDistance) {
      nearest = enemy;
      nearestDistance = currentDistance;
    }
  }
  return nearest;
}

function fireWeapon(instance) {
  const definition = WEAPONS[instance.id];
  const range = Math.max(45, definition.range + getEffectiveStat("range"));
  const target = findNearestEnemy(range);
  if (!target) return false;
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const length = Math.hypot(dx, dy) || 1;
  const directionX = dx / length;
  const directionY = dy / length;
  player.facingX = directionX;
  player.facingY = directionY;

  if (definition.type === "melee") {
    const damage = getWeaponDamage(instance);
    game.meleeEffects.push({
      x: player.x,
      y: player.y,
      angle: Math.atan2(directionY, directionX),
      radius: range,
      remainingLife: 0.16,
      color: RARITIES[instance.rarity - 1].color,
    });
    for (let index = game.enemies.length - 1; index >= 0; index -= 1) {
      const enemy = game.enemies[index];
      if (distanceSquared(player, enemy) <= (range + enemy.radius) ** 2) {
        damageEnemy(index, damage, definition.knockback, directionX, directionY);
      }
    }
  } else {
    game.projectiles.push({
      x: player.x + directionX * player.radius,
      y: player.y + directionY * player.radius,
      velocityX: directionX * definition.projectileSpeed,
      velocityY: directionY * definition.projectileSpeed,
      radius: definition.projectileSize ?? 5,
      damage: getWeaponDamage(instance),
      knockback: definition.knockback,
      color: definition.projectileColor ?? RARITIES[instance.rarity - 1].color,
      remainingLife: range / definition.projectileSpeed + 0.25,
      remainingPierce: definition.pierce ?? 0,
      hitIds: new Set(),
    });
  }
  playSound("shoot");
  return true;
}

function damageEnemy(index, baseDamage, knockback, directionX, directionY) {
  const enemy = game.enemies[index];
  if (!enemy) return;
  const critical = Math.random() * 100 < getEffectiveStat("critChance");
  const damage = baseDamage * (critical ? 1.8 : 1);
  enemy.health -= damage;
  enemy.hitFlash = 0.08;
  enemy.x += directionX * (knockback + getEffectiveStat("knockback"));
  enemy.y += directionY * (knockback + getEffectiveStat("knockback"));
  createBurst(enemy.x, enemy.y, critical ? "#ffe48c" : "#dfb36a", critical ? 7 : 3);
  if (getEffectiveStat("lifeSteal") > 0 && Math.random() * 100 < getEffectiveStat("lifeSteal")) {
    player.health = Math.min(getEffectiveStat("maxHealth"), player.health + 1);
  }
  if (enemy.health <= 0) defeatEnemy(index);
}

function defeatEnemy(index) {
  const enemy = game.enemies[index];
  if (!enemy) return;
  createBurst(enemy.x, enemy.y, ENEMY_ARCHETYPES[enemy.type].light, 9);
  for (let amount = 0; amount < enemy.material; amount += 1) {
    game.gems.push({
      x: enemy.x + (Math.random() - 0.5) * 12,
      y: enemy.y + (Math.random() - 0.5) * 12,
      radius: 6,
      value: 1,
      phase: Math.random() * Math.PI * 2,
    });
  }
  game.enemies.splice(index, 1);
  game.waveKills += 1;
  game.totalKills += 1;
}

function collectGem(gem) {
  game.materials += gem.value;
  game.waveCollected += gem.value;
  gainExperience(gem.value);
  playSound("pickup");
}

function gainExperience(amount) {
  game.experience += amount;
  while (game.experience >= game.experienceToNext) {
    game.experience -= game.experienceToNext;
    game.level += 1;
    game.pendingUpgrades += 1;
    game.experienceToNext = Math.round(7 + game.level * 3.5);
  }
}

function updatePlayer(deltaTime) {
  let directionX = game.touchX;
  let directionY = game.touchY;
  if (game.keys.has("KeyA") || game.keys.has("ArrowLeft")) directionX -= 1;
  if (game.keys.has("KeyD") || game.keys.has("ArrowRight")) directionX += 1;
  if (game.keys.has("KeyW") || game.keys.has("ArrowUp")) directionY -= 1;
  if (game.keys.has("KeyS") || game.keys.has("ArrowDown")) directionY += 1;
  const length = Math.hypot(directionX, directionY);
  if (length > 0) {
    directionX /= length;
    directionY /= length;
    player.facingX = directionX;
    player.facingY = directionY;
  }
  const movementSpeed = getMovementSpeed();
  player.x = clamp(player.x + directionX * movementSpeed * deltaTime, player.radius, canvas.width - player.radius);
  player.y = clamp(player.y + directionY * movementSpeed * deltaTime, player.radius + 58, canvas.height - player.radius);
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - deltaTime);

  if (getEffectiveStat("healthRegen") > 0 && player.health < getEffectiveStat("maxHealth")) {
    player.regenAccumulator += deltaTime * getEffectiveStat("healthRegen") / 5;
    if (player.regenAccumulator >= 1) {
      const healing = Math.floor(player.regenAccumulator);
      player.health = Math.min(getEffectiveStat("maxHealth"), player.health + healing);
      player.regenAccumulator -= healing;
    }
  }
}

function updateWeapons(deltaTime) {
  for (const instance of game.inventory) {
    instance.cooldown -= deltaTime;
    if (instance.cooldown <= 0 && fireWeapon(instance)) {
      instance.cooldown = getWeaponCooldown(instance);
    }
  }
}

function updateProjectiles(deltaTime) {
  for (let projectileIndex = game.projectiles.length - 1; projectileIndex >= 0; projectileIndex -= 1) {
    const projectile = game.projectiles[projectileIndex];
    projectile.x += projectile.velocityX * deltaTime;
    projectile.y += projectile.velocityY * deltaTime;
    projectile.remainingLife -= deltaTime;
    let shouldRemove = projectile.remainingLife <= 0;

    for (let enemyIndex = game.enemies.length - 1; enemyIndex >= 0 && !shouldRemove; enemyIndex -= 1) {
      const enemy = game.enemies[enemyIndex];
      if (projectile.hitIds.has(enemy)) continue;
      const hitDistance = projectile.radius + enemy.radius;
      if (distanceSquared(projectile, enemy) > hitDistance * hitDistance) continue;
      projectile.hitIds.add(enemy);
      const speed = Math.hypot(projectile.velocityX, projectile.velocityY) || 1;
      damageEnemy(enemyIndex, projectile.damage, projectile.knockback, projectile.velocityX / speed, projectile.velocityY / speed);
      if (projectile.remainingPierce > 0) projectile.remainingPierce -= 1;
      else shouldRemove = true;
    }

    if (shouldRemove) game.projectiles.splice(projectileIndex, 1);
  }
}

function updateEnemies(deltaTime) {
  for (const enemy of game.enemies) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const length = Math.hypot(dx, dy) || 1;
    enemy.x += dx / length * enemy.speed * deltaTime;
    enemy.y += dy / length * enemy.speed * deltaTime;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
    const touchDistance = player.radius + enemy.radius;
    if (distanceSquared(player, enemy) <= touchDistance * touchDistance && player.invulnerableTimer <= 0) {
      if (Math.random() * 100 >= clamp(getEffectiveStat("dodge"), 0, 60)) {
        player.health -= getDamageAfterArmor(enemy.damage);
        playSound("hurt");
      } else {
        createBurst(player.x, player.y, "#c6f4d0", 6);
      }
      player.invulnerableTimer = 0.65;
      enemy.x -= dx / length * 18;
      enemy.y -= dy / length * 18;
      if (player.health <= 0) finishRun(false);
    }
  }
}

function updateGems(deltaTime) {
  for (let index = game.gems.length - 1; index >= 0; index -= 1) {
    const gem = game.gems[index];
    gem.phase += deltaTime * 5;
    const dx = player.x - gem.x;
    const dy = player.y - gem.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < getEffectiveStat("pickupRange")) {
      gem.x += dx / distance * 410 * deltaTime;
      gem.y += dy / distance * 410 * deltaTime;
    }
    if (distance <= player.radius + gem.radius + 3) {
      collectGem(gem);
      game.gems.splice(index, 1);
    }
  }
}

function createBurst(x, y, color, amount) {
  for (let index = 0; index < amount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 85;
    game.particles.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 2.5,
      color,
      life: 0.35 + Math.random() * 0.25,
      maxLife: 0.6,
    });
  }
}

function updateEffects(deltaTime) {
  for (let index = game.particles.length - 1; index >= 0; index -= 1) {
    const particle = game.particles[index];
    particle.x += particle.velocityX * deltaTime;
    particle.y += particle.velocityY * deltaTime;
    particle.velocityX *= 0.94;
    particle.velocityY *= 0.94;
    particle.life -= deltaTime;
    if (particle.life <= 0) game.particles.splice(index, 1);
  }
  for (let index = game.meleeEffects.length - 1; index >= 0; index -= 1) {
    game.meleeEffects[index].remainingLife -= deltaTime;
    if (game.meleeEffects[index].remainingLife <= 0) game.meleeEffects.splice(index, 1);
  }
}

function updateWave(deltaTime) {
  game.waveTime -= deltaTime;
  game.totalTime += deltaTime;
  if (game.waveTime <= 0) {
    endWave();
    return;
  }
  game.spawnTimer -= deltaTime;
  if (game.spawnTimer <= 0) {
    spawnEnemy();
    game.spawnTimer = game.waveDefinition.spawnInterval;
  }
  updatePlayer(deltaTime);
  updateWeapons(deltaTime);
  updateProjectiles(deltaTime);
  updateEnemies(deltaTime);
  updateGems(deltaTime);
  updateEffects(deltaTime);
  updateHud();
}

function endWave() {
  if (game.phase !== "wave") return;
  for (const gem of game.gems) collectGem(gem);
  game.gems = [];
  const harvestingIncome = Math.max(0, Math.floor(getEffectiveStat("harvesting")));
  game.materials += harvestingIncome;
  game.stats.harvesting = Math.floor(game.stats.harvesting * 1.05);
  game.phase = "transition";
  game.keys.clear();
  game.touchX = 0;
  game.touchY = 0;
  ui.battleHud.hidden = true;
  ui.weaponBar.hidden = true;
  ui.experienceWrap.hidden = true;
  ui.touchControls.hidden = true;
  ui.waveSummary.textContent = `击败 ${game.waveKills} 个敌人 · 收集 ${game.waveCollected} 材料 · 收获 +${harvestingIncome}`;
  playSound("wave");

  if (game.wave >= MAX_WAVES) {
    finishRun(true);
  } else if (game.pendingUpgrades > 0) {
    openUpgradePanel();
  } else {
    openShop();
  }
}

function getUpgradeChoices() {
  return shuffle(LEVEL_UPGRADES).slice(0, 4);
}

function openUpgradePanel() {
  game.phase = "upgrade";
  ui.upgradePanel.hidden = false;
  ui.shopPanel.hidden = true;
  ui.upgradeRemaining.textContent = `还有 ${game.pendingUpgrades} 次升级选择`;
  ui.upgradeOptions.replaceChildren();
  for (const upgrade of getUpgradeChoices()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.innerHTML = `
      <span class="choice-icon">${upgrade.icon}</span>
      <span class="choice-name">${upgrade.name}</span>
      <span class="choice-tagline">${upgrade.description}</span>
    `;
    button.addEventListener("click", () => chooseUpgrade(upgrade));
    ui.upgradeOptions.append(button);
  }
}

function chooseUpgrade(upgrade) {
  applyModifiers(upgrade.modifiers);
  game.pendingUpgrades -= 1;
  playSound("level");
  if (game.pendingUpgrades > 0) openUpgradePanel();
  else {
    ui.upgradePanel.hidden = true;
    openShop();
  }
}

function rollRarity() {
  const progress = game.wave / MAX_WAVES;
  const luckyBonus = Math.max(0, game.stats.luck) * 0.0015;
  const roll = Math.random();
  if (roll < 0.02 + progress * 0.07 + luckyBonus * 0.4) return 4;
  if (roll < 0.12 + progress * 0.18 + luckyBonus) return 3;
  if (roll < 0.38 + progress * 0.2 + luckyBonus * 1.5) return 2;
  return 1;
}

function createShopOffer() {
  const offersWeapon = forceWeaponShop || Math.random() < 0.48;
  if (offersWeapon) {
    const weapon = localTestMode && WEAPONS[requestedShopWeapon]
      ? WEAPONS[requestedShopWeapon]
      : randomItem(Object.values(WEAPONS));
    const sequenceRarity = requestedShopRaritySequence[game.testShopOfferIndex];
    game.testShopOfferIndex += 1;
    const rarity = localTestMode && Number.isFinite(sequenceRarity)
      ? clamp(sequenceRarity, 1, 4)
      : localTestMode && Number.isFinite(requestedShopRarity)
        ? clamp(requestedShopRarity, 1, 4)
        : rollRarity();
    return {
      uid: game.nextUid++,
      type: "weapon",
      definitionId: weapon.id,
      rarity,
      price: Math.round(weapon.price * RARITIES[rarity - 1].multiplier * (1 + game.wave * 0.025)),
      locked: false,
      sold: false,
    };
  }
  const item = randomItem(ITEMS);
  return {
    uid: game.nextUid++,
    type: "item",
    definitionId: item.id,
    rarity: 1,
    price: Math.round(item.price * (1 + game.wave * 0.025)),
    locked: false,
    sold: false,
  };
}

function refreshShopOffers(preserveLocked = true) {
  const nextOffers = [];
  for (let index = 0; index < 4; index += 1) {
    const existing = game.shopOffers[index];
    nextOffers.push(preserveLocked && existing?.locked && !existing.sold ? existing : createShopOffer());
  }
  game.shopOffers = nextOffers;
  renderShop();
}

function openShop() {
  game.phase = "shop";
  game.rerollCost = Math.max(1, Math.floor(1 + game.wave * 0.35));
  ui.upgradePanel.hidden = true;
  ui.shopPanel.hidden = false;
  ui.shopTitle.textContent = `第 ${game.wave} 波完成`;
  ui.nextWaveButton.textContent = `开始第 ${game.wave + 1} 波`;
  refreshShopOffers(true);
}

function getOfferDefinition(offer) {
  return offer.type === "weapon"
    ? WEAPONS[offer.definitionId]
    : ITEMS.find((item) => item.id === offer.definitionId);
}

function canAddWeapon(offer) {
  const sameRarity = game.inventory.find((weapon) => weapon.id === offer.definitionId && weapon.rarity === offer.rarity && weapon.rarity < 4);
  return Boolean(sameRarity) || game.inventory.length < MAX_WEAPON_SLOTS;
}

function addWeaponWithAutoCombine(definitionId, rarity) {
  let resultRarity = rarity;
  while (resultRarity < 4) {
    const matchIndex = game.inventory.findIndex((weapon) => weapon.id === definitionId && weapon.rarity === resultRarity);
    if (matchIndex < 0) break;
    game.inventory.splice(matchIndex, 1);
    resultRarity += 1;
  }
  game.inventory.push(createWeapon(definitionId, resultRarity));
}

function buyOffer(offerIndex) {
  const offer = game.shopOffers[offerIndex];
  if (!offer || offer.sold || game.materials < offer.price) return;
  if (offer.type === "weapon" && !canAddWeapon(offer)) return;
  game.materials -= offer.price;

  if (offer.type === "weapon") {
    addWeaponWithAutoCombine(offer.definitionId, offer.rarity);
  } else {
    const item = getOfferDefinition(offer);
    game.items.push(item.id);
    applyModifiers(item.modifiers);
  }
  offer.sold = true;
  offer.locked = false;
  playSound("buy");
  renderShop();
}

function toggleOfferLock(offerIndex) {
  const offer = game.shopOffers[offerIndex];
  if (!offer || offer.sold) return;
  offer.locked = !offer.locked;
  renderShop();
}

function rerollShop() {
  if (game.materials < game.rerollCost) return;
  game.materials -= game.rerollCost;
  game.rerollCost += 1;
  refreshShopOffers(true);
}

function sellWeapon(uid) {
  const index = game.inventory.findIndex((weapon) => weapon.uid === uid);
  if (index < 0 || game.inventory.length <= 1) return;
  const instance = game.inventory[index];
  const definition = WEAPONS[instance.id];
  const refund = Math.max(1, Math.floor(definition.price * RARITIES[instance.rarity - 1].multiplier * 0.45));
  game.materials += refund;
  game.inventory.splice(index, 1);
  renderShop();
}

function renderShop() {
  ui.shopMaterials.textContent = String(game.materials);
  ui.materialText.textContent = String(game.materials);
  ui.rerollButton.textContent = `刷新 · ${game.rerollCost}`;
  ui.rerollButton.disabled = game.materials < game.rerollCost;
  ui.shopOffers.replaceChildren();

  game.shopOffers.forEach((offer, index) => {
    const definition = getOfferDefinition(offer);
    const card = document.createElement("article");
    const rarity = RARITIES[offer.rarity - 1];
    card.className = `shop-card${offer.locked ? " is-locked" : ""}`;
    card.style.setProperty("--rarity", rarity.color);
    if (offer.sold) {
      card.innerHTML = `<span class="choice-icon">✓</span><span class="choice-name">已购买</span>`;
    } else {
      const canBuy = game.materials >= offer.price && (offer.type !== "weapon" || canAddWeapon(offer));
      card.innerHTML = `
        <span class="shop-card__type">${offer.type === "weapon" ? `${rarity.name}武器` : "道具"}</span>
        <span class="choice-icon">${definition.icon}</span>
        <span class="choice-name">${definition.name}</span>
        <span class="choice-tagline">${definition.description}</span>
        <span class="shop-card__price">◆ ${offer.price}</span>
        <div class="shop-actions">
          <button class="buy-button" type="button" ${canBuy ? "" : "disabled"}>购买</button>
          <button class="lock-button" type="button" title="锁定">${offer.locked ? "🔒" : "🔓"}</button>
        </div>
      `;
      card.querySelector(".buy-button").addEventListener("click", () => buyOffer(index));
      card.querySelector(".lock-button").addEventListener("click", () => toggleOfferLock(index));
    }
    ui.shopOffers.append(card);
  });

  renderInventory(ui.shopInventory, true);
  renderTagBonuses();
  renderStats();
}

function renderTagBonuses() {
  ui.tagBonuses.replaceChildren();
  const ownedTags = getWeaponTagState().filter((tagState) => tagState.count > 0);
  for (const tagState of ownedTags) {
    const badge = document.createElement("span");
    badge.className = `tag-bonus${tagState.bonus > 0 ? " is-active" : ""}`;
    const nextTier = tagState.tiers.find(([required]) => required > tagState.count);
    badge.textContent = tagState.bonus > 0
      ? `${tagState.icon} ${tagState.tag} ${tagState.count}：+${tagState.bonus} ${STAT_LABELS[tagState.stat]}`
      : `${tagState.icon} ${tagState.tag} ${tagState.count}${nextTier ? ` / ${nextTier[0]}` : ""}`;
    ui.tagBonuses.append(badge);
  }
}

function renderInventory(container, allowSell) {
  container.replaceChildren();
  for (let index = 0; index < MAX_WEAPON_SLOTS; index += 1) {
    const instance = game.inventory[index];
    const card = document.createElement("div");
    if (!instance) {
      card.className = "inventory-card is-empty";
      card.textContent = "空武器槽";
    } else {
      const definition = WEAPONS[instance.id];
      const rarity = RARITIES[instance.rarity - 1];
      card.className = "inventory-card";
      card.style.setProperty("--rarity", rarity.color);
      card.innerHTML = `<strong>${definition.icon} ${definition.name}</strong><span>${rarity.name} · 伤害 ${Math.round(getWeaponDamage(instance))}</span>`;
      if (allowSell && game.inventory.length > 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sell-button";
        button.textContent = "出售";
        button.addEventListener("click", () => sellWeapon(instance.uid));
        card.append(button);
      }
    }
    container.append(card);
  }
  ui.weaponCount.textContent = `${game.inventory.length} / ${MAX_WEAPON_SLOTS}`;
}

function renderStats() {
  ui.statsList.replaceChildren();
  const importantStats = ["maxHealth", "damage", "meleeDamage", "rangedDamage", "elementalDamage", "attackSpeed", "critChance", "armor", "dodge", "speed", "luck", "harvesting"];
  for (const stat of importantStats) {
    const term = document.createElement("dt");
    term.textContent = STAT_LABELS[stat];
    const value = document.createElement("dd");
    const effectiveValue = getEffectiveStat(stat);
    value.textContent = stat === "maxHealth" ? Math.round(effectiveValue) : `${effectiveValue >= 0 ? "+" : ""}${Math.round(effectiveValue)}`;
    ui.statsList.append(term, value);
  }
}

function renderWeaponBar() {
  ui.weaponBar.replaceChildren();
  for (let index = 0; index < MAX_WEAPON_SLOTS; index += 1) {
    const instance = game.inventory[index];
    const slot = document.createElement("div");
    slot.className = "mini-weapon";
    if (instance) {
      slot.textContent = WEAPONS[instance.id].icon;
      slot.style.setProperty("--rarity", RARITIES[instance.rarity - 1].color);
      slot.title = `${WEAPONS[instance.id].name} · ${RARITIES[instance.rarity - 1].name}`;
    } else {
      slot.textContent = "·";
      slot.style.opacity = ".42";
    }
    ui.weaponBar.append(slot);
  }
}

function updateHud() {
  const healthPercent = clamp(player.health / getEffectiveStat("maxHealth"), 0, 1) * 100;
  ui.healthFill.style.width = `${healthPercent}%`;
  ui.healthText.textContent = `${Math.max(0, Math.ceil(player.health))} / ${Math.round(getEffectiveStat("maxHealth"))}`;
  ui.waveText.textContent = `${game.wave} / ${MAX_WAVES}`;
  ui.timer.textContent = formatTime(game.waveTime);
  ui.materialText.textContent = String(game.materials);
  ui.levelText.textContent = String(game.level);
  ui.experienceText.textContent = `${game.experience} / ${game.experienceToNext}`;
  ui.experienceFill.style.width = `${game.experience / game.experienceToNext * 100}%`;
  renderWeaponBar();
}

function finishRun(won) {
  game.phase = "gameover";
  game.paused = false;
  game.keys.clear();
  ui.battleHud.hidden = true;
  ui.weaponBar.hidden = true;
  ui.experienceWrap.hidden = true;
  ui.touchControls.hidden = true;
  ui.upgradePanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.gameOverPanel.hidden = false;
  ui.resultKicker.textContent = won ? "远征完成" : "远征结束";
  ui.resultTitle.textContent = won ? "薯星防线守住了！" : "探险员倒下了";
  ui.gameOverSummary.textContent = won ? "你完成了全部 20 波。" : `你抵达了第 ${game.wave} 波。`;
  ui.resultStats.innerHTML = `
    <div><strong>${game.totalKills}</strong><span>击败</span></div>
    <div><strong>${game.materials}</strong><span>剩余材料</span></div>
    <div><strong>${game.level}</strong><span>最终等级</span></div>
  `;
  playSound(won ? "wave" : "fail");
}

function drawBackground() {
  context.fillStyle = "#273a27";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(232, 238, 212, 0.065)";
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 0; x <= canvas.width; x += 48) { context.moveTo(x, 0); context.lineTo(x, canvas.height); }
  for (let y = 0; y <= canvas.height; y += 48) { context.moveTo(0, y); context.lineTo(canvas.width, y); }
  context.stroke();
  context.fillStyle = "#2e432d";
  context.beginPath();
  context.ellipse(140, 430, 120, 42, -0.2, 0, Math.PI * 2);
  context.ellipse(780, 150, 150, 52, 0.15, 0, Math.PI * 2);
  context.fill();
}

function drawEnemy(enemy) {
  const style = ENEMY_ARCHETYPES[enemy.type];
  context.save();
  context.translate(enemy.x, enemy.y);
  context.fillStyle = "rgba(0,0,0,.26)";
  context.beginPath();
  context.ellipse(0, enemy.radius * 0.8, enemy.radius, enemy.radius * 0.35, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = enemy.hitFlash > 0 ? "#fff2cf" : style.color;
  context.strokeStyle = style.light;
  context.lineWidth = 3;
  context.beginPath();
  if (enemy.type === "runner") context.ellipse(0, 0, enemy.radius * 1.25, enemy.radius * 0.82, 0, 0, Math.PI * 2);
  else if (enemy.type === "bulwark") context.rect(-enemy.radius * .85, -enemy.radius * .85, enemy.radius * 1.7, enemy.radius * 1.7);
  else context.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = "#261b22";
  context.beginPath();
  context.arc(-enemy.radius * .3, -2, 2.5, 0, Math.PI * 2);
  context.arc(enemy.radius * .3, -2, 2.5, 0, Math.PI * 2);
  context.fill();
  if (enemy.health < enemy.maxHealth) {
    context.fillStyle = "rgba(0,0,0,.7)";
    context.fillRect(-enemy.radius, -enemy.radius - 9, enemy.radius * 2, 4);
    context.fillStyle = "#e4776c";
    context.fillRect(-enemy.radius, -enemy.radius - 9, enemy.radius * 2 * Math.max(0, enemy.health / enemy.maxHealth), 4);
  }
  context.restore();
}

function drawPlayer() {
  const character = game.selectedCharacter ?? CHARACTERS[0];
  context.save();
  context.translate(player.x, player.y);
  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) context.globalAlpha = .45;
  context.fillStyle = "rgba(0,0,0,.28)";
  context.beginPath();
  context.ellipse(0, 20, 23, 8, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = character.color;
  context.strokeStyle = "#70472e";
  context.lineWidth = 3;
  context.beginPath();
  context.ellipse(0, 0, 21, 26, -.08, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = "#81aa58";
  context.beginPath();
  context.ellipse(-4, -29, 7, 12, -.6, 0, Math.PI * 2);
  context.ellipse(6, -28, 6, 10, .7, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#241a13";
  context.beginPath();
  context.arc(-7 + player.facingX * 2, -3 + player.facingY, 2.6, 0, Math.PI * 2);
  context.arc(7 + player.facingX * 2, -3 + player.facingY, 2.6, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawCombatObjects() {
  for (const gem of game.gems) {
    const pulse = 1 + Math.sin(gem.phase) * .12;
    context.save();
    context.translate(gem.x, gem.y);
    context.rotate(Math.PI / 4);
    context.scale(pulse, pulse);
    context.fillStyle = "#61d8c3";
    context.strokeStyle = "#d5fff2";
    context.lineWidth = 2;
    context.fillRect(-gem.radius, -gem.radius, gem.radius * 2, gem.radius * 2);
    context.strokeRect(-gem.radius, -gem.radius, gem.radius * 2, gem.radius * 2);
    context.restore();
  }
  for (const projectile of game.projectiles) {
    context.fillStyle = projectile.color;
    context.strokeStyle = "rgba(255,255,255,.65)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  for (const effect of game.meleeEffects) {
    context.strokeStyle = effect.color;
    context.globalAlpha = effect.remainingLife / .16;
    context.lineWidth = 8;
    context.beginPath();
    context.arc(effect.x, effect.y, effect.radius * .72, effect.angle - .75, effect.angle + .75);
    context.stroke();
    context.globalAlpha = 1;
  }
  for (const particle of game.particles) {
    context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function render() {
  drawBackground();
  if (game.phase !== "loadout") {
    for (const enemy of game.enemies) drawEnemy(enemy);
    drawCombatObjects();
    drawPlayer();
  }
}

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - game.lastFrameTime) / 1000, 0.05);
  game.lastFrameTime = currentTime;
  if (game.phase === "wave" && !game.paused) updateWave(deltaTime);
  render();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (game.phase !== "wave") return;
  game.paused = !game.paused;
  ui.pauseBadge.hidden = !game.paused;
}

function updateJoystick(event) {
  const bounds = ui.joystickBase.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const maximum = bounds.width * .34;
  let x = event.clientX - centerX;
  let y = event.clientY - centerY;
  const length = Math.hypot(x, y);
  if (length > maximum) { x = x / length * maximum; y = y / length * maximum; }
  game.touchX = x / maximum;
  game.touchY = y / maximum;
  ui.joystickKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function releaseJoystick(event) {
  if (event.pointerId !== game.activePointerId) return;
  game.activePointerId = null;
  game.touchX = 0;
  game.touchY = 0;
  ui.joystickKnob.style.transform = "translate(-50%, -50%)";
}

ui.selectionBack.addEventListener("click", showCharacterSelection);
ui.rerollButton.addEventListener("click", rerollShop);
ui.nextWaveButton.addEventListener("click", () => { game.wave += 1; startWave(); });
ui.restartButton.addEventListener("click", showCharacterSelection);
ui.soundToggle.addEventListener("click", () => {
  audio.enabled = !audio.enabled;
  ui.soundToggle.setAttribute("aria-pressed", String(audio.enabled));
  ui.soundToggle.textContent = audio.enabled ? "音效：开" : "音效：关";
  if (audio.enabled) ensureAudio();
});

ui.joystickBase.addEventListener("pointerdown", (event) => {
  ensureAudio();
  game.activePointerId = event.pointerId;
  ui.joystickBase.setPointerCapture(event.pointerId);
  updateJoystick(event);
});
ui.joystickBase.addEventListener("pointermove", (event) => {
  if (event.pointerId === game.activePointerId) updateJoystick(event);
});
ui.joystickBase.addEventListener("pointerup", releaseJoystick);
ui.joystickBase.addEventListener("pointercancel", releaseJoystick);

window.addEventListener("keydown", (event) => {
  const controls = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
  if (controls.includes(event.code)) event.preventDefault();
  if (event.code === "Space" && !event.repeat) togglePause();
  else game.keys.add(event.code);
});
window.addEventListener("keyup", (event) => game.keys.delete(event.code));
window.addEventListener("blur", () => {
  game.keys.clear();
  game.touchX = 0;
  game.touchY = 0;
  if (game.phase === "wave" && !game.paused) togglePause();
});

showCharacterSelection();
requestAnimationFrame((time) => {
  game.lastFrameTime = time;
  requestAnimationFrame(gameLoop);
});
