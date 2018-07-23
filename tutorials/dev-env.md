## Guides

- [Getting-Started](https://github.com/worldsibu/convector/blob/develop/tutorials/getting-started.md)
- [A typical starter project](https://github.com/worldsibu/convector/blob/develop/tutorials/starter-project.md)
- [Packages](https://github.com/worldsibu/convector/blob/develop/tutorials/packages.md)
- [Models](https://github.com/worldsibu/convector/blob/develop/tutorials/models.md)
- [Controllers](https://github.com/worldsibu/convector/blob/develop/tutorials/controllers.md)
- [ChaincodeManger](https://github.com/worldsibu/convector/blob/develop/tutorials/chaincode-manager.md)
- [DevEnv](https://github.com/worldsibu/convector/blob/develop/tutorials/dev-env.md)

# Development Environment

We have a tool to manage your dev enviornmnet easily with some commands.
Once you install [@worldsibu/convector-tool-dev-env](https://www.npmjs.com/package/@worldsibu/convector-tool-dev-env) installed you will have the folowwing commands available in your `.bin` folder inside the `node_modules`:

- `dev-env-start` - Start the docker containers
- `dev-env-stop` - Stop the docker containers
- `dev-env-init` - Init de docker containers with two channels, 1 admin user and 3 regular users per org
- `dev-env-clean` - Remove all the docker containers and the generated chaincode images
- `dev-env-restart` - Destroy and start your env fresh again
- `user-registry` - Register admin/users

## User Registry

### Register Admin

```bash
user-registry add-admin [username] [password] [msp] \
  --keystore ./.hfc-key-store \
  --profile ./network-profile.yaml
```

### Register User

```bash
user-registry add-user [username] [admin-username] [msp] \
  --role [role] \
  --affiliation [affiliation] \
  --keystore ./.hfc-key-store \
  --profile ./network-profile.yaml
```

----
----

Created with <span style="color: red;">♥</span> by [WorldSibu](http://worldsibu.com/)

[![Issues](https://img.shields.io/github/issues-raw/@worldsibu/convector.svg)](https://github.com/worldsibu/convector/issues)
[![Newsletter](https://img.shields.io/badge/Newsletter--orange.svg)](https://worldsibu.io/subscribe/)
[![Discord](https://img.shields.io/discord/469152206638284800.svg)](https://discord.gg/twRwpWt)

[![npm](https://img.shields.io/npm/v/@worldsibu/convector-core-chaincode.svg)](https://www.npmjs.com/package/@worldsibu/convector-core-chaincode)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
