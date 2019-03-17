# Convector Examples

This is the examples project to test changes in the core project

As always, run the commands at the root of the base project

## Commands
- `npm run restart` - (Re)starts the dev environment and install the chaincodes
- `npm run restart:quick` -  Same a restart, but doesn't clean or compile the projects

### Tests
- `npx lerna run --scope @worldsibu/convector-example-token --stream test` - Runs the unit test (simulated chaincode) `*.spec.ts`
- `npx lerna run --scope @worldsibu/convector-example-token --stream test:e2e` - Runs the e2e test (needs the dev-env up) `*.e2e.ts`
- Add `-- -- --inspect` to any of those to run the test in debug mode
