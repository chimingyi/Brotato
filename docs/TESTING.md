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
- `danger=4`：选择 D0-D4 中的指定危险等级。
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

精英和首领出现时，画面上方应显示名称、当前生命和总生命。D0 到 D4 会同时改变敌人的生命、伤害、速度和生成间隔。

## 8. v2 局外成长与完整规则测试

### 初始锁定进度

<http://localhost:8000/?test=1&lockedProgress=1>

- 初始应只有 3 名角色、8 把武器和 24 件道具，D1-D4 均锁定。
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
