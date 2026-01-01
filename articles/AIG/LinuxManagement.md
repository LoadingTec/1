# Linux 用户如何进行管理

- English Explain:"How to 
manage Linux users". They want explanation on user management in 
Linux. Provide overview of commands: useradd, usermod, userdel, 
groupadd, groups, passwd, /etc/passwd, /etc/shadow, /etc/group, 
sudoers, etc. Also discuss UID/GID, home directories, default skeleton, password 
policies, locking, expiry. Provide examples. Possibly talk about GUI tools. Also 
mention managing groups, adding to sudoers, using visudo, using tools like chage, 
passwd -l, -e. Provide best practices and security considerations. Also maybe 
discuss LDAP/AD integration. Provide steps: create user, set password, add to 
group, modify, delete, lock. Provide scripts, automation, user management with 
Ansible. Also talk about /etc/login.defs and /etc/default/useradd defaults.

## Linux 用户管理概览  

Linux 系统的用户（account）和组（group）信息主要保存在 **/etc/passwd、/etc/shadow、
/etc/group** 三个文件中。  
日常运维大多数时候都是通过命令行工具对这些文件进行增删改查，配合 **sudo**、**PAM**、
**login.defs** 等配置实现细粒度的权限控制。

下面按 **“创建 → 配置 → 维护 → 删除”** 四个阶段系统地介绍常用工具、文件结构、最佳实
践以及进阶方案（LDAP、自动化）。

---

## 1️⃣ 基本概念

| 项目 | 说明 | 常见位置 |
|------|------|----------|
| **UID**（User ID） | 标识用户的唯一整数。0 = root，系统保留 UID 1‑99（或 1‑999，视
发行版而定），普通用户从 1000 开始。 | /etc/passwd |
| **GID**（Group ID） | 标识组的唯一整数。和 UID 类似，系统组一般占低位。 | 
/etc/group |
| **Home Directory** | 用户登录后默认的工作目录。 | /etc/passwd |
| **Shell** | 登录后启动的交互解释器（如 `/bin/bash`、`/usr/bin/zsh`）。 | 
/etc/passwd |
| **Password Hash** | 加密后的密码存放在 **/etc/shadow**，只能 root 读取。 | 
/etc/shadow |
| **Skeleton（/etc/skel）** | 新建用户的默认文件模板（.bashrc、.profile 等）。 | 
/etc/skel |

---

## 2️⃣ 常用命令速查表  

| 命令 | 作用 | 常用选项 | 示例 |
|------|------|----------|------|
| **useradd** | 新建本地用户 | `-m`（创建 home）<br>`-s /bin/bash`（指定 shell）
<br>`-u UID`（指定 UID）<br>`-g GID`（主组）<br>`-G group1,group2`（附加组）
<br>`-c "备注"` | `sudo useradd -m -s /bin/bash -G wheel -c "张三"` |
| **passwd** | 设置/修改密码、锁定/解锁账号 | `-l`（锁定）<br>`-u`（解锁）<br>`-e`（
强制下次登录修改） | `sudo passwd zhangsan`<br>`sudo passwd -l zhangsan` |
| **usermod** | 修改已有用户属性 | `-l newname`（改用户名）<br>`-d /new/home -m`（改
 home 并迁移）<br>`-s /bin/zsh`（改 shell）<br>`-a -G group`（追加到附加组） | 
`sudo usermod -a -G docker zhangsan` |
| **userdel** | 删除用户 | `-r`（连同 home 删除） | `sudo userdel -r zhangsan` |
| **groupadd / groupdel / groupmod** | 组的增删改 | `-g GID`（指定 GID） | `sudo 
groupadd devops` |
| **id** | 查看用户 UID/GID/所属组 | - | `id zhangsan` |
| **chage** | 管理密码过期策略 | `-M maxdays`<br>`-m mindays`<br>`-W 
warndays`<br>`-I inactive`<br>`-E expiredate` | `sudo chage -M 90 -W 7 zhangsan` |
| **gpasswd** | 管理组成员（适合交互式） | `-a user group`（加入）<br>`-d user 
group`（删除） | `sudo gpasswd -a zhangsan wheel` |
| **visudo** | 安全编辑 **/etc/sudoers**（自动语法检查） | - | `sudo visudo` |
| **getent** | 从系统数据库（包括 NIS/LDAP）查询用户/组信息 | `passwd|group` | 
`getent passwd zhangsan` |
| **sudo** | 以另一用户（默认 root）执行命令 | `-u otheruser` | `sudo -u postgres 
psql` |

---

## 3️⃣ 逐步实战

### 3.1 创建一个普通用户

```bash
# 1) 创建用户并自动生成 home、默认 shell 为 /bin/bash
sudo useradd -m -s /bin/bash -c "张三" zhangsan

# 2) 设置密码（会交互式提示两次）
sudo passwd zhangsan

# 3) 将其加入 sudoers（推荐使用组方式，避免直接编辑 /etc/sudoers）
sudo usermod -a -G wheel zhangsan   # 许多发行版将 wheel 组设为 sudo 权限
# 若发行版使用 sudo 组：
# sudo usermod -a -G sudo zhangsan
```

> **提示**：在 `/etc/sudoers` 中应有类似行（如果使用 `wheel` 组）：
> ```
> %wheel ALL=(ALL) ALL
> ```
> 如果没有，使用 `visudo` 添加。

### 3.2 为用户分配专属资源组

```bash
# 创建业务专属组
sudo groupadd devops

# 将用户加入该组（-a 追加，-G 为附加组）
sudo usermod -a -G devops zhangsan
```

### 3.3 修改用户属性（示例）

```bash
# 改用户名
sudo usermod -l zhang_new zhangsan

# 改 Home 目录并迁移文件
sudo usermod -d /data/users/zhang_new -m zhang_new

# 更改登录 Shell 为 zsh
sudo usermod -s /usr/bin/zsh zhang_new
```

### 3.4 锁定 / 解锁 / 强制密码更改

```bash
# 锁定（不允许登录）
sudo passwd -l zhang_new

# 解锁
sudo passwd -u zhang_new

# 强制下次登录时更改密码
sudo passwd -e zhang_new
```

### 3.5 设置密码过期策略（合规要求）

```bash
# 密码有效期 90 天，提前 7 天警告，30 天不活动后禁用账户
sudo chage -M 90 -W 7 -I 30 zhang_new
# 查看当前策略
sudo chage -l zhang_new
```

### 3.6 删除用户（保留 home）

```bash
# 只删除账号，保留其 home 目录以便审计或迁移
sudo userdel zhang_new
```

### 3.7 完全删除（包括 home、邮件 spool）

```bash
sudo userdel -r zhang_new
```

---

## 4️⃣ 配置文件细节

### 4.1 /etc/passwd（示例）

```
root:x:0:0:root:/root:/bin/bash
zhangsan:x:1001:1001:张三:/home/zhangsan:/bin/bash
```

- **字段**：`用户名:密码占位符:UID:GID:备注:Home目录:Shell`
- 密码字段一般为 `x`，实际密码在 `/etc/shadow`。

### 4.2 /etc/shadow（示例）

```
zhangsan:$6$yG9JzT7v$3Q0pG8uHj...:18470:0:99999:7:::
```

- **字段**：`用户名:密码散列:上次改密码的天数:最小间隔天数:最大间隔天数:密码过期前警
告天数:密码失效后宽限天数:账号失效日期:保留`
- 常用散列算法：`$6$` → SHA‑512。

### 4.3 /etc/group（示例）

```
wheel:x:10:root,zhangsan
devops:x:1002:zhangsan
```

- **字段**：`组名:密码占位符:GID:成员列表`（本地组密码一般为空）。

### 4.4 /etc/login.defs（系统默认策略）

| 参数 | 作用 | 常见值 |
|------|------|--------|
| `UID_MIN` / `UID_MAX` | 普通用户 UID 范围 | 1000‑60000 |
| `GID_MIN` / `GID_MAX` | 普通组 GID 范围 | 1000‑60000 |
| `PASS_MAX_DAYS` | 密码最大有效天数 | 90 |
| `PASS_MIN_DAYS` | 密码最小修改间隔 | 0 |
| `PASS_WARN_AGE` | 密码过期警告天数 | 7 |
| `CREATE_HOME` | `useradd` 默认是否创建 home | yes |

> **技巧**：如果你想统一所有新建用户的默认属性（如默认组、默认 shell），编辑 
`/etc/default/useradd` 或 `/etc/skel`。

---

## 5️⃣ Sudo 权限细粒度控制

### 5️⃣1 基本思路

- **最小特权原则**：只授予需要的命令。
- **使用组**：把需要 sudo 权限的用户放入特定组，再在 sudoers 中定义该组的权限。

### 5️⃣2 示例：只允许部署脚本

编辑 `/etc/sudoers.d/deploy`（推荐使用 `visudo -f /etc/sudoers.d/deploy`）：

```
# 让 devops 组的成员可以无密码运行 /usr/local/bin/deploy.sh
%devops ALL=(ALL) NOPASSWD: /usr/local/bin/deploy.sh
```

### 5️⃣3 限制特定路径

```
# 只允许 root 通过 sudo 启动 nginx
%wheel ALL=(root) NOPASSWD: /usr/sbin/nginx
```

### 5️⃣4 记录日志

`sudo` 默认会把所有命令写入 `/var/log/auth.log`（Debian/Ubuntu）或 
`/var/log/secure`（RHEL/CentOS）。可以通过 `Defaults logfile=/var/log/sudo.log` 自定
义。

---

## 6️⃣ 高级：集中式用户管理（LDAP / AD）

| 场景 | 工具 | 关键配置文件 |
|------|------|--------------|
| **OpenLDAP** | `slapd` + `nslcd` / `sssd` | `/etc/openldap/ldap.conf`、
`/etc/nslcd.conf`、`/etc/sssd/sssd.conf` |
| **Active Directory** | `realmd` + `sssd` | `/etc/realmd.conf`、
`/etc/sssd/sssd.conf` |
| **FreeIPA** | `ipa-client` | `/etc/ipa/default.conf` |

### 6.1 基本流程（以 SSSD + LDAP 为例）

1. **安装**  
   ```bash
   sudo apt install sssd libnss-sss libpam-sss
   ```
2. **配置** `/etc/sssd/sssd.conf`（示例）  
   ```ini
   [sssd]
   domains = example.com
   config_file_version = 2
   services = nss, pam

   [domain/example.com]
   id_provider = ldap
   auth_provider = ldap
   ldap_uri = ldap://ldap.example.com
   ldap_search_base = dc=example,dc=com
   ldap_tls_reqcert = demand
   ```
   `chmod 600 /etc/sssd/sssd.conf`

3. **启用 NSS/PAM**  
   ```bash
   sudo authconfig --enablelocauthorize --enablenis --enablesssd --update
   ```
4. **启动服务**  
   ```bash
   sudo systemctl enable --now sssd
   ```
5. **测试**  
   ```bash
   getent passwd alice   # 若返回 LDAP 条目说明成功
   ```

> **注意**：使用集中式目录时，**本地** `/etc/passwd` 与 LDAP 同步会产生冲突，建议统
一使用 `nsswitch.conf` 中的 `passwd: files sss`（先查本地，再查 LDAP）。

---

## 7️⃣ 自动化批量管理

### 7.1 使用 Ansible

```yaml
# playbook: users.yml
- hosts: all
  become: yes
  vars:
    users:
      - name: alice
        uid: 2001
        groups: ["wheel","docker"]
        shell: /bin/bash
        password: "{{ 'Password123' | password_hash('sha512') }}"
      - name: bob
        groups: ["developers"]
        state: absent   # 删除用户
  tasks:
    - name: Ensure groups exist
      group:
        name: "{{ item }}"
        state: present
      loop: "{{ users | map(attribute='groups') | flatten | unique }}"

    - name: Manage users
      user:
        name: "{{ item.name }}"
        uid: "{{ item.uid | default(omit) }}"
        groups: "{{ item.groups | default([]) }}"
        shell: "{{ item.shell | default('/bin/bash') }}"
        password: "{{ item.password | default(omit) }}"
        state: "{{ item.state | default('present') }}"
      loop: "{{ users }}"
```

```bash
ansible-playbook -i inventory users.yml
```

### 7.2 使用 `newusers` 批量导入

`/etc/passwd` 格式的文件：

```
alice:$(openssl passwd -6 Password123):2001:2001:Alice:/home/alice:/bin/bash
bob::2002:2002:Bob:/home/bob:/bin/bash
```

执行：

```bash
sudo newusers users.txt
```

---

## 8️⃣ 常见错误与排查

| 症状 | 可能原因 | 排查/解决 |
|------|----------|----------|
| `su: Authentication failure` | 密码错误、账号被锁定、PAM 配置错误 | `sudo 
pam-auth-update`（Debian）或检查 `/etc/pam.d/common-auth`；`passwd -S user` 查看锁定
状态 |
| `sudo: user is not in the sudoers file` | 未加入 sudo 组或 `/etc/sudoers` 没有相应
规则 | `sudo usermod -aG sudo user`；`visudo` 添加规则 |
| 新建用户登录后 `cd: no such file or directory` | `useradd` 未加 `-m` 或 
`/etc/default/useradd` 中 `CREATE_HOME=no` | 确认 home 目录已创建或手动 `mkdir -p 
/home/user && chown user:user /home/user` |
| `/etc/shadow` 权限错误导致登录失败 | `/etc/shadow` 被误改为可读/可写给普通用户 | 
`chmod 640 /etc/shadow && chown root:shadow /etc/shadow` |
| LDAP 登录慢 | DNS 解析或 TLS 证书校验超时 | 检查 `/etc/resolv.conf`、
`/etc/ldap/ldap.conf` 中的 `tls_reqcert`，使用 `ldapsearch` 手动测试 |

---

## 9️⃣ 安全最佳实践

1. **最小特权**：普通用户默认不在 sudo 组，只在需要时临时加入或使用 `sudo -u`。
2. **密码策略**：`/etc/login.defs` 与 `chage` 配合，强制定期更改、密码复杂度（通过 
PAM `pam_pwquality`）。
3. **账号锁定**：对多次登录失败的账号使用 `pam_faillock` 或 `pam_tally2` 锁定。
4. **审计**：开启 `auditd`，监控 `/etc/passwd`、`/etc/shadow`、`/etc/sudoers` 的改动
。
5. **SSH 密钥优先**：尽量禁用密码登录 (`PasswordAuthentication no`) 并使用密钥 + 
`AuthorizedKeysCommand` 集中管理。
6. **定期清理**：使用 `userdel -r` 删除不再使用的账号；保留账号的归档（如压缩 home）
供审计。
7. **分层管理**：生产环境使用专门的运维账号（如 `opsadmin`）而非 root；对关键系统使
用 **两因素认证**（Google Authenticator + SSH）。
8. **备份**：定期备份 `/etc/passwd /etc/shadow /etc/group`，并验证恢复流程。

---

## 10️⃣ 小结

- **创建** → `useradd` / `adduser`（Debian/Ubuntu 提供交互式脚本）  
- **配置** → `usermod`、`passwd`、`chage`、组管理、`sudoers`  
- **维护** → 锁定/解锁、密码过期、审计、日志  
- **删除** → `userdel`（视需求决定是否保留 home）  

通过熟练使用上述命令、了解核心配置文件以及遵守最小特权、密码策略、审计日志等安全原则
，你就能在任何 Linux 发行版上完成可靠、可审计的用户管理。  

如果你有特定发行版（如 RHEL、CentOS、Ubuntu、Arch）或业务场景（容器、K8s、云实例）下
的细节需求，欢迎继续提问！祝运维顺利 🚀。