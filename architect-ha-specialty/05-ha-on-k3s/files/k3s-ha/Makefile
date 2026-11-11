# Pentaho HA on K3s - course workshop targets.
# Draft scaffold: validate against a live cluster before relying on it.
NAMESPACE ?= pentaho
REPLICAS  ?= 2

.PHONY: ha-install ha-scale ha-status ha-destroy

ha-install:
	kubectl apply -f pentaho-ha-deployment.yaml
	kubectl apply -f pentaho-ha-service.yaml
	kubectl apply -f pentaho-ha-ingress.yaml
	kubectl -n $(NAMESPACE) rollout status deploy/pentaho-server-ha

ha-scale:
	kubectl -n $(NAMESPACE) scale deploy/pentaho-server-ha --replicas=$(REPLICAS)
	kubectl -n $(NAMESPACE) rollout status deploy/pentaho-server-ha

ha-status:
	kubectl -n $(NAMESPACE) get pods -l app=pentaho-server-ha -o wide
	kubectl -n $(NAMESPACE) get endpoints pentaho-server-ha

ha-destroy:
	kubectl delete -f pentaho-ha-ingress.yaml --ignore-not-found
	kubectl delete -f pentaho-ha-service.yaml --ignore-not-found
	kubectl delete -f pentaho-ha-deployment.yaml --ignore-not-found
