export const MAX_WEAPON_SLOTS = 6;
export const MAX_WAVES = 20;

export const RARITIES = [
  { id: 1, name: "普通", color: "#b9c2b3", multiplier: 1 },
  { id: 2, name: "精良", color: "#75c58d", multiplier: 1.35 },
  { id: 3, name: "稀有", color: "#6ba9e8", multiplier: 1.8 },
  { id: 4, name: "传说", color: "#d78aea", multiplier: 2.45 },
];

export const WEAPON_TAG_BONUSES = {
  "植物": { icon: "🌿", stat: "harvesting", tiers: [[2, 3], [3, 6], [4, 10], [5, 15], [6, 21]] },
  "精准": { icon: "🎯", stat: "rangedDamage", tiers: [[2, 2], [3, 4], [4, 7], [5, 10], [6, 14]] },
  "钝击": { icon: "🛡️", stat: "armor", tiers: [[2, 2], [3, 4], [4, 6], [5, 8], [6, 11]] },
  "元素": { icon: "✨", stat: "elementalDamage", tiers: [[2, 2], [3, 4], [4, 7], [5, 10], [6, 14]] },
  "充能": { icon: "⚡", stat: "attackSpeed", tiers: [[2, 5], [3, 9], [4, 14], [5, 20], [6, 27]] },
  "灵巧": { icon: "🍃", stat: "dodge", tiers: [[2, 3], [3, 6], [4, 10], [5, 14], [6, 19]] },
};

export const BASE_STATS = {
  maxHealth: 100,
  healthRegen: 0,
  lifeSteal: 0,
  damage: 0,
  meleeDamage: 0,
  rangedDamage: 0,
  elementalDamage: 0,
  attackSpeed: 0,
  critChance: 3,
  engineering: 0,
  range: 0,
  armor: 0,
  dodge: 0,
  speed: 0,
  luck: 0,
  harvesting: 0,
  pickupRange: 90,
  knockback: 0,
};

export const STAT_LABELS = {
  maxHealth: "最大生命",
  healthRegen: "生命恢复",
  lifeSteal: "生命偷取",
  damage: "伤害",
  meleeDamage: "近战伤害",
  rangedDamage: "远程伤害",
  elementalDamage: "元素伤害",
  attackSpeed: "攻击速度",
  critChance: "暴击率",
  engineering: "工程",
  range: "射程",
  armor: "护甲",
  dodge: "闪避",
  speed: "速度",
  luck: "幸运",
  harvesting: "收获",
  pickupRange: "拾取范围",
  knockback: "击退",
};

export const CHARACTERS = [
  {
    id: "trailblazer",
    icon: "🌱",
    name: "嫩芽先锋",
    tagline: "均衡、稳定，适合第一次远征",
    color: "#c9864d",
    modifiers: { maxHealth: 10, harvesting: 5, pickupRange: 20 },
    rules: ["每波结束额外获得 5 点收获材料", "拾取范围更大"],
    allowedWeapons: ["seed_launcher", "root_club", "spark_twig"],
  },
  {
    id: "wind_scout",
    icon: "🍃",
    name: "风行侦察员",
    tagline: "移动和攻速更快，但身体较脆",
    color: "#ca9855",
    modifiers: { maxHealth: -20, speed: 18, attackSpeed: 18, dodge: 8 },
    rules: ["+18% 攻击速度", "+18% 移动速度", "-20 最大生命"],
    allowedWeapons: ["seed_launcher", "spark_twig", "thorn_disc"],
  },
  {
    id: "stone_keeper",
    icon: "🪨",
    name: "岩壳守卫",
    tagline: "生命和护甲很高，移动较慢",
    color: "#a36f4e",
    modifiers: { maxHealth: 30, armor: 6, speed: -12, meleeDamage: 4 },
    rules: ["+30 最大生命", "+6 护甲", "-12% 移动速度"],
    allowedWeapons: ["root_club", "thorn_disc"],
  },
];

export const WEAPONS = {
  seed_launcher: {
    id: "seed_launcher",
    icon: "🌰",
    name: "种子发射器",
    type: "ranged",
    tags: ["植物", "精准"],
    description: "向最近的敌人发射高速种子。",
    baseDamage: 13,
    scaling: { rangedDamage: 0.8 },
    cooldown: 0.58,
    range: 470,
    projectileSpeed: 560,
    price: 14,
    knockback: 7,
  },
  root_club: {
    id: "root_club",
    icon: "🥕",
    name: "根须短棍",
    type: "melee",
    tags: ["植物", "钝击"],
    description: "横扫附近敌人，造成较强击退。",
    baseDamage: 24,
    scaling: { meleeDamage: 1 },
    cooldown: 0.86,
    range: 78,
    price: 15,
    knockback: 22,
  },
  spark_twig: {
    id: "spark_twig",
    icon: "⚡",
    name: "星火嫩枝",
    type: "ranged",
    tags: ["元素", "充能"],
    description: "发射发光孢子，受到元素伤害加成。",
    baseDamage: 10,
    scaling: { elementalDamage: 0.9 },
    cooldown: 0.44,
    range: 410,
    projectileSpeed: 460,
    price: 16,
    knockback: 4,
    projectileColor: "#d990ef",
  },
  thorn_disc: {
    id: "thorn_disc",
    icon: "🍃",
    name: "荆叶飞盘",
    type: "ranged",
    tags: ["植物", "灵巧"],
    description: "较慢但宽大的叶片弹丸，可穿透一个目标。",
    baseDamage: 17,
    scaling: { rangedDamage: 0.55, meleeDamage: 0.35 },
    cooldown: 0.72,
    range: 390,
    projectileSpeed: 390,
    projectileSize: 8,
    pierce: 1,
    price: 18,
    knockback: 10,
    projectileColor: "#91c65d",
  },
};

export const ITEMS = [
  { id: "bark_plate", icon: "🛡️", name: "树皮护片", price: 16, modifiers: { armor: 2 }, description: "+2 护甲" },
  { id: "field_boots", icon: "👟", name: "田野短靴", price: 15, modifiers: { speed: 6 }, description: "+6% 速度" },
  { id: "warm_compost", icon: "🪴", name: "温热堆肥", price: 18, modifiers: { harvesting: 6 }, description: "+6 收获" },
  { id: "soft_glove", icon: "🧤", name: "柔韧手套", price: 17, modifiers: { attackSpeed: 7 }, description: "+7% 攻击速度" },
  { id: "scope_seed", icon: "🔭", name: "透镜种荚", price: 19, modifiers: { range: 20, rangedDamage: 2 }, description: "+20 射程，+2 远程伤害" },
  { id: "hearty_soup", icon: "🥣", name: "根茎浓汤", price: 20, modifiers: { maxHealth: 12 }, description: "+12 最大生命" },
  { id: "lucky_spore", icon: "🍀", name: "幸运孢子", price: 18, modifiers: { luck: 8 }, description: "+8 幸运" },
  { id: "repair_moss", icon: "🧶", name: "修复苔藓", price: 21, modifiers: { healthRegen: 3 }, description: "+3 生命恢复" },
  { id: "red_berry", icon: "🍒", name: "红浆果", price: 17, modifiers: { critChance: 5 }, description: "+5% 暴击率" },
  { id: "battle_sap", icon: "🧪", name: "战斗树液", price: 22, modifiers: { damage: 7 }, description: "+7% 伤害" },
];

export const LEVEL_UPGRADES = [
  { id: "vitality", icon: "❤️", name: "旺盛生机", modifiers: { maxHealth: 8 }, description: "+8 最大生命" },
  { id: "rapid_growth", icon: "⚡", name: "快速生长", modifiers: { attackSpeed: 6 }, description: "+6% 攻击速度" },
  { id: "sharp_seed", icon: "🎯", name: "尖锐种壳", modifiers: { rangedDamage: 2 }, description: "+2 远程伤害" },
  { id: "hard_root", icon: "🥊", name: "硬化根须", modifiers: { meleeDamage: 2 }, description: "+2 近战伤害" },
  { id: "charged_pollen", icon: "✨", name: "带电花粉", modifiers: { elementalDamage: 2 }, description: "+2 元素伤害" },
  { id: "light_step", icon: "👟", name: "轻快步伐", modifiers: { speed: 5 }, description: "+5% 速度" },
  { id: "thick_bark", icon: "🛡️", name: "厚实树皮", modifiers: { armor: 2 }, description: "+2 护甲" },
  { id: "lucky_find", icon: "🍀", name: "意外发现", modifiers: { luck: 7 }, description: "+7 幸运" },
  { id: "wide_roots", icon: "🧲", name: "延展根系", modifiers: { pickupRange: 25 }, description: "+25 拾取范围" },
  { id: "seasonal_yield", icon: "🌾", name: "季节收成", modifiers: { harvesting: 5 }, description: "+5 收获" },
  { id: "steady_breath", icon: "💚", name: "平稳呼吸", modifiers: { healthRegen: 2 }, description: "+2 生命恢复" },
  { id: "battle_focus", icon: "💥", name: "战斗专注", modifiers: { damage: 5 }, description: "+5% 伤害" },
];

export const ENEMY_ARCHETYPES = {
  spore: { name: "漂浮孢子", color: "#914e61", light: "#c46c7f", radius: 18, health: 28, speed: 62, damage: 8, material: 1 },
  runner: { name: "疾行虫", color: "#d47a3f", light: "#f0b15e", radius: 12, health: 19, speed: 112, damage: 7, material: 1 },
  bulwark: { name: "岩壳怪", color: "#62727d", light: "#9eabb1", radius: 27, health: 82, speed: 40, damage: 15, material: 3 },
};

export function getWaveDefinition(wave) {
  const duration = wave < 5 ? 20 : wave < 10 ? 25 : wave < 15 ? 30 : wave < 20 ? 35 : 45;
  const types = ["spore"];
  if (wave >= 3) types.push("runner");
  if (wave >= 6) types.push("bulwark");
  return {
    wave,
    duration,
    types,
    spawnInterval: Math.max(0.34, 1.05 - wave * 0.035),
    healthMultiplier: 1 + (wave - 1) * 0.13,
    damageMultiplier: 1 + (wave - 1) * 0.08,
    speedMultiplier: Math.min(1.55, 1 + (wave - 1) * 0.018),
  };
}
