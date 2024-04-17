echo "Removing node_modules directory from frontend"
rm -rf frontend/node_modules
echo "Removing node_modules directory from backend"
rm -rf server/node_modules
echo "Removing cdk.out directory from backend"
rm -rf server/cdk.out
echo "Running backend scan"
./run_codeguru_security.sh backendscan server us-east-1
echo "Running frontend scan"
./run_codeguru_security.sh frontendscan frontend/  us-east-1
echo "Restoring npm packages for frontend"
cd frontend
npm install
echo "Restoring npm packages for frontend"
cd ../server 
npm install