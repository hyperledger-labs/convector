# kill containers
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

# show containers
## running
docker ps
## all
docker ps -a

# show images
docker image ls

 - docker ls // running machines
 - docker attach 00adad7dd103 // attach to logs
 - docker stop $(docker ps -a -q)
 - docker rm $(docker ps -a -q) // remove containers

# Others
## Refresh terminal
- source ~/.bash_profile - reset terminal
- chmod 777 XXXX - give permissions to file


## kill port
- sudo lsof -i :8002
- sudo kill <PID>