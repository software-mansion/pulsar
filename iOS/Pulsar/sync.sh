cd ../../../pulsar-ios
cp -r ../pulsar/iOS/Pulsar/* ./
rm sync.sh
git add .
git commit -m "Sync iOS Pulsar files"
git push origin main
cd ../pulsar/iOS/Pulsar/
