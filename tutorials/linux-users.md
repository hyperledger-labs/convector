# For Linux Users

We have found that Linux users are facing some common difficulties and extra steps they have to go through. 

This document is the result of the community feedback in our <a href="https://github.com/worldsibu" target="_blank">repos</a> and <a href="https://discord.gg/twRwpWt" target="_blank"><i class="fab fa-discord"></i> Discord chat</a>.

## Docker Compose

### Issue

Docker doesn't include Compose by default.

### Fix

Install Compose from https://docs.docker.com/compose/install/

## Node Gyp errors

There are not Convector specific error but users have found them.

### Issue

```bash
- > node-gyp rebuild
gyp ERR! build error
gyp ERR! stack Error: not found: make
```

### Fix

Follow: https://github.com/nodejs/node-gyp#on-unix

### Issue

Node Gyp permissions issue.

```bash
gyp ERR! stack Error: EACCES: permission denied, mkdir '/usr/lib/node_modules/@worldsibu/hurley/node_modules/pkcs11js/.node-gyp'
```

### Fix

https://github.com/worldsibu/hurley/issues/6

## Script commands incompability

From @xcottos:

```
Hi all, it's not a convector issue but more an Ubuntu 18.04 one but I want to share it with you: there were some ppl receiving an error in Ubuntu 18.04 while invoking the cc:invoke script defined like that: "cc:invoke": "f() { chaincode-manager --config ./$2.$1.config.json --user $3 invoke $1 ${@:4}; }; f". The error was something like sh: 1: bad substitution. It's because by default linux uses sh (symlinked to dash in Ubuntu) for executing the npm scripts. For this reason if anyone asks for help on that the procedure is the following: 1) updating npm to a version >= 5 2) npm config set script-shell /bin/bash this is general for all ppl having the issue, while for Ubuntu users if the command npm -v still shows the old version of npm (like 3.5.7) they have to: 3) sudo apt purge npm 4) ln -s /usr/local/bin/npm /usr/bin/npm 5) npm config set script-shell /bin/bash it's because of bash caching the binaries links as documented here https://askubuntu.com/questions/1036278/npm-is-incorrect-version-on-latest-ubuntu-18-04-installation
```
