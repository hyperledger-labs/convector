Tellus Development Environment installer

All the development binaries will run inside Vagrant (Go, Node, Fabric), also Tellus code, which will be installed through Vagrant.
Vagrant will orchestrate your host to deploy VMs and control the docker containers.
The code editor will run on your host as well, but it will use a shared folder, letting you run the app in Vagrant but edit the code without noticing that it actually is hosted in Vagrant's VM.

On your host machine:
- Vagrant: https://www.vagrantup.com/downloads.html
- And VirtualBox: https://www.virtualbox.org/wiki/Downloads

Simply after that, you only need to set up Vagrant.
Move your console root to this folder (it will be the root of everything inside the development environment).

Fill the .env variables with your username and password.

Run:
./initVagrant.sh

Wait a few minutes (it's downloading everything).

Finally, we only need to route some things back to your VM so that you can access the web pages on the browser, the APIs in the Postman and the docker commands to your host.
Everytime you are starting to develop software, run:
./letsRock.sh