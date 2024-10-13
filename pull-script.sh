cd /home/ahmed/hg-db-projects

git pull

docker compose build app
docker compose down
docker volume rm hg-db-projects_appdata
docker compose up -d app --scale app=1
docker compose up -d
docker image prune -f