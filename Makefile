SHORT_SHA = $(shell git rev-parse --short HEAD)

build:
	# 도커 이미지 빌드
	docker build . --platform linux/amd64 --no-cache \
		--tag us-east1-docker.pkg.dev/newwwbi-playground/newwwbi-registry/hr-graphql-api:$(SHORT_SHA) \
		--tag us-east1-docker.pkg.dev/newwwbi-playground/newwwbi-registry/hr-graphql-api:latest

push: build
	# 도커 이미지 푸쉬
	docker push us-east1-docker.pkg.dev/newwwbi-playground/newwwbi-registry/hr-graphql-api:$(SHORT_SHA)
	docker push	us-east1-docker.pkg.dev/newwwbi-playground/newwwbi-registry/hr-graphql-api:latest

	# 가장 최근 푸쉬된 이미지 3개만 남기고 모두 제거
	gcloud artifacts docker images list us-east1-docker.pkg.dev/newwwbi-playground/newwwbi-registry/hr-graphql-api --sort-by=~CREATE_TIME | tail -n +3

deploy: push
	# GKE 이미지 업데이트
	kubectl set image deployment/hr-graphql-api hr-graphql-api=us-east1-docker.pkg.dev/newwwbi-playground/newwwbi-registry/hr-graphql-api:$(SHORT_SHA)