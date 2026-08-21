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
    trait: { id: "seasoned_growth", name: "四季生长", description: "每波结束永久获得 +1 收获" },
    origin: { name: "先锋补给", description: "开局额外获得 8 材料", materials: 8 },
    rules: ["特性·四季生长：每波结束永久 +1 收获", "出身·先锋补给：开局 +8 材料", "+10 最大生命、+5 收获与更大拾取范围"],
    allowedWeapons: ["seed_launcher", "root_club", "spark_twig"],
  },
  {
    id: "wind_scout",
    icon: "🍃",
    name: "风行侦察员",
    tagline: "移动和攻速更快，但身体较脆",
    color: "#ca9855",
    modifiers: { maxHealth: -20, speed: 18, attackSpeed: 18, dodge: 8 },
    trait: { id: "tailwind", name: "顺风", description: "每 10% 速度额外提供 3.5% 伤害" },
    origin: { name: "轻装出发", description: "开局额外获得 +5% 速度", modifiers: { speed: 5 } },
    rules: ["特性·顺风：速度会转化为伤害", "出身·轻装出发：开局 +5% 速度", "+18% 攻速与速度，-20 最大生命"],
    allowedWeapons: ["seed_launcher", "spark_twig", "thorn_disc"],
  },
  {
    id: "stone_keeper",
    icon: "🪨",
    name: "岩壳守卫",
    tagline: "生命和护甲很高，移动较慢",
    color: "#a36f4e",
    modifiers: { maxHealth: 30, armor: 6, speed: -12, meleeDamage: 4 },
    trait: { id: "rooted_guard", name: "扎根", description: "静止 0.8 秒后额外获得 +4 护甲" },
    origin: { name: "祖岩碎片", description: "开局额外获得 +2 护甲", modifiers: { armor: 2 } },
    rules: ["特性·扎根：静止时额外 +4 护甲", "出身·祖岩碎片：开局 +2 护甲", "+30 生命与 +6 护甲，-12% 速度"],
    allowedWeapons: ["root_club", "thorn_disc"],
  },
  {
    id: "ember_gardener",
    icon: "🔥",
    name: "余烬园丁",
    tagline: "擅长燃烧与元素武器",
    color: "#c96f49",
    modifiers: { elementalDamage: 5, damage: 5, armor: -2 },
    trait: { id: "deep_kindling", name: "深燃", description: "施加的燃烧伤害提高 35%" },
    origin: { name: "余火种", description: "携带温热石屑开始远征", itemId: "element_1" },
    rules: ["特性·深燃：燃烧伤害提高 35%", "出身·余火种：自带温热石屑", "+5 元素、+5% 伤害，-2 护甲"],
    allowedWeapons: ["ember_orb", "spark_twig", "magma_fruit"],
  },
  {
    id: "gear_tender",
    icon: "⚙️",
    name: "齿轮培育员",
    tagline: "用工程装置远程清理战场",
    color: "#b88758",
    modifiers: { engineering: 7, harvesting: 3, meleeDamage: -3 },
    trait: { id: "overclock", name: "超频", description: "工程武器冷却时间缩短 20%" },
    origin: { name: "备用零件", description: "携带备用螺帽开始远征", itemId: "engineering_1" },
    rules: ["特性·超频：工程武器攻击更快", "出身·备用零件：自带备用螺帽", "+7 工程、+3 收获，-3 近战"],
    allowedWeapons: ["sentry_seed", "gear_bee", "spore_mine"],
  },
  {
    id: "crystal_duelist",
    icon: "💎",
    name: "晶刃决斗家",
    tagline: "高暴击的近战玻璃炮",
    color: "#a66bc1",
    modifiers: { meleeDamage: 6, critChance: 12, maxHealth: -15 },
    trait: { id: "perfect_edge", name: "完美切面", description: "暴击伤害从 180% 提高到 215%" },
    origin: { name: "棱镜训练", description: "开局额外获得 +5% 暴击率", modifiers: { critChance: 5 } },
    rules: ["特性·完美切面：暴击造成 215% 伤害", "出身·棱镜训练：开局 +5% 暴击", "+6 近战、+12% 暴击，-15 生命"],
    allowedWeapons: ["crystal_knife", "vine_whip", "root_saw"],
  },
  {
    id: "pollen_alchemist",
    icon: "🧪",
    name: "花粉炼金师",
    tagline: "用范围攻击制造连锁反应",
    color: "#bd8c45",
    modifiers: { elementalDamage: 3, rangedDamage: 3, range: 25 },
    trait: { id: "wide_reaction", name: "扩散反应", description: "爆炸半径提高 30%" },
    origin: { name: "长颈烧瓶", description: "开局额外获得 +20 射程", modifiers: { range: 20 } },
    rules: ["特性·扩散反应：爆炸范围提高 30%", "出身·长颈烧瓶：开局 +20 射程", "+3 元素与远程，+25 射程"],
    allowedWeapons: ["pollen_blaster", "magma_fruit", "frost_pod"],
  },
  {
    id: "moon_hunter",
    icon: "🌙",
    name: "月影猎手",
    tagline: "远距离精准射击与弹射",
    color: "#677fc2",
    modifiers: { rangedDamage: 5, range: 50, speed: -6 },
    trait: { id: "phase_arrow", name: "月相穿透", description: "所有远程弹丸额外穿透 1 个目标" },
    origin: { name: "月银武装", description: "初始武器直接提升为精良品质", weaponRarity: 2 },
    rules: ["特性·月相穿透：弹丸额外穿透 1 次", "出身·月银武装：初始武器为精良", "+5 远程、+50 射程，-6% 速度"],
    allowedWeapons: ["moon_bow", "needle_rifle", "seed_launcher"],
  },
  {
    id: "storm_runner",
    icon: "🌩️",
    name: "风暴跑者",
    tagline: "高速移动并频繁释放充能武器",
    color: "#6e9cb4",
    modifiers: { speed: 14, attackSpeed: 12, armor: -3 },
    trait: { id: "kinetic_charge", name: "动能充电", description: "每 10% 速度额外提供 4% 攻击速度" },
    origin: { name: "预充电", description: "开局额外获得 +6% 攻击速度", modifiers: { attackSpeed: 6 } },
    rules: ["特性·动能充电：速度会转化为攻击速度", "出身·预充电：开局 +6% 攻速", "+14% 速度、+12% 攻速，-3 护甲"],
    allowedWeapons: ["lightning_reed", "spark_twig", "pulse_coil"],
  },
  {
    id: "field_medic",
    icon: "💚",
    name: "苔原医师",
    tagline: "恢复能力强，输出较低",
    color: "#759c64",
    modifiers: { healthRegen: 7, lifeSteal: 5, damage: -10 },
    trait: { id: "field_triage", name: "战地分诊", description: "治疗果实的恢复量提高 50%" },
    origin: { name: "随身苔片", description: "携带湿润苔片开始远征", itemId: "regen_1" },
    rules: ["特性·战地分诊：果实治疗提高 50%", "出身·随身苔片：自带湿润苔片", "+7 恢复、+5% 偷取，-10% 伤害"],
    allowedWeapons: ["vine_whip", "sapling_spear", "frost_pod"],
  },
  {
    id: "scrap_collector",
    icon: "🧲",
    name: "废料收集者",
    tagline: "拾取和经济优秀，前期战斗较弱",
    color: "#9b845d",
    modifiers: { pickupRange: 80, harvesting: 12, damage: -12 },
    trait: { id: "salvage", name: "拆解回收", description: "敌人有 22% 概率额外掉落 1 材料" },
    origin: { name: "旧货本金", description: "开局额外获得 14 材料", materials: 14 },
    rules: ["特性·拆解回收：击败敌人可能额外掉落材料", "出身·旧货本金：开局 +14 材料", "+80 拾取、+12 收获，-12% 伤害"],
    allowedWeapons: ["pebble_sling", "gear_bee", "root_club"],
  },
  {
    id: "sun_breaker",
    icon: "☀️",
    name: "日冕破阵者",
    tagline: "缓慢但擅长重型爆破",
    color: "#d39a3d",
    modifiers: { damage: 12, armor: 4, attackSpeed: -15 },
    trait: { id: "heavy_payload", name: "重型装药", description: "爆炸伤害和范围提高 25%" },
    origin: { name: "破阵火药", description: "开局额外获得 +5% 伤害", modifiers: { damage: 5 } },
    rules: ["特性·重型装药：爆炸伤害与范围提高 25%", "出身·破阵火药：开局 +5% 伤害", "+12% 伤害、+4 护甲，-15% 攻速"],
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

export const WEAPON_EVOLUTIONS = {
  seed_launcher: { icon: "🌳", name: "千籽星树", description: "额外发射 1 枚种子，伤害提高 15%", cost: 38, damageMultiplier: 1.15, projectileCountBonus: 1 },
  root_club: { icon: "🪵", name: "古根震锤", description: "攻击范围提高 35%，击退翻倍", cost: 36, damageMultiplier: 1.2, rangeMultiplier: 1.35, knockbackMultiplier: 2 },
  spark_twig: { icon: "⚡", name: "雷冠神枝", description: "攻击更快，并额外弹射 2 次", cost: 40, damageMultiplier: 1.12, cooldownMultiplier: 0.78, bounceBonus: 2 },
  crystal_knife: { icon: "💠", name: "无瑕晶锋", description: "伤害提高 30%，攻击间隔缩短 15%", cost: 42, damageMultiplier: 1.3, cooldownMultiplier: 0.85 },
  moon_bow: { icon: "🌕", name: "满月追猎弓", description: "额外穿透 2 个目标并弹射 1 次", cost: 46, damageMultiplier: 1.18, pierceBonus: 2, bounceBonus: 1 },
  magma_fruit: { icon: "🌋", name: "星核熔果", description: "爆炸范围提高 55%，燃烧伤害提高 50%", cost: 48, damageMultiplier: 1.2, explosionRadiusMultiplier: 1.55, burnMultiplier: 1.5 },
  gear_bee: { icon: "🐝", name: "蜂巢主机", description: "额外发射 1 枚蜂弹并多弹射 2 次", cost: 44, damageMultiplier: 1.1, projectileCountBonus: 1, bounceBonus: 2 },
  sun_cannon: { icon: "🌞", name: "日冕灭星炮", description: "伤害提高 45%，爆炸范围提高 30%", cost: 54, damageMultiplier: 1.45, explosionRadiusMultiplier: 1.3 },
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
    maxCount: index === 3 ? 1 : 3,
  }))
));

const HYBRID_ITEMS = [
  { id: "glass_sprout", icon: "🌱", name: "玻璃幼芽", price: 24, unique: true, group: "core_stance", trait: { id: "opening_bloom", name: "初绽", description: "对满生命敌人造成 25% 额外伤害" }, modifiers: { damage: 12, maxHealth: -10 }, description: "初绽：对满生命敌人 +25% 伤害；+12% 伤害，-10 最大生命" },
  { id: "iron_boots", icon: "🥾", name: "铸铁田靴", price: 22, unique: true, group: "core_stance", trait: { id: "brace", name: "站稳", description: "扎根时受到的伤害降低 25%" }, modifiers: { armor: 3, speed: -5 }, description: "站稳：静止后减伤 25%；+3 护甲，-5% 速度" },
  { id: "wild_scope", icon: "🔬", name: "野性瞄镜", price: 23, unique: true, group: "core_stance", trait: { id: "longshot", name: "远距校准", description: "260 距离外的弹丸伤害提高 25%" }, modifiers: { rangedDamage: 4, range: 30, attackSpeed: -6 }, description: "远距校准：远距离 +25% 伤害；+4 远程伤害，+30 射程，-6% 攻速" },
  { id: "thorn_crown", icon: "👑", name: "荆棘王冠", price: 25, unique: true, group: "core_stance", trait: { id: "thorn_reply", name: "荆棘反击", description: "闪避时刺伤附近敌人" }, modifiers: { meleeDamage: 5, critChance: 7, armor: -2 }, description: "荆棘反击：闪避时反击；+5 近战，+7% 暴击，-2 护甲" },
  { id: "storm_battery", icon: "🔋", name: "风暴电池", price: 26, unique: true, trait: { id: "charged_shot", name: "蓄能", description: "每第 8 次攻击造成 40% 额外伤害" }, modifiers: { elementalDamage: 5, attackSpeed: 8, harvesting: -4 }, description: "蓄能：每第 8 次攻击强化；+5 元素，+8% 攻速，-4 收获" },
  { id: "greedy_magnet", icon: "🧲", name: "贪食磁核", price: 21, unique: true, trait: { id: "double_salvage", name: "过量吸附", description: "拾取材料时有 20% 概率额外获得 1" }, modifiers: { pickupRange: 55, harvesting: 8, speed: -4 }, description: "过量吸附：拾取可能翻倍；+55 拾取范围，+8 收获，-4% 速度" },
  { id: "repair_drone", icon: "🛠️", name: "修复蜂机", price: 27, unique: true, trait: { id: "combat_repair", name: "战斗维修", description: "工程武器命中时有 10% 概率恢复 1 生命" }, modifiers: { engineering: 5, healthRegen: 3, damage: -5 }, description: "战斗维修：工程命中可能回血；+5 工程，+3 恢复，-5% 伤害" },
  { id: "moon_charm", icon: "🌙", name: "月相护符", price: 28, unique: true, trait: { id: "lunar_refuge", name: "月隐", description: "成功闪避时恢复 2 生命" }, modifiers: { dodge: 10, luck: 12, maxHealth: -8 }, description: "月隐：闪避恢复 2 生命；+10% 闪避，+12 幸运，-8 最大生命" },
];

export const CURSED_ITEMS = [
  { id: "cursed_heart", icon: "🫀", name: "噬星心核", price: 34, unique: true, curse: 2, modifiers: { maxHealth: 28, healthRegen: -4 }, description: "诅咒 2：+28 最大生命，-4 生命恢复" },
  { id: "cursed_blade", icon: "🗡️", name: "渴战残刃", price: 36, unique: true, curse: 2, modifiers: { damage: 22, armor: -5 }, description: "诅咒 2：+22% 伤害，-5 护甲" },
  { id: "cursed_eye", icon: "👁️", name: "虚空独眼", price: 35, unique: true, curse: 2, modifiers: { critChance: 18, maxHealth: -18 }, description: "诅咒 2：+18% 暴击率，-18 最大生命" },
  { id: "cursed_wings", icon: "🪽", name: "逆风黑翼", price: 33, unique: true, curse: 1, modifiers: { speed: 20, harvesting: -10 }, description: "诅咒 1：+20% 速度，-10 收获" },
  { id: "cursed_clock", icon: "⏱️", name: "失序时轮", price: 38, unique: true, curse: 2, modifiers: { attackSpeed: 24, damage: -10 }, description: "诅咒 2：+24% 攻击速度，-10% 伤害" },
  { id: "cursed_crown", icon: "♛", name: "空王冠", price: 37, unique: true, curse: 2, modifiers: { luck: 30, dodge: -12 }, description: "诅咒 2：+30 幸运，-12% 闪避" },
  { id: "cursed_magnet", icon: "🕳️", name: "坍缩磁核", price: 32, unique: true, curse: 1, modifiers: { pickupRange: 130, speed: -8 }, description: "诅咒 1：+130 拾取范围，-8% 速度" },
  { id: "cursed_engine", icon: "⚙️", name: "禁忌母机", price: 40, unique: true, curse: 3, modifiers: { engineering: 14, meleeDamage: -6, rangedDamage: -6 }, description: "诅咒 3：+14 工程，-6 近战与远程伤害" },
];

export const ITEMS = [...STAT_ITEMS, ...HYBRID_ITEMS, ...CURSED_ITEMS];

export const SPECIAL_EVENTS = [
  {
    id: "wandering_trader", icon: "🛸", name: "漂泊商船", description: "一艘旧商船愿意交换不稳定的货物。",
    choices: [
      { id: "buy_map", name: "购买星图", description: "支付 15 材料，获得 +10 幸运", materialCost: 15, modifiers: { luck: 10 } },
      { id: "sell_route", name: "出售航线", description: "获得 16 材料，但失去 4% 速度", materials: 16, modifiers: { speed: -4 } },
    ],
  },
  {
    id: "ancient_grove", icon: "🌲", name: "沉睡古林", description: "古老根系正在回应你的构筑。",
    choices: [
      { id: "take_bark", name: "接受树皮", description: "+12 最大生命，-3% 速度", modifiers: { maxHealth: 12, speed: -3 } },
      { id: "take_sap", name: "饮下树液", description: "+9% 伤害，-2 护甲", modifiers: { damage: 9, armor: -2 } },
    ],
  },
  {
    id: "broken_reactor", icon: "☢️", name: "破损反应炉", description: "炉芯仍有能量，也可能带来灾难。",
    choices: [
      { id: "restart_core", name: "重启炉芯", description: "+6 工程，-10 最大生命", modifiers: { engineering: 6, maxHealth: -10 } },
      { id: "dismantle_core", name: "安全拆解", description: "获得 20 材料", materials: 20 },
    ],
  },
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
  spore: { name: "漂浮孢子", behavior: "chase", unlockWave: 1, color: "#914e61", light: "#c46c7f", radius: 18, health: 28, speed: 62, damage: 8, material: 1 },
  runner: { name: "疾行虫", behavior: "chase", unlockWave: 2, color: "#d47a3f", light: "#f0b15e", radius: 12, health: 19, speed: 112, damage: 7, material: 1 },
  bulwark: { name: "岩壳怪", behavior: "chase", unlockWave: 3, color: "#62727d", light: "#9eabb1", radius: 27, health: 82, speed: 40, damage: 15, armor: 3, material: 3 },
  shooter: { name: "刺针射手", behavior: "ranged", unlockWave: 4, color: "#7c5ca4", light: "#b48cd4", radius: 17, health: 31, speed: 52, damage: 7, shootCooldown: 2.2, projectileSpeed: 230, preferredRange: 300, material: 2 },
  charger: { name: "角壳冲锋者", behavior: "charger", unlockWave: 5, color: "#a15b3f", light: "#dc8a62", radius: 22, health: 65, speed: 48, damage: 14, chargeCooldown: 3.2, chargeSpeed: 285, material: 3 },
  healer: { name: "愈光菌", behavior: "healer", unlockWave: 6, color: "#5b9a70", light: "#8de3a8", radius: 19, health: 48, speed: 46, damage: 6, healCooldown: 3.4, healRadius: 150, healAmount: 14, material: 3 },
  buffer: { name: "战鼓芽", behavior: "buffer", unlockWave: 7, color: "#b28a45", light: "#efd06e", radius: 20, health: 56, speed: 50, damage: 9, auraRadius: 145, material: 3 },
  summoner: { name: "虫巢母株", behavior: "summoner", unlockWave: 8, color: "#6f7f43", light: "#a8bd65", radius: 25, health: 88, speed: 35, damage: 10, summonCooldown: 4.2, summonType: "mite", summonCount: 2, material: 4 },
  mite: { name: "幼生螨", behavior: "chase", unlockWave: 8, color: "#d69b53", light: "#ffd18a", radius: 9, health: 12, speed: 135, damage: 5, material: 1, summonedOnly: true },
  splitter: { name: "裂殖球", behavior: "splitter", unlockWave: 9, color: "#95629e", light: "#d89cdb", radius: 21, health: 58, speed: 58, damage: 10, splitType: "mite", splitCount: 3, material: 2 },
  exploder: { name: "爆浆囊", behavior: "exploder", unlockWave: 10, color: "#b94b4b", light: "#ff7b67", radius: 18, health: 43, speed: 75, damage: 20, explosionRadius: 105, material: 3 },
  orbiter: { name: "环游虫", behavior: "orbiter", unlockWave: 11, color: "#4f8b9c", light: "#7fd4df", radius: 15, health: 39, speed: 90, damage: 9, orbitRange: 190, material: 2 },
  sniper: { name: "远眺花", behavior: "sniper", unlockWave: 12, color: "#67528d", light: "#a995d1", radius: 18, health: 42, speed: 32, damage: 13, shootCooldown: 3.4, projectileSpeed: 380, preferredRange: 430, material: 3 },
  shield: { name: "盾甲芽", behavior: "chase", unlockWave: 13, color: "#536b69", light: "#8ba9a4", radius: 24, health: 105, speed: 42, damage: 13, armor: 9, material: 4 },
  teleporter: { name: "跃迁孢", behavior: "teleporter", unlockWave: 14, color: "#7559b4", light: "#c4a2ff", radius: 17, health: 51, speed: 62, damage: 11, teleportCooldown: 3.1, material: 3 },
  turret: { name: "扎根炮花", behavior: "turret", unlockWave: 15, color: "#7d7042", light: "#d3bd6b", radius: 23, health: 92, speed: 0, damage: 10, shootCooldown: 1.65, projectileSpeed: 270, preferredRange: 500, armor: 4, material: 4 },
};

export const ELITE_ARCHETYPES = {
  thorn_champion: { name: "荆冠斗士", behavior: "charger", color: "#9b453d", light: "#ff8b6d", radius: 34, health: 720, speed: 56, damage: 24, armor: 6, chargeCooldown: 2.5, chargeSpeed: 350, material: 18 },
  storm_caller: { name: "雷芽祭司", behavior: "ranged", color: "#6960a8", light: "#c2b6ff", radius: 31, health: 620, speed: 48, damage: 17, armor: 3, shootCooldown: 1.15, projectileSpeed: 300, projectileCount: 3, preferredRange: 300, material: 18 },
  brood_keeper: { name: "育巢守望者", behavior: "summoner", color: "#667b3c", light: "#b5d66a", radius: 36, health: 840, speed: 36, damage: 18, armor: 5, summonCooldown: 2.8, summonType: "mite", summonCount: 4, material: 22 },
  iron_colossus: { name: "铁木巨像", behavior: "healer", color: "#505f61", light: "#a9bcbc", radius: 41, health: 1100, speed: 30, damage: 27, armor: 12, healCooldown: 2.6, healRadius: 190, healAmount: 35, material: 26 },
};

export const ELITE_SKILLS = {
  thorn_champion: { icon: "🩸", name: "血刺冲阵", description: "周期性获得一次更快的冲锋", cooldown: 4.5 },
  storm_caller: { icon: "⚡", name: "环形雷暴", description: "周期性向八个方向释放雷弹", cooldown: 5.2 },
  brood_keeper: { icon: "🥚", name: "紧急孵化", description: "周期性召唤两只高速幼体", cooldown: 6 },
  iron_colossus: { icon: "🛡️", name: "再生壁垒", description: "周期性恢复两层晶盾", cooldown: 5.5 },
};

export const BOSS_ARCHETYPES = {
  brood_mother: { name: "万巢母体", behavior: "summoner", color: "#6d7438", light: "#d8df6b", radius: 54, health: 3200, speed: 34, damage: 28, armor: 8, summonCooldown: 1.9, summonType: "mite", summonCount: 6, material: 60 },
  storm_core: { name: "风暴星核", behavior: "ranged", color: "#5351a8", light: "#aab7ff", radius: 50, health: 2850, speed: 46, damage: 22, armor: 6, shootCooldown: 0.85, projectileSpeed: 330, projectileCount: 7, preferredRange: 320, material: 60 },
  stone_titan: { name: "岩根泰坦", behavior: "charger", color: "#4c5957", light: "#a9bbb4", radius: 60, health: 3900, speed: 31, damage: 36, armor: 15, chargeCooldown: 2.2, chargeSpeed: 390, material: 70 },
};

export const ENEMY_TRAITS = {
  armored: { name: "硬化", icon: "◆", color: "#c6b98b", description: "+6 护甲" },
  swift: { name: "迅捷", icon: "»", color: "#8de5f4", description: "+20% 速度" },
  massive: { name: "巨化", icon: "●", color: "#e6a36f", description: "+35% 生命，体型更大" },
  frenzied: { name: "狂怒", icon: "!", color: "#ff776d", description: "低生命时加速并增伤" },
  shielded: { name: "晶盾", icon: "◇", color: "#a9d8ff", description: "前 3 次受击减伤" },
  volatile: { name: "不稳定", icon: "✦", color: "#f2d56b", description: "死亡时近距离爆炸" },
};

export const DANGER_LEVELS = [
  { id: 0, name: "萌芽", description: "标准远征，适合熟悉构筑。", health: 1, damage: 1, speed: 1, spawn: 1, reward: 1, traitChance: 0, traitSlots: 0 },
  { id: 1, name: "蔓延", description: "少量敌人开始出现变异。", health: 1.12, damage: 1.08, speed: 1.02, spawn: 0.95, reward: 1.04, traitChance: 0.05, traitSlots: 1 },
  { id: 2, name: "侵染", description: "更多敌人带有单项变异。", health: 1.25, damage: 1.16, speed: 1.05, spawn: 0.89, reward: 1.08, traitChance: 0.1, traitSlots: 1 },
  { id: 3, name: "灾变", description: "高压生成，精英必定变异。", health: 1.45, damage: 1.26, speed: 1.08, spawn: 0.82, reward: 1.12, traitChance: 0.17, traitSlots: 1 },
  { id: 4, name: "星蚀", description: "变异更常见，首领获得额外特性。", health: 1.7, damage: 1.38, speed: 1.12, spawn: 0.75, reward: 1.16, traitChance: 0.24, traitSlots: 1 },
  { id: 5, name: "深渊", description: "敌人可能同时拥有两种变异。", health: 1.95, damage: 1.52, speed: 1.16, spawn: 0.7, reward: 1.22, traitChance: 0.32, traitSlots: 2 },
  { id: 6, name: "终焉", description: "双重变异与极限生成密度。", health: 2.25, damage: 1.7, speed: 1.2, spawn: 0.64, reward: 1.3, traitChance: 0.42, traitSlots: 2 },
];

const ELITE_WAVES = { 6: "thorn_champion", 9: "storm_caller", 13: "brood_keeper", 17: "iron_colossus" };
const BOSS_IDS = Object.keys(BOSS_ARCHETYPES);

export function getWaveDefinition(wave, dangerId = 0) {
  const danger = DANGER_LEVELS[dangerId] ?? DANGER_LEVELS[0];
  const duration = wave < 5 ? 20 : wave < 10 ? 25 : wave < 15 ? 30 : wave < 20 ? 35 : 45;
  const unlockedTypes = Object.entries(ENEMY_ARCHETYPES)
    .filter(([, enemy]) => !enemy.summonedOnly && enemy.unlockWave <= wave)
    .map(([id]) => id);
  const types = unlockedTypes.slice(Math.max(0, unlockedTypes.length - 7));
  if (!types.includes("spore")) types.unshift("spore");
  const bossId = wave === MAX_WAVES ? BOSS_IDS[dangerId % BOSS_IDS.length] : null;
  const eliteId = ELITE_WAVES[wave] ?? null;
  return {
    wave,
    duration,
    types,
    special: bossId ? { rank: "boss", id: bossId } : eliteId ? { rank: "elite", id: eliteId } : null,
    spawnInterval: Math.max(0.26, (1.05 - wave * 0.035) * danger.spawn),
    healthMultiplier: (1 + (wave - 1) * 0.13) * danger.health,
    damageMultiplier: (1 + (wave - 1) * 0.08) * danger.damage,
    speedMultiplier: Math.min(1.75, (1 + (wave - 1) * 0.018) * danger.speed),
    rewardMultiplier: danger.reward,
  };
}
