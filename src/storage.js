const SAVE_KEY = "potato-star-survivor-v2";

const STARTING_CHARACTERS = ["trailblazer", "wind_scout", "stone_keeper"];
const STARTING_WEAPON_COUNT = 8;
const STARTING_ITEM_COUNT = 24;

export function createDefaultProgress() {
  return {
    version: 1,
    runs: 0,
    wins: 0,
    bestWave: 0,
    highestDangerUnlocked: 0,
    unlockedCharacters: [...STARTING_CHARACTERS],
    unlockedWeapons: [],
    unlockedItems: [],
    discoveredEnemies: [],
    tutorialSeen: false,
    settings: {
      soundEnabled: true,
      masterVolume: 0.7,
      screenShake: true,
      damageNumbers: true,
    },
  };
}

function normalizeProgress(value, allWeaponIds, allItemIds) {
  const defaults = createDefaultProgress();
  const progress = value && typeof value === "object" ? value : {};
  return {
    ...defaults,
    ...progress,
    unlockedCharacters: Array.isArray(progress.unlockedCharacters) ? progress.unlockedCharacters : defaults.unlockedCharacters,
    unlockedWeapons: Array.isArray(progress.unlockedWeapons) && progress.unlockedWeapons.length > 0
      ? progress.unlockedWeapons.filter((id) => allWeaponIds.includes(id))
      : allWeaponIds.slice(0, STARTING_WEAPON_COUNT),
    unlockedItems: Array.isArray(progress.unlockedItems) && progress.unlockedItems.length > 0
      ? progress.unlockedItems.filter((id) => allItemIds.includes(id))
      : allItemIds.slice(0, STARTING_ITEM_COUNT),
    discoveredEnemies: Array.isArray(progress.discoveredEnemies) ? progress.discoveredEnemies : [],
    settings: { ...defaults.settings, ...(progress.settings ?? {}) },
  };
}

export function loadProgress({ testMode, lockedTest = false, characterIds, weaponIds, itemIds, enemyIds, maxDanger = 4 }) {
  if (testMode && !lockedTest) {
    return {
      ...createDefaultProgress(),
      highestDangerUnlocked: maxDanger,
      unlockedCharacters: [...characterIds],
      unlockedWeapons: [...weaponIds],
      unlockedItems: [...itemIds],
      discoveredEnemies: [...enemyIds],
      tutorialSeen: true,
    };
  }
  if (testMode && lockedTest) return normalizeProgress(null, weaponIds, itemIds);
  try {
    const stored = window.localStorage.getItem(SAVE_KEY);
    return normalizeProgress(stored ? JSON.parse(stored) : null, weaponIds, itemIds);
  } catch {
    return normalizeProgress(null, weaponIds, itemIds);
  }
}

export function saveProgress(progress, testMode = false) {
  if (testMode) return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  } catch {
    // 隐私模式或存储被禁用时，游戏仍可继续本次运行。
  }
}

export function resetProgress({ testMode, lockedTest = false, characterIds, weaponIds, itemIds, enemyIds, maxDanger = 4 }) {
  if (!testMode) {
    try { window.localStorage.removeItem(SAVE_KEY); } catch { /* 忽略不可用的存储。 */ }
  }
  return loadProgress({ testMode, lockedTest, characterIds, weaponIds, itemIds, enemyIds, maxDanger });
}

const CHARACTER_REQUIREMENTS = [
  { id: "ember_gardener", wave: 5 },
  { id: "gear_tender", wave: 8 },
  { id: "crystal_duelist", wave: 10 },
  { id: "pollen_alchemist", wave: 12 },
  { id: "moon_hunter", wave: 14 },
  { id: "storm_runner", wave: 16 },
  { id: "field_medic", wave: 18 },
  { id: "scrap_collector", wins: 1 },
  { id: "sun_breaker", dangerWin: 2 },
];

export function recordRunProgress(progress, result) {
  const beforeCharacters = new Set(progress.unlockedCharacters);
  const beforeWeapons = new Set(progress.unlockedWeapons);
  const beforeItems = new Set(progress.unlockedItems);
  const previousDanger = progress.highestDangerUnlocked;

  progress.runs += 1;
  progress.bestWave = Math.max(progress.bestWave, result.wave);
  if (result.won) {
    progress.wins += 1;
    if (result.danger >= progress.highestDangerUnlocked) {
      progress.highestDangerUnlocked = Math.min(result.maxDanger ?? 4, result.danger + 1);
    }
  }

  for (const requirement of CHARACTER_REQUIREMENTS) {
    const reachedWave = requirement.wave && progress.bestWave >= requirement.wave;
    const reachedWins = requirement.wins && progress.wins >= requirement.wins;
    const reachedDanger = requirement.dangerWin !== undefined && result.won && result.danger >= requirement.dangerWin;
    if ((reachedWave || reachedWins || reachedDanger) && !progress.unlockedCharacters.includes(requirement.id)) {
      progress.unlockedCharacters.push(requirement.id);
    }
  }

  const weaponTarget = Math.min(result.weaponIds.length, Math.max(
    progress.unlockedWeapons.length,
    STARTING_WEAPON_COUNT + Math.floor(progress.bestWave / 3) * 2 + progress.wins * 2,
  ));
  const itemTarget = Math.min(result.itemIds.length, Math.max(
    progress.unlockedItems.length,
    STARTING_ITEM_COUNT + progress.bestWave * 2 + progress.wins * 12,
  ));
  progress.unlockedWeapons = result.weaponIds.slice(0, weaponTarget);
  progress.unlockedItems = result.itemIds.slice(0, itemTarget);
  progress.discoveredEnemies = [...new Set([...progress.discoveredEnemies, ...result.encounteredEnemyIds])];

  return {
    characters: progress.unlockedCharacters.filter((id) => !beforeCharacters.has(id)),
    weapons: progress.unlockedWeapons.filter((id) => !beforeWeapons.has(id)),
    items: progress.unlockedItems.filter((id) => !beforeItems.has(id)),
    danger: progress.highestDangerUnlocked > previousDanger ? progress.highestDangerUnlocked : null,
  };
}
