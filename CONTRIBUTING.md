# Contributing

## Git Workflow

Refer to the [GiHub Flow](https://guides.github.com/introduction/flow/) rules
for more details, but in short:

- Fork the proyect and create a PR to the original one when you are done
- Always create the changes in a feature branch, using a descriptive name for the change
- Provide a short but descriptive message in your commits, they will be all squashed into one once the branch gets merged
- *Never* push to master or develop
- Update your local development branch with `git pull --rebase origin develop`
- Always provide unit tests for your changes if applicable

## Getting Started

- `npm i` to build and install all inner dependencies
- Make the neecessary changes
- Follow the guide in `samples/README.md` to start the example project
- Test your changes agains it

Before get your hands down to code please open an issue describing your idea,
or refer to our [Discord](https://discord.gg/hG33TK) chat

## Submitting a pull request

Make sure to follow the [PR template](https://raw.githubusercontent.com/hyperledger-labs/convector/blob/develop/.github/PULL_REQUEST_TEMPLATE.md)

- Squash all your commits into one, following the [conventional commits guide](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
