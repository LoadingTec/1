下面给你一套**适合 10 人规模（算法 + Host + UI + 系统协同）团队**的 Git Flow 模型。
目标：**控制风险、保证节奏、不过度复杂化流程**。

我会从：分支模型 → 提交流程 → Review机制 → 发布节奏 → 角色职责 → 约束规则 六个层面讲清楚。

---

# 一、设计原则（适合10人团队）

1. 主线必须稳定（随时可部署）
2. feature 必须隔离开发
3. 所有代码必须经过 PR
4. 发布必须可追溯
5. 流程不能太重（避免官僚化）

---

# 二、分支模型设计（推荐轻量级 Git Flow）

我们不使用复杂的传统 Git Flow（太重），采用简化版。

## 核心分支结构

```
main          —— 稳定生产版本
develop       —— 集成分支（日常集成）
release/*     —— 发布准备分支
feature/*     —— 功能开发分支
hotfix/*      —— 紧急修复分支
```

---

## 各分支定义

### 1️⃣ main（生产分支）

* 永远保持可发布状态
* 只能从 release 或 hotfix 合入
* 每次发布必须打 tag

例如：

```
v1.3.0
v1.3.1
```

禁止：

* 直接 push
* 直接 PR 从 feature 到 main

---

### 2️⃣ develop（集成分支）

* 日常开发合入分支
* 所有 feature 最终合入 develop
* CI 必须通过

develop 可以不完全稳定，但不能严重崩溃。

---

### 3️⃣ feature 分支

命名规范：

```
feature/H3K-123-wafermap-opt
feature/H3K-245-secs-gem
```

规则：

* 从 develop 拉出
* 只解决一个需求
* 完成后提交 PR 到 develop
* 必须经过 Code Review

---

### 4️⃣ release 分支

当准备发布时：

```
release/1.4.0
```

流程：

* 从 develop 创建
* 只允许：
  * Bug fix
  * 文档更新
  * 配置修正
* 不允许新增功能

验证通过后：

* merge 到 main
* 同步 merge 回 develop
* 打 tag

---

### 5️⃣ hotfix 分支

线上紧急问题：

```
hotfix/1.4.1-memory-leak
```

流程：

* 从 main 创建
* 修复
* PR 到 main
* 同步 merge 到 develop

---

# 三、Pull Request 流程设计

这是核心控制点。

---

## 标准 PR 流程

1. 开发完成 feature
2. 本地自测
3. 提交 PR 到 develop
4. 指定 Reviewer（至少 1 人）
5. CI 自动运行：
   * 编译
   * 单元测试
   * 静态检查
6. Review 通过
7. 合入

---

## 强制规则

* 不允许自合并
* 至少 1 个 Reviewer Approve
* CI 必须通过
* PR 必须关联 Issue

---

# 四、角色职责分工（10人适用）

假设：

* 6 名开发
* 2 名算法
* 1 名系统
* 1 名负责人（Tech Lead / Manager）

---

## 1️⃣ 开发人员

负责：

* feature 分支
* 单元测试
* 自测报告
* PR 说明清晰

---

## 2️⃣ Reviewer（轮值制）

* 每周指定 2 人为 Review Owner
* 24小时内必须 review
* 不允许无限拖延

---

## 3️⃣ Tech Lead

负责：

* merge 节奏控制
* release 创建
* 版本冻结
* 重大 PR 审批

---

## 4️⃣ Release Owner（可由TL兼任）

负责：

* 创建 release 分支
* 发布说明
* Tag 管理
* 发布确认

---

# 五、发布节奏建议（设备软件适用）

### 推荐节奏

* 每 2 周一个小版本
* 每月一个稳定版本

---

## 发布流程

```
冻结 develop
    ↓
创建 release/1.4.0
    ↓
测试验证
    ↓
修复 bug（只在 release）
    ↓
合入 main
    ↓
打 tag
    ↓
同步回 develop
```

---

# 六、代码评审规范（建议写成团队约定）

Review 要关注：

1. 是否影响系统性能
2. 是否破坏接口
3. 是否影响算法准确性
4. 是否存在资源泄漏
5. 是否违反架构分层

---

# 七、CI 强制项（强烈建议）

最少要有：

* 编译检查
* 单元测试
* 静态分析
* 格式检查

否则 PR 机制意义会下降。

---

# 八、关键管理约束（必须落地）

### 禁止事项

* 禁止直接 push 到 develop
* 禁止从 feature 直接到 main
* 禁止 release 阶段新增功能
* 禁止未评审代码上线

---

# 九、适合你们当前项目（设备 + 算法 + UI）的特别建议

1. 算法改动必须：
   * 提供对比数据
   * 提供性能报告
   * 提供误检率变化说明
2. HostServer 改动必须：
   * 提供压力测试截图
3. UI 改动必须：
   * 附操作截图或录屏

---

# 十、最终简化版流程图

```
feature → PR → develop → release → main
                   ↑            ↓
                 hotfix ← main
```

---

# 十一、为什么这个模型适合10人？

* 不复杂
* 有清晰权限边界
* 有风险隔离
* 不会拖慢开发节奏
* 不会像大型企业流程一样沉重

---
