watch:
	go run ./cmd/build/main.go
	air -c .air.toml

server:
	go run ./cmd/build/main.go
	go run ./main.go
