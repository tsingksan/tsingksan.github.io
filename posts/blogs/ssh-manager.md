---
title: SSH管理  
date: 2024-12-21
author: Tsingksan
update: 2024-12-21 16:01:01
---

<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
console.log(theme)
</script>

## SSH 密钥管理

### 生成 SSH 密钥

生成 SSH 密钥是使用 SSH 进行身份验证的第一步。通过以下命令生成一个新的 SSH 密钥对：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- -t ed25519 指定生成 Ed25519 类型的密钥，这是目前推荐的加密方式，具有更高的安全性
- -C 用于设置密钥的注释（通常是你的电子邮件地址）

系统会提示你：

1. 指定密钥存储路径（默认为 ~/.ssh/id_ed25519）
2. 设置密钥密码（建议设置以增加安全性）

### SSH KEY 查看

如果你需要查看已有的 SSH 密钥，可以使用以下命令：

```bash
cat ~/.ssh/id_ed25519.pub
```

这将显示公钥内容，你可以将其添加到相应的 Git 服务（如 GitHub、GitLab）中。

## GPG-Agent

GPG-Agent 可以作为 SSH agent 使用，提供统一的密钥管理和更好的安全性。

### GPG 生成

首先，你需要生成一个 GPG 密钥对：

```bash
gpg --full-generate-key
```

### 配置 GPG-Agent

配置 GPG-Agent 需要几个步骤：

1. 首先安装必要的软件
   首先你需要下载 pinentry 进行密钥缓存：

- macOS（Nix）：`pinentry_mac`
- NixOS：`pinentry-tty` 

    > [!TIP]
    > 其他系统：请查询对应的包管理器

2. 配置 GPG-Agent
   编辑 `~/.gnupg/gpg-agent.conf`：

```conf
enable-ssh-support
pinentry-program "pinentry path" # 使用 which pinentry-tty 查找路径
max-cache-ttl 60480000
default-cache-ttl 60480000
default-cache-ttl-ssh 60480000
max-cache-ttl-ssh 60480000
```

3. 添加 keygrip
   编辑 `~/.gnupg/sshcontrol`：

```conf
# openpgp:0xXXXXXXX
7A8EF0F2A9317619F25544DCBBEF6996CCDAFCEA
```

### GPG-Agent 服务管理

常用的服务管理和故障排除命令：

```bash
echo $SSH_AUTH_SOCK
gpg-connect-agent UPDATESTARTUPTTY /bye
gpgconf --kill gpg-agent
gpgconf --reload gpg-agent
gpgconf --launch gpg-agent
gpg-agent --daemon
```

## SSH 分流配置

为了方便管理不同的 Git 仓库和账户，可以配置 ~/.ssh/config 文件：

```ssh-config
# ┌─────────────────────────────────────────────────────────────────┐
#                                github   
# └─────────────────────────────────────────────────────────────────┘
Host github.com
    Hostname ssh.github.com
    User git
    Port 443

Host work.github.com
    HostName github.com
    User git
    Port 443
    IdentityFile ~/.ssh/id_ed25519

# ┌─────────────────────────────────────────────────────────────────┐
#                                gitlab   
# └─────────────────────────────────────────────────────────────────┘
Host work.gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519

Host person.gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/person-gitlab
```

配置说明：

- 使用 Port 443 可以避免某些网络限制
- 通过不同的 Host 项可以区分工作和个人账号
- IdentityFile 指定每个服务使用的 SSH 密钥

## Git 仓库配置管理

在不同的 Git 仓库间切换时，可能需要使用不同的配置。有以下几种方式：

### 1. 使用 direnv 控制环境变量

可以利用 [Git 环境变量](https://git-scm.com/book/be/v2/Git-Internals-Environment-Variables) 配合 direnv 进行仓库特定的设置。

### 2. Git 本地配置

使用 git config 命令设置仓库特定的配置：

```bash
git config user.email "your_email@example.com"
git config --local commit.gpgSign false
```

### 3. Git Hooks

虽然配置较为复杂，但可以提供更强大的自动化能力。

## 常见问题排查

### SSH 连接问题

- 确认 SSH 密钥已添加到服务
- 检查 SSH agent 状态：`ssh-add -l`
- 测试连接：`ssh -T git@github.com`

### GPG-Agent 问题

- 确认 gpg-agent 正在运行
- 检查环境变量：`echo $GPG_TTY`
- 验证 SSH_AUTH_SOCK 是否指向 GPG agent

最后提醒：请始终确保你的 SSH 和 GPG 配置得到适当的保护和备份。
