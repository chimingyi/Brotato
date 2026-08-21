import {
  BASE_STATS,
  BOSS_ARCHETYPES,
  CHARACTERS,
  DANGER_LEVELS,
  ELITE_ARCHETYPES,
  ELITE_SKILLS,
  ENEMY_ARCHETYPES,
  ENEMY_TRAITS,
  ITEMS,
  LEVEL_UPGRADES,
  MAX_WAVES,
  MAX_WEAPON_SLOTS,
  RARITIES,
  SPECIAL_EVENTS,
  STAT_LABELS,
  WEAPON_EVOLUTIONS,
  WEAPON_TAG_BONUSES,
  WEAPONS,
  getWaveDefinition,
} from "./data.js";
import {
  loadProgress,
  recordRunProgress,
  resetProgress,
  saveProgress,
} from "./storage.js";

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
  specialHud: $("#special-hud"),
  specialName: $("#special-name"),
  specialHealthFill: $("#special-health-fill"),
  specialHealthText: $("#special-health-text"),
  loadoutPanel: $("#loadout-panel"),
  loadoutTitle: $("#loadout-title"),
  loadoutCopy: $("#loadout-copy"),
  characterOptions: $("#character-options"),
  weaponOptions: $("#weapon-options"),
  selectionBack: $("#selection-back"),
  dangerPicker: $("#danger-picker"),
  dangerValue: $("#danger-value"),
  dangerDescription: $("#danger-description"),
  dangerOptions: $("#danger-options"),
  progressSummary: $("#progress-summary"),
  collectionButton: $("#collection-button"),
  helpButton: $("#help-button"),
  settingsButton: $("#settings-button"),
  collectionPanel: $("#collection-panel"),
  collectionClose: $("#collection-close"),
  collectionSummary: $("#collection-summary"),
  collectionContent: $("#collection-content"),
  helpPanel: $("#help-panel"),
  helpClose: $("#help-close"),
  settingsPanel: $("#settings-panel"),
  settingsClose: $("#settings-close"),
  volumeSlider: $("#volume-slider"),
  volumeValue: $("#volume-value"),
  shakeToggle: $("#shake-toggle"),
  damageNumberToggle: $("#damage-number-toggle"),
  resetSaveButton: $("#reset-save-button"),
  upgradePanel: $("#upgrade-panel"),
  upgradeOptions: $("#upgrade-options"),
  upgradeRemaining: $("#upgrade-remaining"),
  eventPanel: $("#event-panel"),
  eventTitle: $("#event-title"),
  eventCopy: $("#event-copy"),
  eventChoices: $("#event-choices"),
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
  unlockSummary: $("#unlock-summary"),
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
const requestedStartWave = Number.parseInt(parameters.get("startWave") || "", 10);
const requestedDanger = Number.parseInt(parameters.get("danger") || "", 10);
const testInvincible = localTestMode && parameters.get("invincible") === "1";
const requestedStartMaterials = Number.parseInt(parameters.get("startMaterials") || "", 10);
const requestedStartExperience = Number.parseInt(parameters.get("startExperience") || "", 10);
const requestedUpgradeRarity = Number.parseInt(parameters.get("upgradeRarity") || "", 10);
const requestedStartItems = (parameters.get("startItems") || "").split(",").filter(Boolean);
const requestedStartHealth = Number.parseFloat(parameters.get("startHealth") || "");
const requestedStartRarity = Number.parseInt(parameters.get("startRarity") || "", 10);
const requestedStartEvolved = localTestMode && parameters.get("startEvolved") === "1";
const requestedEventId = localTestMode ? parameters.get("event") || "" : "";
const requestedShopRarity = Number.parseInt(parameters.get("shopRarity") || "", 10);
const requestedShopWeapon = parameters.get("shopWeapon") || "";
const requestedShopItem = parameters.get("shopItem") || "";
const requestedShopRaritySequence = (parameters.get("shopRarities") || "")
  .split(",")
  .map((value) => Number.parseInt(value, 10))
  .filter((value) => Number.isFinite(value));
const forceWeaponShop = localTestMode
  && (parameters.get("shopWeapons") === "1" || Boolean(WEAPONS[requestedShopWeapon]));
const forceItemShop = localTestMode
  && (parameters.get("shopItems") === "1" || ITEMS.some((item) => item.id === requestedShopItem));
const lockedTestProgress = localTestMode && parameters.get("lockedProgress") === "1";
const testNoEnemies = localTestMode && parameters.get("noEnemies") === "1";
const testSingleTree = localTestMode && parameters.get("treeTest") === "1";
const requestedEnemyTraits = (parameters.get("enemyTraits") || "")
  .split(",")
  .filter((traitId) => ENEMY_TRAITS[traitId]);

const characterIds = CHARACTERS.map((character) => character.id);
const weaponIds = Object.keys(WEAPONS);
const itemIds = ITEMS.map((item) => item.id);
const enemyCatalog = [
  ...Object.entries(ENEMY_ARCHETYPES).map(([id, definition]) => ({ key: `normal:${id}`, id, rank: "normal", definition })),
  ...Object.entries(ELITE_ARCHETYPES).map(([id, definition]) => ({ key: `elite:${id}`, id, rank: "elite", definition })),
  ...Object.entries(BOSS_ARCHETYPES).map(([id, definition]) => ({ key: `boss:${id}`, id, rank: "boss", definition })),
];
const enemyIds = enemyCatalog.map((entry) => entry.key);
let progress = loadProgress({
  testMode: localTestMode,
  lockedTest: lockedTestProgress,
  characterIds,
  weaponIds,
  itemIds,
  enemyIds,
  maxDanger: DANGER_LEVELS.length - 1,
});
for (const character of CHARACTERS) {
  if (!progress.unlockedCharacters.includes(character.id)) continue;
  for (const weaponId of character.allowedWeapons) {
    if (!progress.unlockedWeapons.includes(weaponId)) progress.unlockedWeapons.push(weaponId);
  }
}
saveProgress(progress, localTestMode);

const game = {
  phase: "loadout",
  paused: false,
  selectedCharacter: null,
  danger: localTestMode && Number.isFinite(requestedDanger)
    ? clamp(requestedDanger, 0, DANGER_LEVELS.length - 1)
    : 0,
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
  completedEvents: [],
  activeEvent: null,
  inventory: [],
  items: [],
  stats: { ...BASE_STATS },
  spawnTimer: 0,
  enemies: [],
  enemyProjectiles: [],
  destructibles: [],
  consumables: [],
  projectiles: [],
  meleeEffects: [],
  gems: [],
  particles: [],
  floatingTexts: [],
  keys: new Set(),
  touchX: 0,
  touchY: 0,
  activePointerId: null,
  lastFrameTime: 0,
  nextUid: 1,
  testShopOfferIndex: 0,
  encounteredEnemies: new Set(),
  progressRecorded: false,
  shakeTime: 0,
  traitState: createTraitState(),
  metrics: createEmptyMetrics(),
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

const audio = {
  context: null,
  enabled: progress.settings.soundEnabled,
  masterVolume: progress.settings.masterVolume,
};

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createEmptyMetrics() {
  return {
    attacks: 0,
    projectiles: 0,
    explosions: 0,
    burns: 0,
    slows: 0,
    bounces: 0,
    enemyShots: 0,
    summons: 0,
    healPulses: 0,
    heals: 0,
    charges: 0,
    specials: 0,
    damageNumbers: 0,
    shakes: 0,
    treesDestroyed: 0,
    consumablesDropped: 0,
    consumablesPicked: 0,
    characterTraitProcs: 0,
    itemTraitProcs: 0,
    enemyTraitSpawns: 0,
    enemyTraitExplosions: 0,
    weaponEvolutions: 0,
    eventsResolved: 0,
    cursedItemsPurchased: 0,
    curseBonusDrops: 0,
    eliteSkillProcs: 0,
  };
}

function createTraitState() {
  return {
    stationaryTime: 0,
    chargedAttacks: 0,
  };
}

function getCharacterTraitId() {
  return game.selectedCharacter?.trait?.id ?? null;
}

function hasItem(itemId) {
  return game.items.includes(itemId);
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
  gain.gain.setValueAtTime(sound[3] * audio.masterVolume, now);
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
  game.stats.maxHealth = Math.max(1, game.stats.maxHealth);
  if (healForMaxHealth && game.stats.maxHealth > oldMaxHealth) {
    player.health += game.stats.maxHealth - oldMaxHealth;
  }
  player.health = Math.min(player.health, getEffectiveStat("maxHealth"));
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
  const traitId = getCharacterTraitId();
  if (stat === "damage" && traitId === "tailwind") {
    value += Math.max(0, game.stats.speed ?? 0) * 0.35;
  }
  if (stat === "attackSpeed" && traitId === "kinetic_charge") {
    value += Math.max(0, game.stats.speed ?? 0) * 0.4;
  }
  if (stat === "armor" && traitId === "rooted_guard" && game.traitState.stationaryTime >= 0.8) {
    value += 4;
  }
  const limits = {
    maxHealth: [1, Number.POSITIVE_INFINITY],
    attackSpeed: [-80, Number.POSITIVE_INFINITY],
    critChance: [0, 100],
    dodge: [0, 60],
    lifeSteal: [0, 100],
    speed: [-60, Number.POSITIVE_INFINITY],
    pickupRange: [20, Number.POSITIVE_INFINITY],
  };
  return limits[stat] ? clamp(value, limits[stat][0], limits[stat][1]) : value;
}

function createWeapon(id, rarity = 1, evolved = false) {
  return { uid: game.nextUid++, id, rarity, evolved: evolved && Boolean(WEAPON_EVOLUTIONS[id]), cooldown: 0 };
}

function getWeaponEvolution(instance) {
  return instance.evolved ? WEAPON_EVOLUTIONS[instance.id] ?? null : null;
}

function getWeaponDisplay(instance) {
  const definition = WEAPONS[instance.id];
  const evolution = getWeaponEvolution(instance);
  return evolution
    ? { ...definition, icon: evolution.icon, name: evolution.name, description: evolution.description }
    : definition;
}

function getCurseLevel() {
  return game.items.reduce((total, itemId) => total + (ITEMS.find((item) => item.id === itemId)?.curse ?? 0), 0);
}

function getWeaponDamage(instance) {
  const definition = WEAPONS[instance.id];
  const evolution = getWeaponEvolution(instance);
  let damage = definition.baseDamage * RARITIES[instance.rarity - 1].multiplier;
  for (const [stat, scaling] of Object.entries(definition.scaling)) {
    damage += getEffectiveStat(stat) * scaling;
  }
  return Math.max(1, damage * (1 + getEffectiveStat("damage") / 100) * (evolution?.damageMultiplier ?? 1));
}

function getWeaponCooldown(instance) {
  const definition = WEAPONS[instance.id];
  const evolution = getWeaponEvolution(instance);
  const traitMultiplier = getCharacterTraitId() === "overclock" && definition.type === "engineering" ? 0.8 : 1;
  return definition.cooldown * traitMultiplier * (evolution?.cooldownMultiplier ?? 1) / Math.max(0.2, 1 + getEffectiveStat("attackSpeed") / 100);
}

function getMovementSpeed() {
  return 235 * Math.max(0.4, 1 + getEffectiveStat("speed") / 100);
}

function getDamageAfterArmor(rawDamage) {
  const armor = getEffectiveStat("armor");
  const reduction = armor >= 0 ? armor / (armor + 18) : armor / (18 - armor);
  return Math.max(1, rawDamage * (1 - reduction));
}

function getCharacterUnlockText(characterId) {
  const requirements = {
    ember_gardener: "抵达第 5 波",
    gear_tender: "抵达第 8 波",
    crystal_duelist: "抵达第 10 波",
    pollen_alchemist: "抵达第 12 波",
    moon_hunter: "抵达第 14 波",
    storm_runner: "抵达第 16 波",
    field_medic: "抵达第 18 波",
    scrap_collector: "完成一次远征",
    sun_breaker: "完成危险 D2",
  };
  return requirements[characterId] ?? "初始解锁";
}

function renderProgressSummary() {
  ui.progressSummary.textContent = `远征 ${progress.runs} 次 · 最高第 ${progress.bestWave} 波 · 通关 ${progress.wins} 次`;
}

function createCollectionGroup(title, entries) {
  const section = document.createElement("section");
  section.className = "collection-group";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const grid = document.createElement("div");
  grid.className = "collection-grid";
  for (const entry of entries) {
    const card = document.createElement("div");
    card.className = `collection-entry${entry.unlocked ? "" : " is-locked"}`;
    card.innerHTML = entry.unlocked
      ? `<strong>${entry.icon} ${entry.name}</strong><span>${entry.description}</span>`
      : `<strong>🔒 未解锁</strong><span>${entry.hint}</span>`;
    grid.append(card);
  }
  section.append(heading, grid);
  return section;
}

function renderCollection() {
  const discoveredEnemySet = new Set(progress.discoveredEnemies);
  ui.collectionSummary.innerHTML = `
    <div><strong>${progress.unlockedCharacters.length} / ${CHARACTERS.length}</strong><span>探险员</span></div>
    <div><strong>${progress.unlockedWeapons.length} / ${weaponIds.length}</strong><span>武器</span></div>
    <div><strong>${progress.unlockedItems.length} / ${ITEMS.length}</strong><span>道具</span></div>
    <div><strong>${discoveredEnemySet.size} / ${enemyCatalog.length}</strong><span>敌人记录</span></div>
  `;
  const characterEntries = CHARACTERS.map((character) => ({
    icon: character.icon,
    name: character.name,
    description: `${character.trait.name}：${character.trait.description}；${character.origin.name}：${character.origin.description}`,
    hint: getCharacterUnlockText(character.id),
    unlocked: progress.unlockedCharacters.includes(character.id),
  }));
  const weaponEntries = Object.values(WEAPONS).map((weapon) => ({
    icon: weapon.icon,
    name: weapon.name,
    description: `${weapon.tags.join(" / ")} · ${weapon.description}`,
    hint: "继续提高最高波次",
    unlocked: progress.unlockedWeapons.includes(weapon.id),
  }));
  const itemEntries = ITEMS.map((item) => ({
    icon: item.icon,
    name: item.name,
    description: item.description,
    hint: "继续完成远征",
    unlocked: progress.unlockedItems.includes(item.id),
  }));
  const evolutionEntries = Object.entries(WEAPON_EVOLUTIONS).map(([weaponId, evolution]) => ({
    icon: evolution.icon,
    name: evolution.name,
    description: `${WEAPONS[weaponId].name}进化 · ${evolution.description}`,
    hint: "解锁对应武器后可查看",
    unlocked: progress.unlockedWeapons.includes(weaponId),
  }));
  const eventEntries = SPECIAL_EVENTS.map((event) => ({
    icon: event.icon,
    name: event.name,
    description: event.description,
    hint: "在第 5、10、15 波后出现",
    unlocked: true,
  }));
  const enemyEntries = enemyCatalog.map((enemy) => ({
    icon: enemy.rank === "boss" ? "👑" : enemy.rank === "elite" ? "⚠️" : "👾",
    name: enemy.definition.name,
    description: enemy.rank === "boss" ? "首领" : enemy.rank === "elite" ? "精英" : "普通敌人",
    hint: "在远征中遇见它",
    unlocked: discoveredEnemySet.has(enemy.key),
  }));
  const enemyTraitEntries = Object.values(ENEMY_TRAITS).map((trait) => ({
    icon: trait.icon,
    name: trait.name,
    description: trait.description,
    hint: "提高危险等级后出现",
    unlocked: true,
  }));
  const eliteSkillEntries = Object.values(ELITE_SKILLS).map((skill) => ({
    icon: skill.icon,
    name: skill.name,
    description: skill.description,
    hint: "在精英波次中出现",
    unlocked: true,
  }));
  ui.collectionContent.replaceChildren(
    createCollectionGroup("探险员", characterEntries),
    createCollectionGroup("武器", weaponEntries),
    createCollectionGroup("武器进化", evolutionEntries),
    createCollectionGroup("道具", itemEntries),
    createCollectionGroup("波间事件", eventEntries),
    createCollectionGroup("敌人", enemyEntries),
    createCollectionGroup("敌人变异", enemyTraitEntries),
    createCollectionGroup("精英技能", eliteSkillEntries),
  );
}

function renderSettings() {
  ui.volumeSlider.value = String(Math.round(progress.settings.masterVolume * 100));
  ui.volumeValue.textContent = `${ui.volumeSlider.value}%`;
  ui.shakeToggle.checked = progress.settings.screenShake;
  ui.damageNumberToggle.checked = progress.settings.damageNumbers;
  ui.resetSaveButton.textContent = "重置存档";
  ui.resetSaveButton.dataset.confirming = "false";
}

function persistSettings() {
  audio.enabled = progress.settings.soundEnabled;
  audio.masterVolume = progress.settings.masterVolume;
  ui.soundToggle.setAttribute("aria-pressed", String(audio.enabled));
  ui.soundToggle.textContent = audio.enabled ? "音效：开" : "音效：关";
  saveProgress(progress, localTestMode);
}

function renderCharacterChoices() {
  ui.characterOptions.replaceChildren();
  for (const character of CHARACTERS) {
    const unlocked = progress.unlockedCharacters.includes(character.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-card${unlocked ? "" : " is-locked"}`;
    button.dataset.characterId = character.id;
    button.disabled = !unlocked;
    button.innerHTML = `
      <span class="choice-icon">${unlocked ? character.icon : "🔒"}</span>
      <span class="choice-name">${character.name}</span>
      <span class="choice-tagline">${character.tagline}</span>
      <span class="choice-rules">${unlocked ? character.rules.join("<br>") : `解锁条件：${getCharacterUnlockText(character.id)}`}</span>
    `;
    if (unlocked) button.addEventListener("click", () => selectCharacter(character.id));
    ui.characterOptions.append(button);
  }
}

function renderDangerOptions() {
  ui.dangerOptions.replaceChildren();
  for (const danger of DANGER_LEVELS) {
    const unlocked = danger.id <= progress.highestDangerUnlocked;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "danger-button";
    button.setAttribute("aria-pressed", String(game.danger === danger.id));
    button.disabled = !unlocked;
    button.textContent = unlocked ? `D${danger.id} ${danger.name}` : `🔒 D${danger.id}`;
    if (unlocked) {
      button.addEventListener("click", () => {
        game.danger = danger.id;
        renderDangerOptions();
      });
    }
    ui.dangerOptions.append(button);
  }
  const selectedDanger = DANGER_LEVELS[game.danger];
  ui.dangerValue.textContent = `D${selectedDanger.id}`;
  ui.dangerDescription.textContent = selectedDanger.description;
}

function selectCharacter(characterId) {
  game.selectedCharacter = CHARACTERS.find((character) => character.id === characterId);
  ui.characterOptions.hidden = true;
  ui.weaponOptions.hidden = false;
  ui.selectionBack.hidden = false;
  ui.dangerPicker.hidden = true;
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
  game.danger = Math.min(game.danger, progress.highestDangerUnlocked);
  game.paused = false;
  ui.loadoutPanel.hidden = false;
  ui.characterOptions.hidden = false;
  ui.weaponOptions.hidden = true;
  ui.selectionBack.hidden = true;
  ui.dangerPicker.hidden = false;
  ui.loadoutTitle.textContent = "选择探险员";
  ui.loadoutCopy.textContent = "每位探险员都有不同优势。第一次建议选择“嫩芽先锋”。";
  ui.upgradePanel.hidden = true;
  ui.eventPanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.gameOverPanel.hidden = true;
  ui.battleHud.hidden = true;
  ui.weaponBar.hidden = true;
  ui.specialHud.hidden = true;
  ui.experienceWrap.hidden = true;
  ui.touchControls.hidden = true;
  ui.collectionPanel.hidden = true;
  ui.helpPanel.hidden = true;
  ui.settingsPanel.hidden = true;
  renderProgressSummary();
  renderCharacterChoices();
  renderDangerOptions();
  render();
}

function beginRun(startingWeaponId) {
  ensureAudio();
  const origin = game.selectedCharacter.origin ?? {};
  game.wave = localTestMode && Number.isFinite(requestedStartWave)
    ? clamp(requestedStartWave, 1, MAX_WAVES)
    : 1;
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
  game.completedEvents = [];
  game.activeEvent = null;
  game.testShopOfferIndex = 0;
  game.metrics = createEmptyMetrics();
  game.encounteredEnemies = new Set();
  game.progressRecorded = false;
  game.floatingTexts = [];
  game.shakeTime = 0;
  game.traitState = createTraitState();
  const startingRarity = localTestMode && Number.isFinite(requestedStartRarity)
    ? clamp(requestedStartRarity, 1, 4)
    : origin.weaponRarity ?? 1;
  game.inventory = [createWeapon(startingWeaponId, startingRarity, requestedStartEvolved)];
  const testItems = localTestMode
    ? requestedStartItems.filter((itemId) => ITEMS.some((item) => item.id === itemId))
    : [];
  game.items = [...new Set([...testItems, ...(origin.itemId ? [origin.itemId] : [])])];
  game.stats = { ...BASE_STATS };
  applyModifiers(game.selectedCharacter.modifiers, false);
  applyModifiers(origin.modifiers ?? {}, false);
  game.materials += origin.materials ?? 0;
  for (const itemId of game.items) {
    const item = ITEMS.find((entry) => entry.id === itemId);
    if (item) applyModifiers(item.modifiers, false);
  }
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
  game.waveDefinition = getWaveDefinition(game.wave, game.danger);
  game.waveTime = getCurrentWaveDuration();
  game.waveStartMaterials = game.materials;
  game.waveCollected = 0;
  game.waveKills = 0;
  game.spawnTimer = 0.2;
  game.enemies = [];
  game.enemyProjectiles = [];
  game.destructibles = [];
  game.consumables = [];
  game.projectiles = [];
  game.meleeEffects = [];
  game.gems = [];
  game.particles = [];
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.health = game.stats.maxHealth;
  if (localTestMode && Number.isFinite(requestedStartHealth)) {
    player.health = clamp(requestedStartHealth, 1, game.stats.maxHealth);
  }
  player.invulnerableTimer = 0;
  player.regenAccumulator = 0;
  game.traitState.stationaryTime = 0;
  spawnDestructibles();
  if (game.waveDefinition.special) spawnSpecialEnemy();
  for (const weapon of game.inventory) weapon.cooldown = Math.random() * 0.2;

  ui.loadoutPanel.hidden = true;
  ui.upgradePanel.hidden = true;
  ui.eventPanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.gameOverPanel.hidden = true;
  ui.pauseBadge.hidden = true;
  ui.battleHud.hidden = false;
  ui.weaponBar.hidden = false;
  ui.specialHud.hidden = !game.waveDefinition.special;
  ui.experienceWrap.hidden = false;
  ui.touchControls.hidden = false;
  updateHud();
  playSound("wave");
}

function spawnDestructibles() {
  const count = testSingleTree ? 1 : 2 + Math.floor(game.wave / 6);
  for (let index = 0; index < count; index += 1) {
    const x = testSingleTree && index === 0 ? player.x + 105 : 70 + Math.random() * (canvas.width - 140);
    const y = testSingleTree && index === 0 ? player.y : 110 + Math.random() * (canvas.height - 180);
    game.destructibles.push({
      x,
      y,
      radius: 24,
      health: testSingleTree ? 8 : 28 + game.wave * 2,
      maxHealth: testSingleTree ? 8 : 28 + game.wave * 2,
    });
  }
}

function findNearestDestructible(maxRange) {
  let nearest = null;
  let nearestDistance = maxRange * maxRange;
  for (const destructible of game.destructibles) {
    const currentDistance = distanceSquared(player, destructible);
    if (currentDistance < nearestDistance) {
      nearest = destructible;
      nearestDistance = currentDistance;
    }
  }
  return nearest;
}

function damageDestructible(index, damage) {
  const destructible = game.destructibles[index];
  if (!destructible) return;
  destructible.health -= damage;
  createBurst(destructible.x, destructible.y, "#7faf59", 4);
  if (destructible.health > 0) return;
  game.destructibles.splice(index, 1);
  game.metrics.treesDestroyed += 1;
  const dropChance = clamp(0.55 + Math.max(0, getEffectiveStat("luck")) * 0.005, 0.55, 0.92);
  if (testSingleTree || Math.random() < dropChance) {
    game.consumables.push({ x: destructible.x, y: destructible.y, radius: 9, healing: 8 });
    game.metrics.consumablesDropped += 1;
  }
}

function getEnemyArchetype(rank, type) {
  if (rank === "elite") return ELITE_ARCHETYPES[type];
  if (rank === "boss") return BOSS_ARCHETYPES[type];
  return ENEMY_ARCHETYPES[type];
}

function getEnemySpawnPoint() {
  const margin = 34;
  const side = Math.floor(Math.random() * 4);
  let x;
  let y;
  if (side === 0) { x = Math.random() * canvas.width; y = -margin; }
  else if (side === 1) { x = canvas.width + margin; y = Math.random() * canvas.height; }
  else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + margin; }
  else { x = -margin; y = Math.random() * canvas.height; }
  return { x, y };
}

function rollEnemyTraits(base, rank) {
  if (base.summonedOnly) return [];
  if (localTestMode && requestedEnemyTraits.length > 0) return [...requestedEnemyTraits];
  const danger = DANGER_LEVELS[game.danger];
  const guaranteedSpecial = rank !== "normal" && game.danger >= 3;
  if (!guaranteedSpecial && Math.random() >= (danger.traitChance ?? 0)) return [];
  const slots = Math.max(1, danger.traitSlots ?? 1);
  return shuffle(Object.keys(ENEMY_TRAITS)).slice(0, slots);
}

function applyEnemyTraits(enemy) {
  if (enemy.traits.includes("armored")) enemy.armor += 6;
  if (enemy.traits.includes("swift")) enemy.speed *= 1.2;
  if (enemy.traits.includes("massive")) {
    enemy.maxHealth *= 1.35;
    enemy.health = enemy.maxHealth;
    enemy.radius *= 1.12;
    enemy.speed *= 0.86;
  }
  enemy.shieldHits = enemy.traits.includes("shielded") ? 3 : 0;
  game.metrics.enemyTraitSpawns += enemy.traits.length;
}

function getEnemyFrenzyMultiplier(enemy) {
  return enemy.traits.includes("frenzied") && enemy.health <= enemy.maxHealth * 0.5 ? 1.35 : 1;
}

function spawnEnemy(type = null, options = {}) {
  const rank = options.rank ?? "normal";
  const enemyType = type ?? randomItem(game.waveDefinition.types);
  const base = getEnemyArchetype(rank, enemyType);
  if (!base) return null;
  const spawnPoint = Number.isFinite(options.x) && Number.isFinite(options.y)
    ? { x: options.x, y: options.y }
    : getEnemySpawnPoint();
  const specialScale = rank === "normal" ? 1 : Math.sqrt(game.waveDefinition.healthMultiplier);
  const healthMultiplier = rank === "normal" ? game.waveDefinition.healthMultiplier : specialScale;
  const damageMultiplier = rank === "normal" ? game.waveDefinition.damageMultiplier : Math.sqrt(game.waveDefinition.damageMultiplier);
  const curseLevel = getCurseLevel();
  const curseHealthMultiplier = 1 + curseLevel * 0.025;
  const curseDamageMultiplier = 1 + curseLevel * 0.015;
  const curseRewardMultiplier = 1 + curseLevel * 0.04;
  const traits = rollEnemyTraits(base, rank);
  const enemy = {
    uid: game.nextUid++,
    rank,
    definition: base,
    behavior: base.behavior,
    type: enemyType,
    x: spawnPoint.x,
    y: spawnPoint.y,
    radius: base.radius,
    maxHealth: base.health * healthMultiplier * curseHealthMultiplier,
    health: base.health * healthMultiplier * curseHealthMultiplier,
    speed: base.speed * game.waveDefinition.speedMultiplier,
    damage: base.damage * damageMultiplier * curseDamageMultiplier,
    armor: base.armor ?? 0,
    material: Math.max(1, Math.round(base.material * game.waveDefinition.rewardMultiplier * curseRewardMultiplier)),
    hitFlash: 0,
    burnRemaining: 0,
    burnDamage: 0,
    slowRemaining: 0,
    slowFactor: 1,
    actionTimer: Math.random() * 0.8 + 0.3,
    chargeRemaining: 0,
    chargeX: 0,
    chargeY: 0,
    orbitDirection: Math.random() < 0.5 ? -1 : 1,
    traits,
    shieldHits: 0,
    eliteSkill: rank === "elite" ? ELITE_SKILLS[enemyType] ?? null : null,
    eliteSkillTimer: rank === "elite" ? (ELITE_SKILLS[enemyType]?.cooldown ?? 0) * 0.65 : 0,
    eliteChargeMultiplier: 1,
  };
  applyEnemyTraits(enemy);
  game.enemies.push(enemy);
  game.encounteredEnemies.add(`${rank}:${enemyType}`);
  if (rank !== "normal") game.metrics.specials += 1;
  return enemy;
}

function spawnSpecialEnemy() {
  const special = game.waveDefinition.special;
  if (!special) return;
  spawnEnemy(special.id, { rank: special.rank });
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
  const evolution = getWeaponEvolution(instance);
  const range = Math.max(45, (definition.range + getEffectiveStat("range")) * (evolution?.rangeMultiplier ?? 1));
  const target = findNearestEnemy(range) ?? findNearestDestructible(range);
  if (!target) return false;
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const length = Math.hypot(dx, dy) || 1;
  const directionX = dx / length;
  const directionY = dy / length;
  player.facingX = directionX;
  player.facingY = directionY;
  game.metrics.attacks += 1;
  let attackMultiplier = 1;
  if (hasItem("storm_battery")) {
    game.traitState.chargedAttacks += 1;
    if (game.traitState.chargedAttacks % 8 === 0) {
      attackMultiplier = 1.4;
      game.metrics.itemTraitProcs += 1;
    }
  }

  if (definition.type === "melee") {
    const damage = getWeaponDamage(instance) * attackMultiplier;
    const meleeKnockback = definition.knockback * (evolution?.knockbackMultiplier ?? 1);
    const statusSource = evolution?.burnMultiplier
      ? { ...definition, burnDamage: (definition.burnDamage ?? 0) * evolution.burnMultiplier }
      : definition;
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
        applyWeaponStatus(enemy, statusSource);
        damageEnemy(index, damage, meleeKnockback, directionX, directionY, {
          weaponType: definition.type,
          distance: Math.sqrt(distanceSquared(player, enemy)),
        });
      }
    }
    for (let index = game.destructibles.length - 1; index >= 0; index -= 1) {
      const destructible = game.destructibles[index];
      if (distanceSquared(player, destructible) <= (range + destructible.radius) ** 2) {
        damageDestructible(index, damage);
      }
    }
  } else {
    const projectileCount = (definition.projectileCount ?? 1) + (evolution?.projectileCountBonus ?? 0);
    const startingAngle = Math.atan2(directionY, directionX);
    for (let projectileIndex = 0; projectileIndex < projectileCount; projectileIndex += 1) {
      const offset = projectileIndex - (projectileCount - 1) / 2;
      const angle = startingAngle + offset * (definition.spread ?? 0);
      const projectileDirectionX = Math.cos(angle);
      const projectileDirectionY = Math.sin(angle);
      const explosionTraitMultiplier = getCharacterTraitId() === "wide_reaction"
        ? 1.3
        : getCharacterTraitId() === "heavy_payload" ? 1.25 : 1;
      game.projectiles.push({
        x: player.x + projectileDirectionX * player.radius,
        y: player.y + projectileDirectionY * player.radius,
        velocityX: projectileDirectionX * definition.projectileSpeed,
        velocityY: projectileDirectionY * definition.projectileSpeed,
        radius: definition.projectileSize ?? 5,
        damage: getWeaponDamage(instance) * attackMultiplier,
        weaponType: definition.type,
        knockback: definition.knockback * (evolution?.knockbackMultiplier ?? 1),
        color: definition.projectileColor ?? RARITIES[instance.rarity - 1].color,
        remainingLife: range / definition.projectileSpeed + 0.25,
        remainingPierce: (definition.pierce ?? 0) + (evolution?.pierceBonus ?? 0) + (getCharacterTraitId() === "phase_arrow" ? 1 : 0),
        remainingBounces: (definition.bounces ?? 0) + (evolution?.bounceBonus ?? 0),
        explosionRadius: (definition.explosionRadius ?? 0) * explosionTraitMultiplier * (evolution?.explosionRadiusMultiplier ?? 1),
        burnDamage: (definition.burnDamage ?? 0) * (evolution?.burnMultiplier ?? 1),
        burnDuration: definition.burnDuration ?? 0,
        slowFactor: definition.slowFactor ?? 1,
        slowDuration: definition.slowDuration ?? 0,
        hitIds: new Set(),
      });
      game.metrics.projectiles += 1;
    }
  }
  playSound("shoot");
  return true;
}

function applyWeaponStatus(enemy, source) {
  if (source.burnDamage > 0 && source.burnDuration > 0) {
    const characterMultiplier = getCharacterTraitId() === "deep_kindling" ? 1.35 : 1;
    const burnDamage = (source.burnDamage + Math.max(0, getEffectiveStat("elementalDamage")) * 0.18) * characterMultiplier;
    if (characterMultiplier > 1) game.metrics.characterTraitProcs += 1;
    enemy.burnDamage = Math.max(enemy.burnDamage ?? 0, burnDamage);
    enemy.burnRemaining = Math.max(enemy.burnRemaining ?? 0, source.burnDuration);
    game.metrics.burns += 1;
  }
  if (source.slowFactor < 1 && source.slowDuration > 0) {
    enemy.slowFactor = Math.min(enemy.slowFactor ?? 1, source.slowFactor);
    enemy.slowRemaining = Math.max(enemy.slowRemaining ?? 0, source.slowDuration);
    game.metrics.slows += 1;
  }
}

function damageArea(projectile, directTarget) {
  if (projectile.explosionRadius <= 0) return;
  game.metrics.explosions += 1;
  if (progress.settings.screenShake) {
    game.shakeTime = Math.max(game.shakeTime, 0.14);
    game.metrics.shakes += 1;
  }
  const targets = [...game.enemies];
  createBurst(projectile.x, projectile.y, projectile.color, 18);
  for (const target of targets) {
    if (target === directTarget) continue;
    const hitRadius = projectile.explosionRadius + target.radius;
    if (distanceSquared(projectile, target) > hitRadius * hitRadius) continue;
    const currentIndex = game.enemies.indexOf(target);
    if (currentIndex < 0) continue;
    const dx = target.x - projectile.x;
    const dy = target.y - projectile.y;
    const length = Math.hypot(dx, dy) || 1;
    applyWeaponStatus(target, projectile);
    damageEnemy(
      currentIndex,
      projectile.damage * 0.58,
      projectile.knockback * 0.65,
      dx / length,
      dy / length,
      { weaponType: projectile.weaponType, distance: Math.sqrt(distanceSquared(player, target)), explosion: true },
    );
  }
}

function redirectBounce(projectile) {
  if (projectile.remainingBounces <= 0) return false;
  let target = null;
  let nearestDistance = 260 * 260;
  for (const enemy of game.enemies) {
    if (projectile.hitIds.has(enemy)) continue;
    const currentDistance = distanceSquared(projectile, enemy);
    if (currentDistance < nearestDistance) {
      target = enemy;
      nearestDistance = currentDistance;
    }
  }
  if (!target) return false;
  const speed = Math.hypot(projectile.velocityX, projectile.velocityY) || 1;
  const dx = target.x - projectile.x;
  const dy = target.y - projectile.y;
  const length = Math.hypot(dx, dy) || 1;
  projectile.velocityX = dx / length * speed;
  projectile.velocityY = dy / length * speed;
  projectile.remainingBounces -= 1;
  game.metrics.bounces += 1;
  return true;
}

function damageEnemy(index, baseDamage, knockback, directionX, directionY, options = {}) {
  const enemy = game.enemies[index];
  if (!enemy) return;
  let traitDamageMultiplier = 1;
  if (hasItem("glass_sprout") && enemy.health >= enemy.maxHealth - 0.01) {
    traitDamageMultiplier *= 1.25;
    game.metrics.itemTraitProcs += 1;
  }
  if (hasItem("wild_scope") && options.weaponType !== "melee" && options.distance >= 260) {
    traitDamageMultiplier *= 1.25;
    game.metrics.itemTraitProcs += 1;
  }
  if (options.explosion && getCharacterTraitId() === "heavy_payload") {
    traitDamageMultiplier *= 1.25;
    game.metrics.characterTraitProcs += 1;
  }
  const critical = Math.random() * 100 < getEffectiveStat("critChance");
  const criticalMultiplier = critical && getCharacterTraitId() === "perfect_edge" ? 2.15 : critical ? 1.8 : 1;
  if (critical && criticalMultiplier > 1.8) game.metrics.characterTraitProcs += 1;
  const shieldMultiplier = enemy.shieldHits > 0 ? 0.62 : 1;
  if (enemy.shieldHits > 0) enemy.shieldHits -= 1;
  const rawDamage = baseDamage * traitDamageMultiplier * criticalMultiplier * shieldMultiplier;
  const enemyArmor = enemy.armor ?? 0;
  const armorReduction = enemyArmor >= 0 ? enemyArmor / (enemyArmor + 22) : enemyArmor / (22 - enemyArmor);
  const damage = Math.max(1, rawDamage * (1 - armorReduction));
  if (progress.settings.damageNumbers) {
    game.floatingTexts.push({
      x: enemy.x,
      y: enemy.y - enemy.radius,
      text: String(Math.round(damage)),
      color: critical ? "#ffe48c" : "#f5eee0",
      life: 0.65,
      maxLife: 0.65,
    });
    game.metrics.damageNumbers += 1;
  }
  enemy.health -= damage;
  enemy.hitFlash = 0.08;
  enemy.x += directionX * (knockback + getEffectiveStat("knockback"));
  enemy.y += directionY * (knockback + getEffectiveStat("knockback"));
  createBurst(enemy.x, enemy.y, critical ? "#ffe48c" : "#dfb36a", critical ? 7 : 3);
  if (getEffectiveStat("lifeSteal") > 0 && Math.random() * 100 < getEffectiveStat("lifeSteal")) {
    player.health = Math.min(getEffectiveStat("maxHealth"), player.health + 1);
  }
  if (hasItem("repair_drone") && options.weaponType === "engineering" && player.health < getEffectiveStat("maxHealth") && Math.random() < 0.1) {
    player.health = Math.min(getEffectiveStat("maxHealth"), player.health + 1);
    game.metrics.itemTraitProcs += 1;
  }
  if (enemy.health <= 0) defeatEnemy(index);
}

function defeatEnemy(index) {
  const enemy = game.enemies[index];
  if (!enemy) return;
  createBurst(enemy.x, enemy.y, enemy.definition.light, enemy.rank === "boss" ? 32 : enemy.rank === "elite" ? 20 : 9);
  let materialDrops = enemy.material;
  if (getCharacterTraitId() === "salvage" && Math.random() < 0.22) {
    materialDrops += 1;
    game.metrics.characterTraitProcs += 1;
  }
  const curseLevel = getCurseLevel();
  if (curseLevel > 0 && Math.random() < Math.min(0.6, curseLevel * 0.04)) {
    materialDrops += 1;
    game.metrics.curseBonusDrops += 1;
  }
  for (let amount = 0; amount < materialDrops; amount += 1) {
    game.gems.push({
      x: enemy.x + (Math.random() - 0.5) * 12,
      y: enemy.y + (Math.random() - 0.5) * 12,
      radius: 6,
      value: 1,
      phase: Math.random() * Math.PI * 2,
    });
  }
  if (enemy.traits.includes("volatile")) {
    createBurst(enemy.x, enemy.y, ENEMY_TRAITS.volatile.color, 16);
    game.metrics.enemyTraitExplosions += 1;
    const explosionDistance = player.radius + enemy.radius + 105;
    if (distanceSquared(player, enemy) <= explosionDistance * explosionDistance) {
      hurtPlayer(enemy.damage * 0.65);
    }
  }
  game.enemies.splice(index, 1);
  game.waveKills += 1;
  game.totalKills += 1;
  if (enemy.definition.splitType && game.phase === "wave") {
    for (let amount = 0; amount < enemy.definition.splitCount; amount += 1) {
      spawnEnemy(enemy.definition.splitType, {
        x: enemy.x + (Math.random() - 0.5) * 30,
        y: enemy.y + (Math.random() - 0.5) * 30,
      });
      game.metrics.summons += 1;
    }
  }
}

function collectGem(gem) {
  game.materials += gem.value;
  game.waveCollected += gem.value;
  gainExperience(gem.value);
  if (hasItem("greedy_magnet") && Math.random() < 0.2) {
    game.materials += 1;
    game.waveCollected += 1;
    gainExperience(1);
    game.metrics.itemTraitProcs += 1;
  }
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
    game.traitState.stationaryTime = 0;
  } else {
    game.traitState.stationaryTime += deltaTime;
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
      applyWeaponStatus(enemy, projectile);
      damageEnemy(
        enemyIndex,
        projectile.damage,
        projectile.knockback,
        projectile.velocityX / speed,
        projectile.velocityY / speed,
        {
          weaponType: projectile.weaponType,
          distance: Math.sqrt(distanceSquared(player, enemy)),
          explosion: projectile.explosionRadius > 0,
        },
      );
      damageArea(projectile, enemy);
      if (redirectBounce(projectile)) break;
      if (projectile.remainingPierce > 0) projectile.remainingPierce -= 1;
      else shouldRemove = true;
    }

    for (let treeIndex = game.destructibles.length - 1; treeIndex >= 0 && !shouldRemove; treeIndex -= 1) {
      const destructible = game.destructibles[treeIndex];
      const hitDistance = projectile.radius + destructible.radius;
      if (distanceSquared(projectile, destructible) > hitDistance * hitDistance) continue;
      damageDestructible(treeIndex, projectile.damage);
      shouldRemove = true;
    }

    if (shouldRemove) game.projectiles.splice(projectileIndex, 1);
  }
}

function triggerThornReply() {
  const retaliationDamage = Math.max(5, 9 + Math.max(0, getEffectiveStat("meleeDamage")) * 0.7);
  let hit = false;
  for (let index = game.enemies.length - 1; index >= 0; index -= 1) {
    const enemy = game.enemies[index];
    const retaliationRange = 105 + enemy.radius;
    if (distanceSquared(player, enemy) > retaliationRange * retaliationRange) continue;
    enemy.health -= retaliationDamage;
    createBurst(enemy.x, enemy.y, "#b7e07a", 5);
    hit = true;
    if (enemy.health <= 0) defeatEnemy(index);
  }
  if (hit) game.metrics.itemTraitProcs += 1;
}

function hurtPlayer(rawDamage) {
  if (player.invulnerableTimer > 0 || game.phase !== "wave") return false;
  if (testInvincible) {
    player.invulnerableTimer = 0.12;
    return true;
  }
  const dodged = Math.random() * 100 < clamp(getEffectiveStat("dodge"), 0, 60);
  if (!dodged) {
    const braceMultiplier = hasItem("iron_boots") && game.traitState.stationaryTime >= 0.8 ? 0.75 : 1;
    player.health -= getDamageAfterArmor(rawDamage * braceMultiplier);
    if (braceMultiplier < 1) game.metrics.itemTraitProcs += 1;
    playSound("hurt");
    if (progress.settings.screenShake) {
      game.shakeTime = Math.max(game.shakeTime, 0.18);
      game.metrics.shakes += 1;
    }
  } else {
    createBurst(player.x, player.y, "#c6f4d0", 6);
    if (hasItem("moon_charm")) {
      player.health = Math.min(getEffectiveStat("maxHealth"), player.health + 2);
      game.metrics.itemTraitProcs += 1;
    }
    if (hasItem("thorn_crown")) triggerThornReply();
  }
  player.invulnerableTimer = 0.65;
  if (player.health <= 0) finishRun(false);
  return true;
}

function shootEnemyProjectile(enemy) {
  const definition = enemy.definition;
  const count = definition.projectileCount ?? 1;
  const baseAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
  for (let projectileIndex = 0; projectileIndex < count; projectileIndex += 1) {
    const offset = projectileIndex - (count - 1) / 2;
    const angle = baseAngle + offset * (count > 1 ? 0.16 : 0);
    game.enemyProjectiles.push({
      x: enemy.x,
      y: enemy.y,
      velocityX: Math.cos(angle) * definition.projectileSpeed,
      velocityY: Math.sin(angle) * definition.projectileSpeed,
      radius: enemy.rank === "boss" ? 8 : 6,
      damage: enemy.damage * getEnemyFrenzyMultiplier(enemy),
      color: definition.light,
      remainingLife: 4,
    });
    game.metrics.enemyShots += 1;
  }
}

function shootRadialEnemyProjectiles(enemy, count = 8) {
  for (let projectileIndex = 0; projectileIndex < count; projectileIndex += 1) {
    const angle = projectileIndex / count * Math.PI * 2;
    game.enemyProjectiles.push({
      x: enemy.x,
      y: enemy.y,
      velocityX: Math.cos(angle) * 245,
      velocityY: Math.sin(angle) * 245,
      radius: 6,
      damage: enemy.damage * 0.72,
      color: enemy.definition.light,
      remainingLife: 4,
    });
    game.metrics.enemyShots += 1;
  }
}

function updateEliteSkill(enemy, deltaTime, dx, dy, distance) {
  if (!enemy.eliteSkill) return;
  enemy.eliteSkillTimer -= deltaTime;
  if (enemy.eliteSkillTimer > 0) return;
  let triggered = true;
  if (enemy.type === "thorn_champion") {
    enemy.chargeX = dx / distance;
    enemy.chargeY = dy / distance;
    enemy.chargeRemaining = 0.7;
    enemy.eliteChargeMultiplier = 1.45;
    createBurst(enemy.x, enemy.y, "#ff776d", 14);
  } else if (enemy.type === "storm_caller") {
    shootRadialEnemyProjectiles(enemy);
    createBurst(enemy.x, enemy.y, "#c2b6ff", 16);
  } else if (enemy.type === "brood_keeper") {
    if (game.enemies.length < 88) {
      for (let amount = 0; amount < 2; amount += 1) {
        spawnEnemy("mite", { x: enemy.x + (Math.random() - 0.5) * 44, y: enemy.y + (Math.random() - 0.5) * 44 });
        game.metrics.summons += 1;
      }
      createBurst(enemy.x, enemy.y, "#b5d66a", 14);
    } else {
      triggered = false;
    }
  } else if (enemy.type === "iron_colossus") {
    enemy.shieldHits = Math.min(5, enemy.shieldHits + 2);
    createBurst(enemy.x, enemy.y, "#a9d8ff", 14);
  }
  if (!triggered) {
    enemy.eliteSkillTimer = 0.5;
    return;
  }
  enemy.eliteSkillTimer = enemy.eliteSkill.cooldown;
  game.metrics.eliteSkillProcs += 1;
}

function updateEnemyProjectiles(deltaTime) {
  for (let index = game.enemyProjectiles.length - 1; index >= 0; index -= 1) {
    const projectile = game.enemyProjectiles[index];
    projectile.x += projectile.velocityX * deltaTime;
    projectile.y += projectile.velocityY * deltaTime;
    projectile.remainingLife -= deltaTime;
    const hitDistance = player.radius + projectile.radius;
    const hitPlayer = distanceSquared(projectile, player) <= hitDistance * hitDistance;
    const outside = projectile.x < -40 || projectile.x > canvas.width + 40 || projectile.y < -40 || projectile.y > canvas.height + 40;
    if (hitPlayer) hurtPlayer(projectile.damage);
    if (hitPlayer || outside || projectile.remainingLife <= 0) game.enemyProjectiles.splice(index, 1);
  }
}

function moveEnemy(enemy, directionX, directionY, speedMultiplier, deltaTime) {
  enemy.x += directionX * enemy.speed * speedMultiplier * deltaTime;
  enemy.y += directionY * enemy.speed * speedMultiplier * deltaTime;
}

function getEnemyBuffMultiplier(enemy) {
  for (const source of game.enemies) {
    if (source === enemy || source.behavior !== "buffer") continue;
    const auraRadius = source.definition.auraRadius ?? 0;
    if (distanceSquared(source, enemy) <= auraRadius * auraRadius) return 1.25;
  }
  return 1;
}

function updateEnemyBehavior(enemy, deltaTime, dx, dy, distance, movementMultiplier) {
  const definition = enemy.definition;
  const directionX = dx / distance;
  const directionY = dy / distance;
  enemy.actionTimer -= deltaTime;

  if (enemy.behavior === "charger") {
    if (enemy.chargeRemaining > 0) {
      enemy.chargeRemaining -= deltaTime;
      enemy.x += enemy.chargeX * definition.chargeSpeed * (enemy.eliteChargeMultiplier ?? 1) * deltaTime;
      enemy.y += enemy.chargeY * definition.chargeSpeed * (enemy.eliteChargeMultiplier ?? 1) * deltaTime;
      if (enemy.chargeRemaining <= 0) enemy.eliteChargeMultiplier = 1;
    } else {
      moveEnemy(enemy, directionX, directionY, movementMultiplier, deltaTime);
      if (enemy.actionTimer <= 0) {
        enemy.chargeX = directionX;
        enemy.chargeY = directionY;
        enemy.chargeRemaining = 0.55;
        enemy.actionTimer = definition.chargeCooldown;
        game.metrics.charges += 1;
      }
    }
    return;
  }

  if (["ranged", "sniper", "turret"].includes(enemy.behavior)) {
    const preferredRange = definition.preferredRange;
    if (enemy.behavior !== "turret") {
      if (distance > preferredRange + 35) moveEnemy(enemy, directionX, directionY, movementMultiplier, deltaTime);
      else if (distance < preferredRange - 55) moveEnemy(enemy, -directionX, -directionY, movementMultiplier, deltaTime);
      else moveEnemy(enemy, -directionY, directionX, movementMultiplier * 0.45, deltaTime);
    }
    if (enemy.actionTimer <= 0) {
      shootEnemyProjectile(enemy);
      enemy.actionTimer = definition.shootCooldown;
    }
    return;
  }

  if (enemy.behavior === "healer") {
    moveEnemy(enemy, directionX, directionY, movementMultiplier * 0.75, deltaTime);
    if (enemy.actionTimer <= 0) {
      game.metrics.healPulses += 1;
      let healed = 0;
      for (const target of game.enemies) {
        if (target === enemy || target.health >= target.maxHealth) continue;
        if (distanceSquared(enemy, target) > definition.healRadius ** 2) continue;
        target.health = Math.min(target.maxHealth, target.health + definition.healAmount);
        createBurst(target.x, target.y, "#8de3a8", 4);
        healed += 1;
      }
      if (healed > 0) game.metrics.heals += healed;
      enemy.actionTimer = definition.healCooldown;
    }
    return;
  }

  if (enemy.behavior === "summoner") {
    moveEnemy(enemy, directionX, directionY, movementMultiplier * 0.65, deltaTime);
    if (enemy.actionTimer <= 0 && game.enemies.length < 90) {
      for (let amount = 0; amount < definition.summonCount; amount += 1) {
        spawnEnemy(definition.summonType, {
          x: enemy.x + (Math.random() - 0.5) * 50,
          y: enemy.y + (Math.random() - 0.5) * 50,
        });
        game.metrics.summons += 1;
      }
      enemy.actionTimer = definition.summonCooldown;
    }
    return;
  }

  if (enemy.behavior === "orbiter") {
    const radial = distance > definition.orbitRange ? 0.7 : distance < definition.orbitRange - 45 ? -0.55 : 0;
    const orbitX = directionX * radial + -directionY * enemy.orbitDirection;
    const orbitY = directionY * radial + directionX * enemy.orbitDirection;
    const orbitLength = Math.hypot(orbitX, orbitY) || 1;
    moveEnemy(enemy, orbitX / orbitLength, orbitY / orbitLength, movementMultiplier, deltaTime);
    return;
  }

  if (enemy.behavior === "teleporter") {
    moveEnemy(enemy, directionX, directionY, movementMultiplier * 0.75, deltaTime);
    if (enemy.actionTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      enemy.x = clamp(player.x + Math.cos(angle) * 185, enemy.radius, canvas.width - enemy.radius);
      enemy.y = clamp(player.y + Math.sin(angle) * 185, player.radius + 58, canvas.height - enemy.radius);
      createBurst(enemy.x, enemy.y, definition.light, 10);
      enemy.actionTimer = definition.teleportCooldown;
    }
    return;
  }

  moveEnemy(enemy, directionX, directionY, movementMultiplier, deltaTime);
}

function updateEnemies(deltaTime) {
  for (let enemyIndex = game.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
    const enemy = game.enemies[enemyIndex];
    if (enemy.burnRemaining > 0) {
      enemy.burnRemaining = Math.max(0, enemy.burnRemaining - deltaTime);
      enemy.health -= enemy.burnDamage * deltaTime;
      if (enemy.health <= 0) {
        defeatEnemy(enemyIndex);
        continue;
      }
    }
    if (enemy.slowRemaining > 0) enemy.slowRemaining = Math.max(0, enemy.slowRemaining - deltaTime);
    else enemy.slowFactor = 1;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const length = Math.hypot(dx, dy) || 1;
    const slowMultiplier = enemy.slowRemaining > 0 ? enemy.slowFactor : 1;
    const buffMultiplier = getEnemyBuffMultiplier(enemy);
    const frenzyMultiplier = getEnemyFrenzyMultiplier(enemy);
    updateEliteSkill(enemy, deltaTime, dx, dy, length);
    updateEnemyBehavior(enemy, deltaTime, dx, dy, length, slowMultiplier * buffMultiplier * frenzyMultiplier);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
    const touchDistance = player.radius + enemy.radius;
    if (distanceSquared(player, enemy) <= touchDistance * touchDistance && player.invulnerableTimer <= 0) {
      hurtPlayer(enemy.damage * (buffMultiplier > 1 ? 1.2 : 1) * frenzyMultiplier);
      enemy.x -= dx / length * 18;
      enemy.y -= dy / length * 18;
      if (enemy.behavior === "exploder") {
        createBurst(enemy.x, enemy.y, enemy.definition.light, 20);
        const currentIndex = game.enemies.indexOf(enemy);
        if (currentIndex >= 0) defeatEnemy(currentIndex);
      }
      if (game.phase !== "wave") return;
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

function updateConsumables(deltaTime) {
  for (let index = game.consumables.length - 1; index >= 0; index -= 1) {
    const consumable = game.consumables[index];
    const deltaX = player.x - consumable.x;
    const deltaY = player.y - consumable.y;
    const distance = Math.hypot(deltaX, deltaY);
    const attractionRange = 70 + Math.max(0, getEffectiveStat("pickupRange"));
    if (distance > 0 && distance <= attractionRange) {
      const attractionSpeed = 190;
      consumable.x += deltaX / distance * attractionSpeed * deltaTime;
      consumable.y += deltaY / distance * attractionSpeed * deltaTime;
    }
    const pickupDistance = player.radius + consumable.radius + 5;
    if (distanceSquared(player, consumable) > pickupDistance * pickupDistance) continue;
    if (player.health >= getEffectiveStat("maxHealth")) continue;
    const previousHealth = player.health;
    const traitMultiplier = getCharacterTraitId() === "field_triage" ? 1.5 : 1;
    player.health = Math.min(getEffectiveStat("maxHealth"), player.health + consumable.healing * traitMultiplier);
    if (traitMultiplier > 1) game.metrics.characterTraitProcs += 1;
    game.consumables.splice(index, 1);
    game.metrics.consumablesPicked += 1;
    game.floatingTexts.push({
      x: player.x,
      y: player.y - 28,
      text: `+${Math.round(player.health - previousHealth)}`,
      color: "#9bf59f",
      life: .75,
      maxLife: .75,
    });
    createBurst(player.x, player.y, "#9ae58f", 8);
    playSound("pickup");
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
  game.shakeTime = Math.max(0, game.shakeTime - deltaTime);
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
  for (let index = game.floatingTexts.length - 1; index >= 0; index -= 1) {
    const floatingText = game.floatingTexts[index];
    floatingText.life -= deltaTime;
    floatingText.y -= 30 * deltaTime;
    if (floatingText.life <= 0) game.floatingTexts.splice(index, 1);
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
  if (game.spawnTimer <= 0 && !testNoEnemies) {
    spawnEnemy();
    game.spawnTimer = game.waveDefinition.spawnInterval;
  }
  updatePlayer(deltaTime);
  updateWeapons(deltaTime);
  updateProjectiles(deltaTime);
  updateEnemies(deltaTime);
  if (game.phase !== "wave") return;
  updateEnemyProjectiles(deltaTime);
  updateGems(deltaTime);
  updateConsumables(deltaTime);
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
  if (getCharacterTraitId() === "seasoned_growth") {
    game.stats.harvesting += 1;
    game.metrics.characterTraitProcs += 1;
  }
  game.phase = "transition";
  game.keys.clear();
  game.touchX = 0;
  game.touchY = 0;
  ui.battleHud.hidden = true;
  ui.weaponBar.hidden = true;
  ui.specialHud.hidden = true;
  ui.experienceWrap.hidden = true;
  ui.touchControls.hidden = true;
  ui.waveSummary.textContent = `击败 ${game.waveKills} 个敌人 · 收集 ${game.waveCollected} 材料 · 收获 +${harvestingIncome}`;
  playSound("wave");

  if (game.wave >= MAX_WAVES) {
    finishRun(true);
  } else if (game.pendingUpgrades > 0) {
    openUpgradePanel();
  } else {
    openPostWaveDestination();
  }
}

function getWaveEvent() {
  if (game.wave >= MAX_WAVES || game.wave % 5 !== 0 || game.completedEvents.includes(game.wave)) return null;
  if (requestedEventId) return SPECIAL_EVENTS.find((event) => event.id === requestedEventId) ?? null;
  return SPECIAL_EVENTS[(game.wave / 5 - 1) % SPECIAL_EVENTS.length];
}

function openPostWaveDestination() {
  const event = getWaveEvent();
  if (event) openEventPanel(event);
  else openShop();
}

function openEventPanel(event) {
  game.phase = "event";
  game.activeEvent = event;
  ui.upgradePanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.eventPanel.hidden = false;
  ui.eventTitle.textContent = `${event.icon} ${event.name}`;
  ui.eventCopy.textContent = event.description;
  ui.eventChoices.replaceChildren();
  for (const choice of event.choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card event-choice";
    button.disabled = (choice.materialCost ?? 0) > game.materials;
    button.innerHTML = `
      <span class="choice-name">${choice.name}</span>
      <span class="choice-tagline">${choice.description}</span>
      ${choice.materialCost ? `<span class="choice-rules">需要 ◆ ${choice.materialCost}</span>` : ""}
    `;
    button.addEventListener("click", () => chooseEventChoice(choice));
    ui.eventChoices.append(button);
  }
}

function chooseEventChoice(choice) {
  if (!game.activeEvent || (choice.materialCost ?? 0) > game.materials) return;
  game.materials -= choice.materialCost ?? 0;
  game.materials += choice.materials ?? 0;
  applyModifiers(choice.modifiers ?? {});
  game.completedEvents.push(game.wave);
  game.metrics.eventsResolved += 1;
  game.activeEvent = null;
  ui.eventPanel.hidden = true;
  playSound("buy");
  openShop();
}

function rollUpgradeRarity() {
  if (localTestMode && Number.isFinite(requestedUpgradeRarity)) return clamp(requestedUpgradeRarity, 1, 4);
  const progressBonus = Math.min(0.18, game.level * 0.006 + game.wave * 0.004);
  const luckBonus = Math.max(0, getEffectiveStat("luck")) * 0.0015;
  const roll = Math.random();
  if (roll < 0.02 + progressBonus * 0.2 + luckBonus * 0.35) return 4;
  if (roll < 0.12 + progressBonus * 0.55 + luckBonus) return 3;
  if (roll < 0.38 + progressBonus + luckBonus * 1.5) return 2;
  return 1;
}

function describeUpgradeModifiers(modifiers) {
  return Object.entries(modifiers).map(([stat, amount]) => {
    const percent = ["damage", "attackSpeed", "critChance", "dodge", "speed", "lifeSteal"].includes(stat) ? "%" : "";
    return `${amount >= 0 ? "+" : ""}${amount}${percent} ${STAT_LABELS[stat]}`;
  }).join("，");
}

function getUpgradeChoices() {
  return shuffle(LEVEL_UPGRADES).slice(0, 4).map((upgrade) => {
    const rarity = rollUpgradeRarity();
    const multiplier = RARITIES[rarity - 1].multiplier;
    const modifiers = Object.fromEntries(Object.entries(upgrade.modifiers).map(([stat, amount]) => [stat, Math.max(1, Math.round(amount * multiplier))]));
    return { ...upgrade, rarity, modifiers, description: describeUpgradeModifiers(modifiers) };
  });
}

function openUpgradePanel() {
  game.phase = "upgrade";
  ui.upgradePanel.hidden = false;
  ui.eventPanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.upgradeRemaining.textContent = `还有 ${game.pendingUpgrades} 次升级选择`;
  ui.upgradeOptions.replaceChildren();
  for (const upgrade of getUpgradeChoices()) {
    const rarity = RARITIES[upgrade.rarity - 1];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.style.setProperty("--rarity", rarity.color);
    button.innerHTML = `
      <span class="choice-icon">${upgrade.icon}</span>
      <span class="choice-name">${upgrade.name}</span>
      <span class="shop-card__type">${rarity.name}升级</span>
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
    openPostWaveDestination();
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

function getBiasedWeapon(pool) {
  const ownedTags = new Set(game.inventory.flatMap((instance) => WEAPONS[instance.id].tags));
  const matchingWeapons = pool.filter((weapon) => weapon.tags.some((tag) => ownedTags.has(tag)));
  if (matchingWeapons.length > 0 && Math.random() < 0.68) return randomItem(matchingWeapons);
  return randomItem(pool);
}

function createShopOffer(forcedType = null) {
  const offersWeapon = forceWeaponShop
    || (!forceItemShop && (forcedType === "weapon" || (forcedType !== "item" && Math.random() < 0.48)));
  if (offersWeapon) {
    const unlockedWeaponPool = progress.unlockedWeapons.map((id) => WEAPONS[id]).filter(Boolean);
    const weapon = localTestMode && WEAPONS[requestedShopWeapon]
      ? WEAPONS[requestedShopWeapon]
      : getBiasedWeapon(unlockedWeaponPool.length > 0 ? unlockedWeaponPool : Object.values(WEAPONS));
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
  const unlockedItemPool = ITEMS.filter((item) => progress.unlockedItems.includes(item.id));
  const eligibleItemPool = unlockedItemPool.filter((item) => canAddItem(item));
  const forcedItem = ITEMS.find((item) => item.id === requestedShopItem);
  const item = localTestMode && forcedItem
    ? forcedItem
    : randomItem(eligibleItemPool.length > 0 ? eligibleItemPool : unlockedItemPool.length > 0 ? unlockedItemPool : ITEMS);
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

function refreshShopOffers(preserveLocked = true, guaranteeWeapons = false) {
  const nextOffers = [];
  const minimumWeapons = forceItemShop ? 0 : guaranteeWeapons ? (game.wave <= 2 ? 2 : 1) : 0;
  const preservedOffers = game.shopOffers.map((offer) => (preserveLocked && offer?.locked && !offer.sold ? offer : null));
  let weaponCount = preservedOffers.filter((offer) => offer?.type === "weapon").length;
  let remainingReplaceable = 4 - preservedOffers.filter(Boolean).length;
  for (let index = 0; index < 4; index += 1) {
    const existing = preservedOffers[index];
    if (existing) {
      nextOffers.push(existing);
      continue;
    }
    const neededWeapons = Math.max(0, minimumWeapons - weaponCount);
    const forceWeapon = neededWeapons >= remainingReplaceable;
    const offer = createShopOffer(forceWeapon ? "weapon" : null);
    nextOffers.push(offer);
    if (offer.type === "weapon") weaponCount += 1;
    remainingReplaceable -= 1;
  }
  game.shopOffers = nextOffers;
  renderShop();
}

function openShop() {
  game.phase = "shop";
  game.rerollCost = Math.max(1, Math.floor(1 + game.wave * 0.35));
  ui.upgradePanel.hidden = true;
  ui.eventPanel.hidden = true;
  ui.shopPanel.hidden = false;
  ui.shopTitle.textContent = `D${game.danger} · 第 ${game.wave} 波完成`;
  ui.nextWaveButton.textContent = `开始第 ${game.wave + 1} 波`;
  refreshShopOffers(true, true);
}

function getOfferDefinition(offer) {
  return offer.type === "weapon"
    ? WEAPONS[offer.definitionId]
    : ITEMS.find((item) => item.id === offer.definitionId);
}

function canAddItem(item) {
  const ownedCount = game.items.filter((itemId) => itemId === item.id).length;
  if (item.unique && ownedCount > 0) return false;
  if (item.maxCount && ownedCount >= item.maxCount) return false;
  if (item.group) {
    const ownsGroupItem = game.items.some((itemId) => ITEMS.find((entry) => entry.id === itemId)?.group === item.group);
    if (ownsGroupItem && ownedCount === 0) return false;
  }
  return true;
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
  if (offer.type === "item" && !canAddItem(getOfferDefinition(offer))) return;
  game.materials -= offer.price;

  if (offer.type === "weapon") {
    addWeaponWithAutoCombine(offer.definitionId, offer.rarity);
  } else {
    const item = getOfferDefinition(offer);
    game.items.push(item.id);
    applyModifiers(item.modifiers);
    if (item.curse) game.metrics.cursedItemsPurchased += 1;
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
  const evolution = getWeaponEvolution(instance);
  const refund = Math.max(1, Math.floor((definition.price * RARITIES[instance.rarity - 1].multiplier + (evolution?.cost ?? 0)) * 0.45));
  game.materials += refund;
  game.inventory.splice(index, 1);
  renderShop();
}

function evolveWeapon(uid) {
  const instance = game.inventory.find((weapon) => weapon.uid === uid);
  const evolution = instance ? WEAPON_EVOLUTIONS[instance.id] : null;
  if (!instance || !evolution || instance.rarity !== 4 || instance.evolved || game.materials < evolution.cost) return;
  game.materials -= evolution.cost;
  instance.evolved = true;
  instance.cooldown = 0;
  game.metrics.weaponEvolutions += 1;
  playSound("level");
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
    card.className = `shop-card${offer.locked ? " is-locked" : ""}${definition.curse ? " is-cursed" : ""}`;
    card.style.setProperty("--rarity", rarity.color);
    if (offer.sold) {
      card.innerHTML = `<span class="choice-icon">✓</span><span class="choice-name">已购买</span>`;
    } else {
      const canBuy = game.materials >= offer.price
        && (offer.type !== "weapon" || canAddWeapon(offer))
        && (offer.type !== "item" || canAddItem(definition));
      card.innerHTML = `
        <span class="shop-card__type">${offer.type === "weapon" ? `${rarity.name}武器` : definition.curse ? `诅咒 ${definition.curse}` : "道具"}</span>
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
      const definition = getWeaponDisplay(instance);
      const rarity = RARITIES[instance.rarity - 1];
      card.className = "inventory-card";
      card.style.setProperty("--rarity", rarity.color);
      card.classList.toggle("is-evolved", instance.evolved);
      card.innerHTML = `<strong>${definition.icon} ${definition.name}</strong><span>${instance.evolved ? "进化" : rarity.name} · 伤害 ${Math.round(getWeaponDamage(instance))}</span>`;
      const evolution = WEAPON_EVOLUTIONS[instance.id];
      if (allowSell && evolution && instance.rarity === 4 && !instance.evolved) {
        const evolveButton = document.createElement("button");
        evolveButton.type = "button";
        evolveButton.className = "evolve-button";
        evolveButton.textContent = `进化 · ${evolution.cost}`;
        evolveButton.title = `${evolution.name}：${evolution.description}`;
        evolveButton.disabled = game.materials < evolution.cost;
        evolveButton.addEventListener("click", () => evolveWeapon(instance.uid));
        card.append(evolveButton);
      }
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
  const curseTerm = document.createElement("dt");
  curseTerm.textContent = "诅咒";
  const curseValue = document.createElement("dd");
  curseValue.textContent = String(getCurseLevel());
  curseValue.className = getCurseLevel() > 0 ? "curse-value" : "";
  ui.statsList.append(curseTerm, curseValue);
}

function renderWeaponBar() {
  ui.weaponBar.replaceChildren();
  for (let index = 0; index < MAX_WEAPON_SLOTS; index += 1) {
    const instance = game.inventory[index];
    const slot = document.createElement("div");
    slot.className = "mini-weapon";
    if (instance) {
      const definition = getWeaponDisplay(instance);
      slot.textContent = definition.icon;
      slot.style.setProperty("--rarity", instance.evolved ? "#ffca62" : RARITIES[instance.rarity - 1].color);
      slot.title = `${definition.name} · ${instance.evolved ? "进化" : RARITIES[instance.rarity - 1].name}`;
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
  ui.waveText.textContent = `${game.wave} / ${MAX_WAVES} · D${game.danger}`;
  ui.timer.textContent = formatTime(game.waveTime);
  ui.materialText.textContent = String(game.materials);
  ui.levelText.textContent = String(game.level);
  ui.experienceText.textContent = `${game.experience} / ${game.experienceToNext}`;
  ui.experienceFill.style.width = `${game.experience / game.experienceToNext * 100}%`;
  const special = game.enemies.find((enemy) => enemy.rank !== "normal");
  ui.specialHud.hidden = !special;
  if (special) {
    const traitSuffix = special.traits.length > 0
      ? ` · ${special.traits.map((traitId) => ENEMY_TRAITS[traitId].name).join("+")}`
      : "";
    const skillSuffix = special.eliteSkill ? ` · ${special.eliteSkill.icon}${special.eliteSkill.name}` : "";
    ui.specialName.textContent = `${special.rank === "boss" ? "首领" : "精英"} · ${special.definition.name}${traitSuffix}${skillSuffix}`;
    ui.specialHealthFill.style.width = `${clamp(special.health / special.maxHealth, 0, 1) * 100}%`;
    ui.specialHealthText.textContent = `${Math.max(0, Math.ceil(special.health))} / ${Math.ceil(special.maxHealth)}`;
  }
  renderWeaponBar();
}

function recordCurrentRun(won) {
  if (game.progressRecorded) return null;
  game.progressRecorded = true;
  const unlocks = recordRunProgress(progress, {
    won,
    wave: game.wave,
    danger: game.danger,
    weaponIds,
    itemIds,
    encounteredEnemyIds: [...game.encounteredEnemies],
    maxDanger: DANGER_LEVELS.length - 1,
  });
  for (const character of CHARACTERS) {
    if (!progress.unlockedCharacters.includes(character.id)) continue;
    for (const weaponId of character.allowedWeapons) {
      if (!progress.unlockedWeapons.includes(weaponId)) {
        progress.unlockedWeapons.push(weaponId);
        unlocks.weapons.push(weaponId);
      }
    }
  }
  saveProgress(progress, localTestMode);
  return unlocks;
}

function describeUnlocks(unlocks) {
  if (!unlocks) return [];
  const lines = [];
  if (unlocks.danger !== null) lines.push(`危险 D${unlocks.danger}`);
  for (const id of unlocks.characters) {
    const character = CHARACTERS.find((entry) => entry.id === id);
    if (character) lines.push(`探险员：${character.name}`);
  }
  for (const id of unlocks.weapons.slice(0, 4)) {
    if (WEAPONS[id]) lines.push(`武器：${WEAPONS[id].name}`);
  }
  if (unlocks.weapons.length > 4) lines.push(`另外 ${unlocks.weapons.length - 4} 把武器`);
  for (const id of unlocks.items.slice(0, 4)) {
    const item = ITEMS.find((entry) => entry.id === id);
    if (item) lines.push(`道具：${item.name}`);
  }
  if (unlocks.items.length > 4) lines.push(`另外 ${unlocks.items.length - 4} 件道具`);
  return lines;
}

function finishRun(won) {
  const unlockLines = describeUnlocks(recordCurrentRun(won));
  game.phase = "gameover";
  game.paused = false;
  game.keys.clear();
  ui.battleHud.hidden = true;
  ui.weaponBar.hidden = true;
  ui.specialHud.hidden = true;
  ui.experienceWrap.hidden = true;
  ui.touchControls.hidden = true;
  ui.upgradePanel.hidden = true;
  ui.eventPanel.hidden = true;
  ui.shopPanel.hidden = true;
  ui.gameOverPanel.hidden = false;
  ui.resultKicker.textContent = won ? "远征完成" : "远征结束";
  ui.resultTitle.textContent = won ? "薯星防线守住了！" : "探险员倒下了";
  ui.gameOverSummary.textContent = won
    ? `你在危险 D${game.danger} 完成了全部 20 波。`
    : `你在危险 D${game.danger} 抵达了第 ${game.wave} 波。`;
  ui.resultStats.innerHTML = `
    <div><strong>${game.totalKills}</strong><span>击败</span></div>
    <div><strong>${game.materials}</strong><span>剩余材料</span></div>
    <div><strong>${game.level}</strong><span>最终等级</span></div>
  `;
  ui.unlockSummary.hidden = unlockLines.length === 0;
  ui.unlockSummary.innerHTML = unlockLines.length > 0
    ? `<strong>新解锁</strong><br>${unlockLines.join("<br>")}`
    : "";
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
  const style = enemy.definition;
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
  if (enemy.rank !== "normal") {
    context.strokeStyle = enemy.rank === "boss" ? "#ffcf65" : "#f09d58";
    context.lineWidth = enemy.rank === "boss" ? 6 : 4;
    context.beginPath();
    context.arc(0, 0, enemy.radius + 8, 0, Math.PI * 2);
    context.stroke();
  }
  if (enemy.shieldHits > 0) {
    context.strokeStyle = ENEMY_TRAITS.shielded.color;
    context.lineWidth = 3;
    context.setLineDash([5, 4]);
    context.beginPath();
    context.arc(0, 0, enemy.radius + 5, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }
  if (enemy.traits.length > 0) {
    context.font = "bold 10px system-ui";
    context.textAlign = "center";
    enemy.traits.forEach((traitId, index) => {
      const trait = ENEMY_TRAITS[traitId];
      const markerX = (index - (enemy.traits.length - 1) / 2) * 14;
      context.fillStyle = trait.color;
      context.beginPath();
      context.arc(markerX, -enemy.radius - 16, 6, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#182017";
      context.fillText(trait.icon, markerX, -enemy.radius - 12.5);
    });
    context.textAlign = "start";
  }
  if (enemy.burnRemaining > 0) {
    context.strokeStyle = "#ff9b4b";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(0, 0, enemy.radius + 5, 0, Math.PI * 2);
    context.stroke();
  }
  if (enemy.slowRemaining > 0) {
    context.strokeStyle = "#8de5f4";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, enemy.radius + 9, 0, Math.PI * 2);
    context.stroke();
  }
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

function drawDestructible(destructible) {
  context.save();
  context.translate(destructible.x, destructible.y);
  context.fillStyle = "rgba(0,0,0,.25)";
  context.beginPath();
  context.ellipse(0, 19, 25, 8, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#765033";
  context.strokeStyle = "#4d3827";
  context.lineWidth = 3;
  context.fillRect(-6, -3, 12, 26);
  context.strokeRect(-6, -3, 12, 26);
  context.fillStyle = "#6fa34c";
  context.strokeStyle = "#c1df79";
  context.beginPath();
  context.arc(-12, -10, 15, 0, Math.PI * 2);
  context.arc(10, -13, 17, 0, Math.PI * 2);
  context.arc(0, -27, 18, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  if (destructible.health < destructible.maxHealth) {
    context.fillStyle = "rgba(0,0,0,.7)";
    context.fillRect(-22, -51, 44, 5);
    context.fillStyle = "#a9dc70";
    context.fillRect(-22, -51, 44 * Math.max(0, destructible.health / destructible.maxHealth), 5);
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
  for (const consumable of game.consumables) {
    context.save();
    context.translate(consumable.x, consumable.y);
    context.fillStyle = "rgba(0,0,0,.24)";
    context.beginPath();
    context.ellipse(0, 8, 11, 4, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ee6259";
    context.strokeStyle = "#ffd8a8";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, consumable.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#8dc45c";
    context.beginPath();
    context.ellipse(2, -10, 5, 3, -.45, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff0bd";
    context.fillRect(-1.5, -5, 3, 10);
    context.fillRect(-5, -1.5, 10, 3);
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
  for (const projectile of game.enemyProjectiles) {
    context.fillStyle = projectile.color;
    context.strokeStyle = "rgba(255,255,255,.7)";
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
  for (const floatingText of game.floatingTexts) {
    context.globalAlpha = Math.max(0, floatingText.life / floatingText.maxLife);
    context.fillStyle = floatingText.color;
    context.font = "bold 13px system-ui";
    context.textAlign = "center";
    context.fillText(floatingText.text, floatingText.x, floatingText.y);
  }
  context.globalAlpha = 1;
  context.textAlign = "start";
}

function render() {
  context.save();
  if (progress.settings.screenShake && game.shakeTime > 0) {
    const strength = game.shakeTime * 28;
    context.translate((Math.random() - 0.5) * strength, (Math.random() - 0.5) * strength);
  }
  drawBackground();
  if (game.phase !== "loadout") {
    for (const destructible of game.destructibles) drawDestructible(destructible);
    for (const enemy of game.enemies) drawEnemy(enemy);
    drawCombatObjects();
    drawPlayer();
  }
  context.restore();
}

function getTestSnapshot() {
  return {
    phase: game.phase,
    wave: game.wave,
    waveTime: Number(game.waveTime.toFixed(2)),
    danger: game.danger,
    level: game.level,
    experience: game.experience,
    materials: game.materials,
    waveKills: game.waveKills,
    totalKills: game.totalKills,
    characterTrait: game.selectedCharacter?.trait ?? null,
    characterOrigin: game.selectedCharacter?.origin ?? null,
    curseLevel: getCurseLevel(),
    activeEvent: game.activeEvent?.id ?? null,
    completedEvents: [...game.completedEvents],
    ownedItemTraits: game.items
      .map((itemId) => ITEMS.find((item) => item.id === itemId)?.trait)
      .filter(Boolean),
    effectiveStats: {
      damage: Number(getEffectiveStat("damage").toFixed(2)),
      attackSpeed: Number(getEffectiveStat("attackSpeed").toFixed(2)),
      armor: Number(getEffectiveStat("armor").toFixed(2)),
      speed: Number(getEffectiveStat("speed").toFixed(2)),
      luck: Number(getEffectiveStat("luck").toFixed(2)),
      harvesting: Number(getEffectiveStat("harvesting").toFixed(2)),
    },
    inventory: game.inventory.map((weapon) => ({
      id: weapon.id,
      rarity: weapon.rarity,
      evolved: weapon.evolved,
      evolution: getWeaponEvolution(weapon)?.name ?? null,
      damage: Math.round(getWeaponDamage(weapon)),
    })),
    enemies: game.enemies.length,
    enemySample: game.enemies[0] ? {
      id: game.enemies[0].type,
      health: Number(game.enemies[0].health.toFixed(2)),
      maxHealth: Number(game.enemies[0].maxHealth.toFixed(2)),
      damage: Number(game.enemies[0].damage.toFixed(2)),
      material: game.enemies[0].material,
    } : null,
    enemyRanks: game.enemies.reduce((counts, enemy) => ({ ...counts, [enemy.rank]: (counts[enemy.rank] ?? 0) + 1 }), {}),
    enemyBehaviors: game.enemies.reduce((counts, enemy) => ({ ...counts, [enemy.behavior]: (counts[enemy.behavior] ?? 0) + 1 }), {}),
    enemyTraits: game.enemies.reduce((counts, enemy) => {
      for (const traitId of enemy.traits) counts[traitId] = (counts[traitId] ?? 0) + 1;
      return counts;
    }, {}),
    enemyProjectiles: game.enemyProjectiles.length,
    destructibles: game.destructibles.length,
    consumables: game.consumables.length,
    playerHealth: Math.round(player.health),
    playerMaxHealth: Math.round(getEffectiveStat("maxHealth")),
    specials: game.enemies
      .filter((enemy) => enemy.rank !== "normal")
      .map((enemy) => ({
        id: enemy.type,
        rank: enemy.rank,
        health: Math.round(enemy.health),
        maxHealth: Math.round(enemy.maxHealth),
        traits: [...enemy.traits],
        eliteSkill: enemy.eliteSkill?.name ?? null,
        eliteSkillTimer: Number((enemy.eliteSkillTimer ?? 0).toFixed(2)),
      })),
    activeBurns: game.enemies.filter((enemy) => enemy.burnRemaining > 0).length,
    activeSlows: game.enemies.filter((enemy) => enemy.slowRemaining > 0).length,
    metrics: { ...game.metrics },
    progress: {
      runs: progress.runs,
      wins: progress.wins,
      bestWave: progress.bestWave,
      highestDangerUnlocked: progress.highestDangerUnlocked,
      characters: progress.unlockedCharacters.length,
      weapons: progress.unlockedWeapons.length,
      items: progress.unlockedItems.length,
      enemies: progress.discoveredEnemies.length,
    },
    settings: { ...progress.settings },
    floatingTexts: game.floatingTexts.length,
    shakeTime: Number(game.shakeTime.toFixed(3)),
    traitState: { ...game.traitState },
  };
}

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - game.lastFrameTime) / 1000, 0.05);
  game.lastFrameTime = currentTime;
  if (game.phase === "wave" && !game.paused) updateWave(deltaTime);
  render();
  if (localTestMode) canvas.dataset.testState = JSON.stringify(getTestSnapshot());
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
  progress.settings.soundEnabled = audio.enabled;
  ui.soundToggle.setAttribute("aria-pressed", String(audio.enabled));
  ui.soundToggle.textContent = audio.enabled ? "音效：开" : "音效：关";
  if (audio.enabled) ensureAudio();
  saveProgress(progress, localTestMode);
});

ui.collectionButton.addEventListener("click", () => {
  renderCollection();
  ui.collectionPanel.hidden = false;
});
ui.collectionClose.addEventListener("click", () => { ui.collectionPanel.hidden = true; });
ui.helpButton.addEventListener("click", () => { ui.helpPanel.hidden = false; });
ui.helpClose.addEventListener("click", () => {
  ui.helpPanel.hidden = true;
  progress.tutorialSeen = true;
  saveProgress(progress, localTestMode);
});
ui.settingsButton.addEventListener("click", () => {
  renderSettings();
  ui.settingsPanel.hidden = false;
});
ui.settingsClose.addEventListener("click", () => { ui.settingsPanel.hidden = true; });
ui.volumeSlider.addEventListener("input", () => {
  progress.settings.masterVolume = Number(ui.volumeSlider.value) / 100;
  ui.volumeValue.textContent = `${ui.volumeSlider.value}%`;
  persistSettings();
});
ui.shakeToggle.addEventListener("change", () => {
  progress.settings.screenShake = ui.shakeToggle.checked;
  saveProgress(progress, localTestMode);
});
ui.damageNumberToggle.addEventListener("change", () => {
  progress.settings.damageNumbers = ui.damageNumberToggle.checked;
  saveProgress(progress, localTestMode);
});
ui.resetSaveButton.addEventListener("click", () => {
  if (ui.resetSaveButton.dataset.confirming !== "true") {
    ui.resetSaveButton.dataset.confirming = "true";
    ui.resetSaveButton.textContent = "再次点击确认重置";
    return;
  }
  progress = resetProgress({
    testMode: localTestMode,
    lockedTest: lockedTestProgress,
    characterIds,
    weaponIds,
    itemIds,
    enemyIds,
    maxDanger: DANGER_LEVELS.length - 1,
  });
  game.danger = 0;
  persistSettings();
  ui.settingsPanel.hidden = true;
  showCharacterSelection();
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

persistSettings();
showCharacterSelection();
if (!progress.tutorialSeen) ui.helpPanel.hidden = false;
if (localTestMode) {
  window.__gameTest = {
    snapshot: getTestSnapshot,
  };
}
requestAnimationFrame((time) => {
  game.lastFrameTime = time;
  requestAnimationFrame(gameLoop);
});
