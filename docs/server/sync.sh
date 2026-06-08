cd ../../../pulsar-server
cp -r ../pulsar/docs/server/* ./
rm sync.sh
rm node_modules -rf
rm dist -rf
git add .
git commit -m "Sync server Pulsar files"
git push origin main
cd ../pulsar/docs/server/
