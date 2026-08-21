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
  "工程": { icon: "⚙️", stat: "engineering", tiers: [[2, 2], [3, 4], [4, 7], [5, 10], [6, 14]] },
  "爆破": { icon: "💥", stat: "damage", tiers: [[2, 3], [3, 6], [4, 10], [5, 14], [6, 19]] },
  "利刃": { icon: "🗡️", stat: "meleeDamage", tiers: [[2, 2], [3, 4], [4, 7], [5, 10], [6, 14]] },
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
  {
    id: "ember_gardener",
    icon: "🔥",
    name: "余烬园丁",
    tagline: "擅长燃烧与元素武器",
    color: "#c96f49",
    modifiers: { elementalDamage: 5, damage: 5, armor: -2 },
    rules: ["+5 元素伤害", "+5% 伤害", "-2 护甲"],
    allowedWeapons: ["ember_orb", "spark_twig", "magma_fruit"],
  },
  {
    id: "gear_tender",
    icon: "⚙️",
    name: "齿轮培育员",
    tagline: "用工程装置远程清理战场",
    color: "#b88758",
    modifiers: { engineering: 7, harvesting: 3, meleeDamage: -3 },
    rules: ["+7 工程", "+3 收获", "-3 近战伤害"],
    allowedWeapons: ["sentry_seed", "gear_bee", "spore_mine"],
  },
  {
    id: "crystal_duelist",
    icon: "💎",
    name: "晶刃决斗家",
    tagline: "高暴击的近战玻璃炮",
    color: "#a66bc1",
    modifiers: { meleeDamage: 6, critChance: 12, maxHealth: -15 },
    rules: ["+6 近战伤害", "+12% 暴击率", "-15 最大生命"],
    allowedWeapons: ["crystal_knife", "vine_whip", "root_saw"],
  },
  {
    id: "pollen_alchemist",
    icon: "🧪",
    name: "花粉炼金师",
    tagline: "用范围攻击制造连锁反应",
    color: "#bd8c45",
    modifiers: { elementalDamage: 3, rangedDamage: 3, range: 25 },
    rules: ["+3 元素伤害", "+3 远程伤害", "+25 射程"],
    allowedWeapons: ["pollen_blaster", "magma_fruit", "frost_pod"],
  },
  {
    id: "moon_hunter",
    icon: "🌙",
    name: "月影猎手",
    tagline: "远距离精准射击与弹射",
    color: "#677fc2",
    modifiers: { rangedDamage: 5, range: 50, speed: -6 },
    rules: ["+5 远程伤害", "+50 射程", "-6% 速度"],
    allowedWeapons: ["moon_bow", "needle_rifle", "seed_launcher"],
  },
  {
    id: "storm_runner",
    icon: "🌩️",
    name: "风暴跑者",
    tagline: "高速移动并频繁释放充能武器",
    color: "#6e9cb4",
    modifiers: { speed: 14, attackSpeed: 12, armor: -3 },
    rules: ["+14% 移动速度", "+12% 攻击速度", "-3 护甲"],
    allowedWeapons: ["lightning_reed", "spark_twig", "pulse_coil"],
  },
  {
    id: "field_medic",
    icon: "💚",
    name: "苔原医师",
    tagline: "恢复能力强，输出较低",
    color: "#759c64",
    modifiers: { healthRegen: 7, lifeSteal: 5, damage: -10 },
    rules: ["+7 生命恢复", "+5% 生命偷取", "-10% 伤害"],
    allowedWeapons: ["vine_whip", "sapling_spear", "frost_pod"],
  },
  {
    id: "scrap_collector",
    icon: "🧲",
    name: "废料收集者",
    tagline: "拾取和经济优秀，前期战斗较弱",
    color: "#9b845d",
    modifiers: { pickupRange: 80, harvesting: 12, damage: -12 },
    rules: ["+80 拾取范围", "+12 收获", "-12% 伤害"],
    allowedWeapons: ["pebble_sling", "gear_bee", "root_club"],
  },
  {
    id: "sun_breaker",
    icon: "☀️",
    name: "日冕破阵者",
    tagline: "缓慢但擅长重型爆破",
    color: "#d39a3d",
    modifiers: { damage: 12, armor: 4, attackSpeed: -15 },
    rules: ["+12% 伤害", "+4 护甲", "-15% 攻击速度"],
    allowedWeapons: ["sun_cannon", "bark_hammer", "magma_fruit"],
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
  sapling_spear: {
    id: "sapling_spear", icon: "🌿", name: "幼苗长矛", type: "melee", tags: ["植物", "精准"],
    description: "向前刺出较远的一击。", baseDamage: 28, scaling: { meleeDamage: 1 }, cooldown: 0.92, range: 108, price: 17, knockback: 15,
  },
  bark_hammer: {
    id: "bark_hammer", icon: "🔨", name: "树皮重锤", type: "melee", tags: ["钝击", "植物"],
    description: "缓慢挥击，造成高伤害和强击退。", baseDamage: 43, scaling: { meleeDamage: 1.2 }, cooldown: 1.28, range: 82, price: 22, knockback: 36,
  },
  vine_whip: {
    id: "vine_whip", icon: "🪢", name: "藤蔓长鞭", type: "melee", tags: ["植物", "灵巧"],
    description: "攻击范围很长的快速横扫。", baseDamage: 18, scaling: { meleeDamage: 0.75 }, cooldown: 0.54, range: 128, price: 19, knockback: 10,
  },
  crystal_knife: {
    id: "crystal_knife", icon: "🔪", name: "晶片短刃", type: "melee", tags: ["利刃", "精准"],
    description: "迅速刺击，适合暴击构筑。", baseDamage: 16, scaling: { meleeDamage: 0.9 }, cooldown: 0.38, range: 58, price: 18, knockback: 5,
  },
  comet_mace: {
    id: "comet_mace", icon: "☄️", name: "彗核钉锤", type: "melee", tags: ["元素", "钝击"],
    description: "带着灼热余波砸向近处敌人。", baseDamage: 33, scaling: { meleeDamage: 0.7, elementalDamage: 0.65 }, cooldown: 0.96, range: 88, price: 23, knockback: 25, burnDamage: 4, burnDuration: 2.5,
  },
  seed_shotgun: {
    id: "seed_shotgun", icon: "🌾", name: "种荚喷筒", type: "ranged", tags: ["植物", "钝击"],
    description: "一次喷出五颗近距离种子。", baseDamage: 7, scaling: { rangedDamage: 0.45 }, cooldown: 0.92, range: 280, projectileSpeed: 470, projectileCount: 5, spread: 0.18, price: 22, knockback: 9,
  },
  needle_rifle: {
    id: "needle_rifle", icon: "🪡", name: "晶针步枪", type: "ranged", tags: ["精准", "利刃"],
    description: "高速晶针可以穿透两个目标。", baseDamage: 21, scaling: { rangedDamage: 0.9 }, cooldown: 0.78, range: 620, projectileSpeed: 760, pierce: 2, price: 24, knockback: 5,
  },
  pollen_blaster: {
    id: "pollen_blaster", icon: "🌼", name: "花粉迸射器", type: "ranged", tags: ["植物", "元素"],
    description: "发射三团带燃烧效果的花粉。", baseDamage: 8, scaling: { elementalDamage: 0.55 }, cooldown: 0.68, range: 360, projectileSpeed: 410, projectileCount: 3, spread: 0.14, burnDamage: 3, burnDuration: 2, price: 21, knockback: 3, projectileColor: "#f3c75f",
  },
  moon_bow: {
    id: "moon_bow", icon: "🏹", name: "月芽长弓", type: "ranged", tags: ["精准", "充能"],
    description: "月光箭命中后会寻找下一个目标。", baseDamage: 25, scaling: { rangedDamage: 1 }, cooldown: 1.02, range: 590, projectileSpeed: 670, bounces: 1, price: 25, knockback: 8, projectileColor: "#bad7ff",
  },
  pebble_sling: {
    id: "pebble_sling", icon: "🪨", name: "卵石投索", type: "ranged", tags: ["钝击", "灵巧"],
    description: "便宜可靠，能明显击退敌人。", baseDamage: 15, scaling: { rangedDamage: 0.65 }, cooldown: 0.5, range: 420, projectileSpeed: 520, price: 15, knockback: 18,
  },
  ember_orb: {
    id: "ember_orb", icon: "🔥", name: "余烬法球", type: "ranged", tags: ["元素", "充能"],
    description: "灼烧命中的敌人。", baseDamage: 13, scaling: { elementalDamage: 0.8 }, cooldown: 0.62, range: 430, projectileSpeed: 450, burnDamage: 5, burnDuration: 3, price: 20, knockback: 4, projectileColor: "#ff8a4c",
  },
  frost_pod: {
    id: "frost_pod", icon: "❄️", name: "霜囊投射器", type: "ranged", tags: ["元素", "植物"],
    description: "命中后短暂减慢敌人。", baseDamage: 11, scaling: { elementalDamage: 0.7 }, cooldown: 0.58, range: 420, projectileSpeed: 430, slowFactor: 0.58, slowDuration: 2, price: 21, knockback: 4, projectileColor: "#8de5f4",
  },
  lightning_reed: {
    id: "lightning_reed", icon: "🌩️", name: "雷鸣芦苇", type: "ranged", tags: ["元素", "充能"],
    description: "电弧能在多个目标间弹射。", baseDamage: 12, scaling: { elementalDamage: 0.75 }, cooldown: 0.72, range: 460, projectileSpeed: 600, bounces: 2, price: 24, knockback: 2, projectileColor: "#e9f276",
  },
  magma_fruit: {
    id: "magma_fruit", icon: "🌋", name: "熔核果实", type: "ranged", tags: ["元素", "爆破"],
    description: "命中后爆炸并点燃一片区域。", baseDamage: 19, scaling: { elementalDamage: 0.9 }, cooldown: 1.18, range: 420, projectileSpeed: 350, explosionRadius: 82, burnDamage: 4, burnDuration: 2.5, price: 28, knockback: 16, projectileSize: 10, projectileColor: "#ff6b42",
  },
  spore_mine: {
    id: "spore_mine", icon: "💣", name: "孢子雷弹", type: "engineering", tags: ["工程", "爆破"],
    description: "缓慢飞行，撞击后发生大范围爆炸。", baseDamage: 22, scaling: { engineering: 1.1 }, cooldown: 1.35, range: 360, projectileSpeed: 280, explosionRadius: 100, price: 26, knockback: 24, projectileSize: 11, projectileColor: "#b8d86b",
  },
  sentry_seed: {
    id: "sentry_seed", icon: "🔩", name: "哨戒种核", type: "engineering", tags: ["工程", "植物"],
    description: "高速发射工程强化的硬壳种子。", baseDamage: 12, scaling: { engineering: 0.9 }, cooldown: 0.46, range: 500, projectileSpeed: 650, price: 20, knockback: 5, projectileColor: "#c8b47b",
  },
  gear_bee: {
    id: "gear_bee", icon: "🐝", name: "齿轮蜂群", type: "engineering", tags: ["工程", "灵巧"],
    description: "自动蜂弹会弹向附近另一个敌人。", baseDamage: 9, scaling: { engineering: 0.72 }, cooldown: 0.4, range: 450, projectileSpeed: 520, bounces: 1, price: 22, knockback: 3, projectileColor: "#f2c94c",
  },
  pulse_coil: {
    id: "pulse_coil", icon: "🌀", name: "脉冲线圈", type: "engineering", tags: ["工程", "充能"],
    description: "发射可穿透敌人的压缩脉冲。", baseDamage: 17, scaling: { engineering: 0.9, elementalDamage: 0.35 }, cooldown: 0.78, range: 520, projectileSpeed: 610, pierce: 3, price: 25, knockback: 11, projectileColor: "#72e0da",
  },
  root_saw: {
    id: "root_saw", icon: "⚙️", name: "根须圆锯", type: "melee", tags: ["工程", "利刃"],
    description: "快速切割近处目标。", baseDamage: 20, scaling: { meleeDamage: 0.65, engineering: 0.55 }, cooldown: 0.42, range: 68, price: 23, knockback: 7,
  },
  sun_cannon: {
    id: "sun_cannon", icon: "☀️", name: "日冕重炮", type: "ranged", tags: ["爆破", "充能"],
    description: "发射缓慢但威力巨大的爆裂光团。", baseDamage: 38, scaling: { rangedDamage: 0.9, elementalDamage: 0.6 }, cooldown: 1.62, range: 560, projectileSpeed: 330, explosionRadius: 120, price: 32, knockback: 32, projectileSize: 13, projectileColor: "#ffe174",
  },
};

const PERCENT_STATS = new Set(["lifeSteal", "damage", "attackSpeed", "critChance", "dodge", "speed"]);
const ITEM_STAT_SERIES = [
  ["health", "❤️", "maxHealth", [5, 9, 14, 20], ["小块薯粮", "根茎浓汤", "丰收餐盒", "古树心核"], 10],
  ["regen", "💚", "healthRegen", [1, 2, 4, 7], ["湿润苔片", "修复苔藓", "复苏菌毯", "不息树脂"], 12],
  ["leech", "🩸", "lifeSteal", [2, 4, 7, 11], ["吸露芽", "赤藤环", "汲取花冠", "血月根系"], 13],
  ["damage", "💥", "damage", [3, 6, 10, 15], ["战斗树液", "锐化药剂", "狂热孢粉", "破阵结晶"], 14],
  ["melee", "🥊", "meleeDamage", [1, 2, 4, 7], ["粗糙握带", "硬根护腕", "晶刃手套", "巨木臂铠"], 12],
  ["ranged", "🎯", "rangedDamage", [1, 2, 4, 7], ["校准叶片", "透镜种荚", "鹰眼花粉", "星轨瞄具"], 12],
  ["element", "✨", "elementalDamage", [1, 2, 4, 7], ["温热石屑", "带电花蕊", "虹彩晶簇", "极光核心"], 12],
  ["speed_attack", "⚡", "attackSpeed", [4, 7, 11, 16], ["柔韧手套", "发条叶轮", "疾风轴承", "闪电节拍器"], 13],
  ["crit", "🍒", "critChance", [3, 5, 8, 12], ["红浆果", "尖刺幸运符", "猎手徽记", "命运棱镜"], 12],
  ["engineering", "⚙️", "engineering", [1, 2, 4, 7], ["备用螺帽", "铜线根须", "自律齿轮", "远古机芯"], 13],
  ["range", "🔭", "range", [12, 22, 36, 55], ["短柄望筒", "露珠透镜", "折光花盘", "天穹测距仪"], 11],
  ["armor", "🛡️", "armor", [1, 2, 4, 6], ["树皮护片", "岩壳肩垫", "层叠甲叶", "堡垒外壳"], 13],
  ["dodge", "🪶", "dodge", [3, 5, 8, 12], ["轻羽披肩", "迷踪叶片", "幻步斗篷", "风之残影"], 12],
  ["move", "👟", "speed", [3, 6, 10, 15], ["田野短靴", "弹力根须", "疾行护胫", "逐风足环"], 11],
  ["luck", "🍀", "luck", [4, 8, 14, 22], ["四叶幼芽", "幸运孢子", "愿望果核", "群星苜蓿"], 12],
  ["harvest", "🌾", "harvesting", [3, 6, 10, 16], ["小袋堆肥", "温热堆肥", "丰产菌土", "黄金育床"], 13],
  ["pickup", "🧲", "pickupRange", [15, 30, 50, 80], ["铁屑根毛", "磁性块茎", "牵引花环", "引力种核"], 10],
  ["knockback", "🫸", "knockback", [2, 4, 7, 11], ["弹性木片", "震荡果壳", "冲击树瘤", "推山年轮"], 11],
];

const STAT_ITEMS = ITEM_STAT_SERIES.flatMap(([idPrefix, icon, stat, amounts, names, basePrice]) => (
  amounts.map((amount, index) => ({
    id: `${idPrefix}_${index + 1}`,
    icon,
    name: names[index],
    price: basePrice + index * 7,
    modifiers: { [stat]: amount },
    description: `+${amount}${PERCENT_STATS.has(stat) ? "%" : ""} ${STAT_LABELS[stat]}`,
  }))
));

const HYBRID_ITEMS = [
  { id: "glass_sprout", icon: "🌱", name: "玻璃幼芽", price: 24, modifiers: { damage: 12, maxHealth: -10 }, description: "+12% 伤害，-10 最大生命" },
  { id: "iron_boots", icon: "🥾", name: "铸铁田靴", price: 22, modifiers: { armor: 3, speed: -5 }, description: "+3 护甲，-5% 速度" },
  { id: "wild_scope", icon: "🔬", name: "野性瞄镜", price: 23, modifiers: { rangedDamage: 4, range: 30, attackSpeed: -6 }, description: "+4 远程伤害，+30 射程，-6% 攻击速度" },
  { id: "thorn_crown", icon: "👑", name: "荆棘王冠", price: 25, modifiers: { meleeDamage: 5, critChance: 7, armor: -2 }, description: "+5 近战伤害，+7% 暴击率，-2 护甲" },
  { id: "storm_battery", icon: "🔋", name: "风暴电池", price: 26, modifiers: { elementalDamage: 5, attackSpeed: 8, harvesting: -4 }, description: "+5 元素伤害，+8% 攻击速度，-4 收获" },
  { id: "greedy_magnet", icon: "🧲", name: "贪食磁核", price: 21, modifiers: { pickupRange: 55, harvesting: 8, speed: -4 }, description: "+55 拾取范围，+8 收获，-4% 速度" },
  { id: "repair_drone", icon: "🛠️", name: "修复蜂机", price: 27, modifiers: { engineering: 5, healthRegen: 3, damage: -5 }, description: "+5 工程，+3 生命恢复，-5% 伤害" },
  { id: "moon_charm", icon: "🌙", name: "月相护符", price: 28, modifiers: { dodge: 10, luck: 12, maxHealth: -8 }, description: "+10% 闪避，+12 幸运，-8 最大生命" },
];

export const ITEMS = [...STAT_ITEMS, ...HYBRID_ITEMS];

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
