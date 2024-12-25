---
title: 在 macOS 和 VMware Fusion 中运行 NixOS 的 Nix 配置
date: 2024-12-22
author: Tsingksan
update: 2024-12-22 16:01:01
---


---
设备: macbook air M3

## Nix 的安装

首先需要[安装 Nix 包管理器](https://nixos.org/download/)。

```
sh <(curl -L https://nixos.org/nix/install)
```

他会在根目录下创建一个nix分区，用来管理nix的包。


## nix-darwin 的配置

安装完 Nix 后，我选择了 nix-darwin 来管理 macOS 系统配置。这个工具可以让我用声明式的方式管理 macOS 的系统设置。(nix-darwin 基于 nix)

首先安装 [nix-darwin](https://github.com/LnL7/nix-darwin)：

```bash
mkdir -p ~/.config/nix
cd ~/.config/nix
nix flake init -t nix-darwin
sed -i '' "s/simple/$(scutil --get LocalHostName)/" flake.nix
```

会生成一个`flake.nix`文件

`darwin-rebuild` 安装在您的 `PATH` 中
```bash
nix run nix-darwin -- switch --flake ~/.config/nix
```

运行 darwin-rebuild 以将更改应用到您的系统

```bash
# darwin-rebuild switch --flake flake-path-dir#hostname
darwin-rebuild switch --flake ~/.config/nix
```


## 使用home-manager

添加[home-manager](https://nix-community.github.io/home-manager/index.xhtml#sec-flakes-nix-darwin-module)
```nix
{
  description = "Example nix-darwin system flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nix-darwin.url = "github:LnL7/nix-darwin";
    nix-darwin.inputs.nixpkgs.follows = "nixpkgs";

    home-manager.url = "github:nix-community/home-manager";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = inputs@{ self, home-manager, nix-darwin, nixpkgs }:
  let
    configuration = { pkgs, ... }: {
      users.users.todd.home = "/Users/todd";

      # List packages installed in system profile. To search by name, run:
      # $ nix-env -qaP | grep wget
      environment.systemPackages =
        [ pkgs.vim
        ];

      # Necessary for using flakes on this system.
      nix.settings.experimental-features = "nix-command flakes";

      # Enable alternative shell support in nix-darwin.
      # programs.fish.enable = true;

      # Set Git commit hash for darwin-version.
      system.configurationRevision = self.rev or self.dirtyRev or null;

      # Used for backwards compatibility, please read the changelog before changing.
      # $ darwin-rebuild changelog
      system.stateVersion = 5;

      # The platform the configuration will be used on.
      nixpkgs.hostPlatform = "aarch64-darwin";
    };
  in
  {
    # Build darwin flake using:
    # $ darwin-rebuild build --flake .#Todd-MacBook-Air
    darwinConfigurations."Todd-MacBook-Air" = nix-darwin.lib.darwinSystem {
      system = "x86_64-darwin";
      modules = [  
        configuration
        home-manager.darwinModules.home-manager
          {
            home-manager.useGlobalPkgs = true;
            home-manager.useUserPackages = true;
            home-manager.users.todd = import ./home.nix;

            # Optionally, use home-manager.extraSpecialArgs to pass
            # arguments to home.nix
          }
      ];
    };
  };
}


```

添加home.nix
```nix
{ config, pkgs, lib, inputs, ... }:

{
  home = {
    username = "todd";
    homeDirectory = "/Users/todd";
    stateVersion = "24.11";

    packages = with pkgs; [
      tree
      eza
      fd
      bat
    ];
  };
}
```

甚于配置请参考文档
[NixOS](https://nixos.org/manual/nixos/stable/options)
[Nix-darwin](https://daiderd.com/nix-darwin/manual/index.html)
[Home-manager](https://nix-community.github.io/home-manager/options.xhtml#opt-xdg.configFile._name_.recursive)

## flake.nix隔离开发环境

旧的可以使用`nix shell`，我这里展示新特性flake.nix

使用`nix flake init`创建文件，或者使用下面代码

```nix
{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    pkgs = import nixpkgs { system = "aarch64-linux"; };
  in {
    devShell.aarch64-linux = pkgs.mkShell {
      buildInputs = [
        pkgs.nodejs
        pkgs.go
      ];
      shellHook = ''
        echo hi
      '';
    };
  };
}
```

> [!TIP]
> 如果是用的是M芯片的macos，`aarch64-linux`替换为`aarch64-darwin`

```bash
# 进入开发环境
nix develop
```

> 如果你想[进入目录自动运行nix develop](https://discourse.nixos.org/t/automatically-run-nix-shell-after-navigating-to-a-directory/14692)请使用[direnv](https://direnv.net/)

## nix-shell自动使用zsh环境

- [Nix shell的时候使用zsh](https://github.com/NixOS/nix/pull/545)，使用这个[解决](https://discourse.nixos.org/t/nix-shell-does-not-use-my-users-shell-zsh/5588/12)
- 关于home-manager社区里[nix-shell -p 的时候使用 zsh](https://github.com/nix-community/home-manager/issues/989)的讨论


由于日常项目里只有我使用nix，我不方便吧flake.nix传递到我的git仓库，就会出现flake.nix无法被cp到/nix/store/下。社区也同样讨论了这个[问题](https://discourse.nixos.org/t/can-i-use-flakes-within-a-git-repo-without-committing-flake-nix/18196/26)。这里是一些[flake.nix不放在git中使用](https://mtlynch.io/notes/use-nix-flake-without-git/)的方案


暂时我没有使用flake.nix管理项目环境。
1. flake.nix在git项目里必须要被git跟踪，但是只需要个人使用
2. flake.nix如果往文件根一点的层级放，会吧node_modules也copy到/nix/store里
3. 虽然隔离了项目依赖，但是相当于copy了一次项目文件（.gitignore的会被忽略）

目前我是nix全局安装language包，有版本需求使用`nix-shell -p`。


## VM fusion 搭建nixos开发环境

我受到了[mitchellh](https://mitchellh.com/)的[nixos-config](https://github.com/mitchellh/nixos-config)的启发，想尝试把nixos安装到VM fusion中。然后把fusion当作类似于终端一样。这样子我可以获得linux体验。也不会被图形界面困扰。

mitchellh 同样也是 [ghostty](https://github.com/ghostty-org) 的发起者


### NAT 网络模式下端口转发

日常我开发web app的时候会使用host 0.0.0.0，然后通过本机ip访问。偶尔我如果想用loaclhost:port访问呢？

那就需要配置端口转发。

> [!NOTE]
> macos 里 VM fusion 的 NAT 网络模式是前提

```bash
sudo vim /Library/Preferences/VMware\ Fusion/vmnet8/nat.conf
```
添加端口映射
```{6}
[incomingtcp]

# Use these with care - anyone can enter into your VM through these...
# The format and example are as follows:
#<external port number> = <VM's IP address>:<VM's port number>
3000 = 172.16.3.128:3000

[incomingudp]

# UDP port forwarding example
#6000 = 172.16.3.0:6001
```

重启VMWare networking

```
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --stop   
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --start                                                                                   
```
一些解决方案链接

> [Configure NAT port forwarding on VMWare Fusion for SSH](https://alexsm.com/vmware-fusion-nat-port-forwarding-ssh/) 
>
> [Redirect port on Mac to VMWare](https://superuser.com/questions/316625/redirect-port-on-mac-to-vmware)
>
> [VMware Fusion NAT port forwarding](https://www.cnblogs.com/yanlin-10/p/10126297.html)



## 遇到的一些问题


### `nix-rebuild switch --flake xx`被告知/nix/store/xxxx文件找不到

这个问题我排除了三个多小时，解决方案是`git add`，flake.nix会自动追踪`.gitignore` git仓库，只有被git 仓库追踪了才会被copy到/nix/store/下。[rebuild 时候 nix 里没找到文件]((https://discourse.nixos.org/t/readfile-doesnt-find-file/21103))


### corepack enable 错误

[创建一个pnpm-shim](https://github.com/nodejs/corepack/issues/416#issuecomment-1975195595),reddit上[讨论](https://www.reddit.com/r/NixOS/comments/1d3z7fn/installed_nodejs_20_via_configurationnix_but_cant/)


### xdg-enable = true 不生效
[xdg-enable = true not work](https://discourse.nixos.org/t/home-manager-xdg-xxx-env-vars-are-not-getting-created/49320)

home-manager配置文件里
```nix
programs.ssh.enable = true;
```


### macos访问Vm fusion web服务，无法hot更新

我使用 macos 图形界面进行codeing。vm fusion里使用了nixos 跑命令行。macos向vm fusion共享了当前用户文件夹。当我在我在nixos 跑 vite air之类的，无法热更。

**原因**macos端修改代码后都不会触发inotify 通知给webpaack 或者 vite air之类的， 从而无法热更

问题出现了，我vscode修改代码。不会触发nixo正在run的前端进程。我不想使用vscode ssh到虚拟机里修改代码，因为这样子非常的损耗性能



#### Vscode SSH 模式（性能较差）

- 性能不太好

~/.ssh/config 中添加了

```
Host vm
    HostName vmIp
    User vmUser
```

nixos-config 
```nix
programs.nix-ld.enable = true;
```

我这里不用指定私钥，使用我默认私钥

[VSCode Remote SSH on NixOS: “Could not start dynamically linked executable” Error ](https://discourse.nixos.org/t/vscode-remote-ssh-on-nixos-could-not-start-dynamically-linked-executable-error/54591)


#### NFS方向共享给macos

- 优点：接近本地文件访问速度
- 缺点：需要额外配置，安全性较低
- 适用场景：大量文件操作、高性能要求

**配置 NFS：**
```nix
# NixOS configuration.nix
services.nfs.server = {
  enable = true;
  exports = "/path/to/project *(rw,sync,all_squash,anonuid=1000)";
};
```

**macOS 挂载**
```nix
# NixOS configuration.nix
services.nfs.server = {
  enable = true;
  exports = "/path/to/project *(rw,sync,all_squash,anonuid=1000)";
};
```

**Git 的问题**
```bash
# fatal: detected dubious ownership in repository at '/Users/todd/Documents/host/fe/roadmap'
# To add an exception for this directory, call:
  git config --global --add safe.directory /Users/todd/Documents/host/fe/roadmap
```


> [NixOS 挂载 NFS 共享目录](https://thornelabs.net/posts/operation-not-permitted-mounting-nfs-share-on-os-x-mountain-lion/)
