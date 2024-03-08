watch:
	air -c .air.toml

server:
	go run ./cmd/server

build: FORCE
	go run ./cmd/build

FORCE:
