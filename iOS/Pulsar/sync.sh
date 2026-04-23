cd ../../../pulsar-ios
# pwd
# for file in *; do
#     if [ "$file" != ".git" ]; then
#         # rm -rf "$file"
#         echo "Removing $file"
#     fi
# done
cp -r ../pulsar/iOS/Pulsar/* ./
# git add .
# git commit -m "Sync iOS Pulsar files"
# git push origin main
rm sync.sh
cd ../pulsar/iOS/Pulsar/

