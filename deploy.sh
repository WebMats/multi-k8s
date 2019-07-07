docker build -t orlando10/multi-client:latest -t orlando10/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t orlando10/multi-server:latest -t orlando10/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t orlando10/multi-worker:latest -t orlando10/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push orlando10/multi-client:latest
docker push orlando10/multi-client:$SHA
docker push orlando10/multi-server:latest
docker push orlando10/multi-server:$SHA
docker push orlando10/multi-worker:latest
docker push orlando10/multi-worker:$SHA

kubectl apply -f ./k8s/

# kubectl rollout restart
kubectl set image deployments/server-deployment server=orlando10/multi-server:$SHA
kubectl set image deployments/client-deployment client=orlando10/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=orlando10/multi-worker:$SHA