# 基于Linux系统管理 -- 创建用户

---

### **在Ubuntu下创建用户 `u0_a225` 并将其加入 `sudo` 组的步骤**

#### **方法一：使用 `adduser` 和 `usermod` 命令（推荐，交互式）**

1. ​**打开终端**​，使用 `sudo` 权限执行以下命令创建新用户：
   ```bash
   sudo adduser u0_a225
   ```
   
   * 系统会提示你设置新用户的密码（建议设置一个强密码）。
   * 之后，可以按需填写用户的全名、房间号、电话等信息（均可直接按 `Enter` 跳过）。
2. ​**将用户添加到 `sudo` 组**​，以授予管理员权限：
   ```bash
   sudo usermod -aG sudo u0_a225
   ```
   
   * `-aG` 选项表示 **追加​** (`-a`) 用户到指定的**组** (`-G`) `sudo`，避免移除用户现有的其他组。
3. ​**验证配置**​：
   * 查看用户所属组：
     ```bash
     groups u0_a225
     ```
     
     输出应包含 `sudo`。
   * 或者，使用新用户身份执行 `sudo` 命令进行测试：
     ```bash
     sudo -u u0_a225 sudo whoami
     ```
     
     输入为该用户设置的密码后，命令应输出 `root`，证明其拥有 `sudo` 权限。

#### **方法二：使用 `useradd` 命令（非交互式，适合脚本）**

1. 创建用户（不创建家目录需加`-M`，但通常需要家目录）并设置密码：
   ```bash
   sudo useradd -m -s /bin/bash u0_a225
   echo "u0_a225:your_password_here" | sudo chpasswd
   ```
   
   * `-m`：创建用户家目录（`/home/u0_a225`）。
   * `-s /bin/bash`：设置默认shell为bash。
2. 将用户添加到 `sudo` 组：
   ```bash
   sudo usermod -aG sudo u0_a225
   ```
3. 验证步骤同方法一。

#### **注意事项**

1. ​**用户命名**​：`u0_a225` 的命名风格与安卓系统用户ID（UID）类似（如 `u0_a225` 通常代表安卓应用的用户）。在普通的Ubuntu系统中，这只是一个普通的用户名，没有特殊含义。
2. ​**`sudoers` 文件**​：将用户加入 `sudo` 组，等价于在 `/etc/sudoers` 文件中添加了 `%sudo ALL=(ALL:ALL) ALL` 这一行所授予的权限。
3. ​**安全**​：请务必为该用户设置一个强密码，并谨慎授予 `sudo` 权限。

​**总结**​：在Ubuntu系统中，只需两条命令即可创建用户并赋予管理员权限。推荐使用 **`sudo adduser u0_a225`** 创建用户，然后使用 **`sudo usermod -aG sudo u0_a225`** 将其加入 `sudo` 组。

