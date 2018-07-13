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
