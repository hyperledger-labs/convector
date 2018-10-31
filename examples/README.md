# Convector Examples

This is the exmaples project to test changes in the core project

As always, run the commands at the root of the base project

## Commands
- `npm run restart` - (Re)starts the dev environment and install the chaincodes
- `npm run restart:quick` -  Same a restart, but doesn't clean or compile the projects
- `npm run cc:upgradeInAll -- 2` - Updates the test chaincodes at version 2 (the number has to be alwasy different)

### Tests
- `lerna run --scope @worldsibu/convector-example-token --stream test` - Runs the unit test (simulated chaincode) `*.spec.ts`
- `lerna run --scope @worldsibu/convector-example-token --stream test:e2e` - Runs the e2e test (needs the dev-env up) `*.e2e.ts`
