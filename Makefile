watch:
	go run ./cmd/build
	air -c .air.toml

server:
	go run ./cmd/build
	go run ./cmd/server
