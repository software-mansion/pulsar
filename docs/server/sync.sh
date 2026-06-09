cd ../../../pulsar-server
cp -r ../pulsar/docs/server/* ./
rm sync.sh
rm -rf node_modules 
rm -rf dist
git add .
git commit -m "Sync server Pulsar files"
git push origin main
cd ../pulsar/docs/server/
