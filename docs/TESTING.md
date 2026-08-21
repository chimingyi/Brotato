# 测试指南

这份文件让以后的自己或其他开发者能够重复验证第一版，不必只相信开发日志里的结论。

## 1. 启动游戏

在项目根目录运行：

```bash
python3 -m http.server 8000
```

正式玩法地址：<http://localhost:8000/>

## 2. JavaScript 语法检查

如果电脑已经安装 Node.js：

```bash
node --check src/game.js
```

命令无输出并返回成功，就代表浏览器在读取文件之前不会遇到基础语法错误。

## 3. 手动玩法检查

- 点击“开始冒险”，确认时间开始增加。
- 使用 `WASD` 和方向键分别移动，确认角色不会离开场地。
- 按空格暂停，确认时间、敌人和攻击都停止。
- 击败敌人，确认出现青色能量并增加经验。
- 升级时选择一项强化，确认面板关闭并继续战斗。
- 生存超过 15 秒，确认出现橙色疾行虫。
- 生存超过 35 秒，确认出现灰色岩壳怪。
- 失败后点击“再试一次”，确认所有本局状态重置。

## 4. 手机布局检查

使用浏览器的手机设备模式，推荐尺寸为 390 × 844：

- 页面不应出现横向滚动条。
- 开始前不显示虚拟摇杆。
- 开始后左下角显示摇杆，拖动时角色移动，松开后停止。
- 生命、时间、等级和击败数不能超出游戏边框。
- 升级卡片可以横向滑动并正常选择。

## 5. 本地快速测试

以下功能只在本地地址且带有 `test=1` 时开启。它们用于复测，不会改变 GitHub Pages 正式版。

### 快速胜利

<http://localhost:8000/?test=1&roundDuration=2>

开始后等待 2 秒，应显示胜利结算。正式版仍然需要 5 分钟。

### 快速失败

<http://localhost:8000/?test=1&roundDuration=30&defeatAfter=1>

开始后等待 1 秒，应显示失败结算，生命显示为 `0 / 100`。

### 固定特殊武器选项

<http://localhost:8000/?test=1&roundDuration=30&quickLevel=1&upgrades=orbit-leaf,star-burst,damage>

第一次击败敌人后会快速升级，并优先显示守护叶片、星芒爆发和伤害强化，便于逐项验证特殊武器。

## 6. 发布前检查

```bash
git diff --check
git status --short
```

确认没有空白格式错误，所有需要发布的文件都已提交，然后再推送并开启 GitHub Pages。

## 7. v2 分波与商店测试

v2 开发分支可以使用下面的本地测试地址：

<http://localhost:8000/?test=1&waveDuration=2&startMaterials=100&startExperience=8>

- `waveDuration=2`：把每波临时缩短为 2 秒。
- `startWave=10`：从指定波次开始，用更密集、更耐打的敌人验证高级武器。
- `danger=6`：选择 D0-D6 中的指定危险等级。
- `invincible=1`：本地测试时忽略伤害，用于稳定验证最终波结算。
- `startMaterials=100`：开局获得 100 材料，便于测试购买、刷新和合成。
- `startExperience=8`：开局积累一次升级，波末会出现四选一。
- `shopWeapons=1`：四个货架只生成武器。
- `shopRarity=4`：测试商店固定生成传说品质，便于验证六槽满载。
- `shopWeapon=seed_launcher`：固定生成指定武器。
- `shopRarities=2,2,2,2,1,1,1,1`：按货架生成顺序指定品质，用于验证连续合成。
- 这些参数只在本地地址且带 `test=1` 时生效，不会改变公开网站的正式数值。

推荐按顺序验证：

1. 选择角色和初始武器，等待第 1 波结束。
2. 选择一项升级，确认进入四货架商店。
3. 锁定一个货物并刷新，确认锁定货物保留，其他货物变化。
4. 购买同名同品质武器，确认品质提升且仍只占一个槽。
5. 购买道具，确认属性面板立即变化。
6. 购买第二把武器后出售，确认武器移除并返还材料。
7. 开始第 2 波，确认 HUD 显示 `2 / 20`；波末确认锁定货物仍保留。
8. 检查浏览器控制台没有错误或警告。

### 六槽满载

<http://localhost:8000/?test=1&waveDuration=2&startMaterials=9999&startExperience=8&shopWeapons=1&shopRarity=4>

连续购买武器直到 `6 / 6`，剩余不能合成的武器应自动禁止购买；出售一把后应重新允许购买。

### 连续自动合成

<http://localhost:8000/?test=1&waveDuration=2&startMaterials=9999&startExperience=8&shopWeapon=seed_launcher&shopRarities=2,2,2,2,1,1,1,1>

先购买一把精良种子发射器，再刷新并购买一把普通种子发射器。背包中的初始普通、精良和新购买的普通武器应连续合成为一把稀有武器，最终仍占一个槽。

### 新武器机制

本地测试模式会把只读运行状态写入游戏画布的 `data-test-state`，其中包含攻击次数、弹丸数、爆炸、燃烧、减速和弹射次数。它只用于复测，不参与正式玩法。

- 余烬法球：运行 6 秒后，`burns` 应大于 0。
- 熔核果实：运行 6 秒后，`explosions` 和 `burns` 都应大于 0。
- 霜囊投射器：使用 `startWave=10` 运行后，`slows` 应大于 0。
- 月芽长弓：使用 `startWave=10` 运行后，`bounces` 应大于 0。
- 花粉迸射器：`projectiles` 应等于 `attacks` 的 3 倍。
- 哨戒种核：齿轮培育员开局时伤害应为 18，证明工程属性参与缩放。

### 精英、首领与危险等级

- `startWave=6`：生成荆冠斗士，测试冲锋精英。
- `startWave=9`：生成雷芽祭司，测试三连远程弹幕。
- `startWave=13`：生成育巢守望者，约 4 秒后 `summons` 应大于 0。
- `startWave=17`：生成铁木巨像，约 1 秒后 `healPulses` 应大于 0。
- `startWave=20&danger=0`：生成万巢母体。
- `startWave=20&danger=1`：生成风暴星核。
- `startWave=20&danger=2`：生成岩根泰坦。
- `startWave=20&danger=4&waveDuration=2&invincible=1`：2 秒后应显示 D4 完成 20 波的胜利结算。

精英和首领出现时，画面上方应显示名称、当前生命和总生命。D0 到 D6 会同时改变敌人的生命、伤害、速度和生成间隔。

## 8. v2 局外成长与完整规则测试

### 初始锁定进度

<http://localhost:8000/?test=1&lockedProgress=1>

- 初始应只有 3 名角色、8 把武器和 24 件道具，D1-D6 均锁定。
- 图鉴应显示 `3 / 12`、`8 / 24`、`24 / 80` 和 `0 / 23`。
- 使用 `startWave=20&waveDuration=2&invincible=1` 完成 D0 后，应解锁 D1，并更新远征次数、最高波次和通关次数。

### 树木、治疗果实与回血

<http://localhost:8000/?test=1&waveDuration=8&noEnemies=1&treeTest=1&startHealth=50>

选择嫩芽先锋和种子发射器。测试快照应满足：

- `treesDestroyed > 0`
- `consumablesDropped > 0`
- `consumablesPicked > 0`
- 玩家生命高于 50

### 升级品质

<http://localhost:8000/?test=1&waveDuration=2&startExperience=8&upgradeRarity=4&noEnemies=1>

波末四个选项都应显示“传说升级”，并使用传说品质倍率放大数值。正式模式中，等级、波次和幸运会提高高品质升级概率。

### 商店武器保底

<http://localhost:8000/?test=1&waveDuration=2&startMaterials=100&noEnemies=1>

第 1-2 波初始商店至少出现 2 把武器，之后初始商店至少出现 1 把；已有武器类别会提高同类别武器出现概率。

### 唯一、数量限制和互斥

- `shopItem=glass_sprout`：购买玻璃幼芽后，其他同名货架应禁止购买。
- `startItems=glass_sprout&shopItem=iron_boots`：持有玻璃幼芽时，互斥的铸铁田靴应禁止购买。
- 普通属性道具前三档最多持有 3 件，最高档最多持有 1 件。

### 设置与重置

- 修改音量、屏幕震动和伤害数字后刷新页面，设置应保持。
- 重置存档必须连续点击两次确认，防止误操作。
- `test=1` 使用隔离测试进度，不会污染正式存档。

## 9. v2.0 发布前回归

- 连续从第 1 波运行到第 20 波：第 1-19 波均进入商店，下一波按钮各有且只有一个，第 20 波正确进入通关结算。
- 初始种子发射器压力抽查：第 1 波 8 秒击败 3 个敌人；直接跳到第 10、15、20 波时输出明显不足，证明后期需要构筑成长。
- 六槽构筑抽查：1 把普通加 5 把传说种子发射器在第 20 波 8 秒击败 27 个敌人，首领仍有 5673 / 5961 生命，没有出现瞬间秒杀。
- 20 波曲线抽查：D0 预计生成数从第 1 波约 19 个增长到第 20 波约 128 个；D4 第 20 波约 171 个，生成间隔始终不低于 0.26 秒。
- 390 × 844 手机视口：选择页和图鉴可正常滚动，危险等级、统计和双列卡片没有横向溢出。
- 最终检查：三个 JavaScript 文件语法通过、数据 ID 和引用有效、`git diff --check` 通过。

## 10. v2.1 特性与变异测试

### 角色专属规则

- 风行侦察员：<http://localhost:8000/?test=1&noEnemies=1&waveDuration=6>。开局 18 速度应转化为 6.3 伤害，种子发射器显示 14 伤害。
- 岩壳守卫：同一地址选择根须短棍；静止前为 6 护甲，0.8 秒后应变为 10。
- 余烬园丁：使用余烬法球时 `characterTraitProcs` 和 `burns` 都应增加。
- 其他角色的特性 ID、说明和有效属性可以在 `data-test-state` 的 `characterTrait`、`effectiveStats` 和 `metrics` 中检查。

### 触发型道具

<http://localhost:8000/?test=1&waveDuration=8&invincible=1&startItems=glass_sprout,storm_battery>

选择嫩芽先锋和种子发射器。玻璃幼芽应在满生命首击时触发，风暴电池应在第 8 次攻击触发；`ownedItemTraits` 应列出“初绽”和“蓄能”，`itemTraitProcs` 应大于 0。

### 敌人变异

- 不稳定死亡爆炸：<http://localhost:8000/?test=1&waveDuration=8&invincible=1&enemyTraits=volatile>，击败敌人后 `enemyTraitExplosions > 0`。
- D6 双重变异：<http://localhost:8000/?test=1&startWave=6&danger=6&waveDuration=5&invincible=1&enemyTraits=armored,shielded>，精英生命条应显示“硬化+晶盾”。
- `enemyTraits` 可固定本地测试的变异组合；正式模式不接受该参数，仍按危险等级概率生成。

### 新危险等级

- D4 通关解锁 D5，D5 通关解锁 D6，D6 通关后不会继续越界。
- D6 第 20 波生命倍率约 7.81、伤害倍率约 4.28、生成间隔最低 0.26 秒。
- D5-D6 普通敌人最多拥有两种变异；D3 起精英和首领保证至少一种变异。

### v2.1 完整回归结果

- D6 第 20 波自然生成双变异首领，实测万巢母体获得“晶盾+硬化”，并正确进入 D6 通关结算。
- 从第 1 波连续运行到第 20 波，19 次商店跳转按钮均唯一且正确，最终进入胜利界面。
- 嫩芽先锋“四季生长”在 20 波中触发 20 次，收获从 5 成长到 30，最终累计 300 材料。
- 390 × 844 手机视口显示全部 7 个危险等级，按钮自动换行且没有横向溢出。

## 11. v2.2 进化与诅咒构筑测试

### 角色出身与武器进化

<http://localhost:8000/?test=1&waveDuration=2&noEnemies=1&startMaterials=100&startRarity=4>

- 嫩芽先锋的“先锋补给”应让开局材料从 100 变为 108。
- 第 1 波后，传说种子发射器应显示“进化 · 38”。
- 进化为“千籽星树”后，测试快照中 `evolved=true`、伤害从 32 提高到 37，`weaponEvolutions=1`。
- 使用 `startEvolved=1` 可直接测试进化攻击；千籽星树的 `projectiles / attacks` 应为 2。

## 12. v2.3 成就、天赋、专属武器与无尽测试

### 成长面板与天赋

<http://localhost:8000/?test=1&talentPoints=5>

- 主菜单点击“成长”，应显示 6 类天赋和 10 个成就。
- 升级“星芽体魄”后，天赋点从 5 变为 4，等级从 0 / 3 变为 1 / 3。
- 使用嫩芽先锋开始游戏，最大生命应从 110 提高到 114。
- 每项天赋最多 3 级；天赋点不足或达到满级后按钮禁用。

### 角色专属武器

- 数据检查应得到 36 把武器，其中 12 把带有 `exclusiveTo`，并且每名角色恰好对应 1 把。
- 用嫩芽先锋选择“先锋花冠”，测试快照中的 `exclusiveWeapon` 应为 `pioneer_bloom`。
- 使用 `shopWeapons=1&shopWeapon=stone_anchor` 强制请求岩壳守卫专属武器，再用嫩芽先锋进入商店；货架中不应出现 `stone_anchor`。

### 三选一事件

<http://localhost:8000/?test=1&startWave=5&waveDuration=2&noEnemies=1&event=meteor_garden>

- 第 5 波结束后应进入“陨星花园”。
- `.event-choice` 数量应为 3，选择后进入商店。
- 正式流程中的第 5、10、15 波分别出现漂泊商船、沉睡古林和破损反应炉；危险等级会改变事件轮换起点。

### 成就条件

- `startWave=20&waveDuration=2&noEnemies=1&invincible=1`：解锁第一次远征、抵达第 5 波、抵达第 10 波和首次通关，共奖励 4 点。
- 再加入 `danger=3&startMaterials=500&startItems=cursed_engine`：还应解锁 D3 通关、累计材料和 3 点诅咒通关，共获得 7 点。
- `startWave=19&startRarity=4&startMaterials=100`：在第 19 波商店进化初始武器，再完成第 20 波，应解锁“超越传说”。

### 无尽模式

<http://localhost:8000/?test=1&startWave=20&waveDuration=2&noEnemies=1&invincible=1>

- 第 20 波结算显示“继续无尽模式”，此时远征次数和胜场各增加 1。
- 点击后直接进入第 21 波，HUD 显示 `21 / ∞`，远征次数和胜场不重复增加。
- 第 21 波生成精英；抵达第 25 波时生成首领，并解锁“越过终点”。
- 无尽每开始一波就保存最高波次，意外刷新页面也不会丢失已经抵达的纪录。

### v2.3 回归结果

- 从第 1 波连续运行到第 20 波，19 次下一波按钮均唯一，三次事件各有 3 个选项，最终正确进入胜利结算。
- 第 20 波继续到第 25 波时，`runs=1`、`wins=1` 保持不变，`bestEndlessWave=25`，天赋点只增加 1。
- 三个 JavaScript 文件均通过 `node --check`，数据引用检查和 `git diff --check` 通过。

## 13. v2.4 动态战斗与首领阶段测试

### 角色移动与攻击动画

<http://localhost:8000/?test=1&waveDuration=20&invincible=1&autoMove=1>

- `autoMove=1` 只在本地测试中让角色持续向右移动，便于稳定检查动画。
- 测试快照的 `playerAnimation.moveStrength` 应从 0 平滑提高到 1，`movePhase` 应持续变化。
- 自动攻击时 `attackFlash` 会短暂变为 0.14，远程弹丸应显示与飞行方向相反的尾迹。
- 工程弹丸显示为旋转方块；燃烧、减速和爆破弹丸拥有不同颜色的外圈。

### 首领阶段快速测试

`bossHealth` 仅在本地测试模式生效，用来指定首领的初始生命比例：

- 万巢母体第三阶段：<http://localhost:8000/?test=1&startWave=20&danger=0&bossHealth=0.30&waveDuration=30&noEnemies=1&invincible=1>
- 风暴星核第三阶段：<http://localhost:8000/?test=1&startWave=20&danger=1&bossHealth=0.30&waveDuration=30&noEnemies=1&invincible=1>
- 岩根泰坦第三阶段：<http://localhost:8000/?test=1&startWave=20&danger=2&bossHealth=0.30&waveDuration=30&noEnemies=1&invincible=1>

预期结果：

- `bossPhase=3`，阶段名依次为“母巢暴走”“超载风暴”“地脉震怒”。
- 从满生命直接设置到 30% 会跨过两个阶段，因此 `bossPhaseChanges=2`。
- 每种首领至少触发一次阶段技能，`bossSkillProcs > 0`。
- 万巢母体增加召唤数量；风暴星核增加扇形与环形弹幕；岩根泰坦加快冲锋并释放地脉弹。
- 首领生命条显示阶段名称，首领外圈颜色和技能蓄力环随阶段变化。

### v2.4 完整回归结果

- 从第 1 波连续运行到第 20 波，19 次下一波跳转均唯一；第 5、10、15 波事件各有 3 个选择。
- 第 20 波正常显示第一阶段万巢母体，结算后 `runs=1`、`wins=1`。
- 继续无尽并抵达第 25 波，生成第一阶段岩根泰坦；`bestEndlessWave=25`，局数和胜场仍为 1。
- 390 × 844 视口中页面宽度为 390，没有横向滚动；HUD、武器栏和首领生命条互不重叠。
- 手机端 `20 / 20 · D2` 保持单行，第三阶段首领名称完整显示。
- D6 第三阶段万巢母体运行 8 秒后为 73 个敌人，没有超过 90 个召唤软上限，也没有出现脚本错误。
- 所有专项页、完整回归页和手机页的浏览器日志均为 0 条。

### 星域事件

<http://localhost:8000/?test=1&startWave=5&waveDuration=2&noEnemies=1&startMaterials=30&event=wandering_trader>

- 第 5 波结束后应进入“漂泊商船”，而不是直接进入商店。
- 选择“购买星图”后扣除 15 材料、获得 10 幸运，`completedEvents` 包含 5，随后进入商店。
- 正常流程会在第 5、10、15 波依次出现三个不同事件。

### 诅咒道具

<http://localhost:8000/?test=1&waveDuration=6&invincible=1&startItems=cursed_blade>

- “渴战残刃”提供 +22% 伤害、-5 护甲和 2 点诅咒。
- 2 点诅咒会让 D0 漂浮孢子的生命从 28 提高到 29.4，伤害从 8 提高到 8.24。
- 每点诅咒提高敌人 2.5% 生命、1.5% 伤害，并提高 4% 掉落收益与额外材料概率。

### 精英专属技能

<http://localhost:8000/?test=1&startWave=6&waveDuration=7&invincible=1&danger=3>

- 荆冠斗士生命条应显示“血刺冲阵”。
- 约 3 秒后 `eliteSkillProcs` 应增加，精英会执行一次强化冲锋。
- 第 9、13、17 波可分别检查环形雷暴、紧急孵化和再生壁垒。

### v2.2 完整回归结果

- 第 1-20 波连续运行通过，19 次商店跳转均唯一且正确。
- 第 5、10、15 波事件依次触发且各完成一次，`completedEvents` 最终为 `[5, 10, 15]`。
- 第 20 波进入胜利结算；嫩芽先锋特性连续触发 20 次，最终材料为 293。
- 390 × 844 手机视口中两个事件选项纵向排列，页面 `scrollWidth` 与 `clientWidth` 均为 390。
- 图鉴显示 12/12 角色、24/24 武器、88/88 道具和 23/23 敌人，并包含全部 8 个内容分组。
