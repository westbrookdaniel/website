---
title: "Why Some Programming Languages Can't Find Their Perfect Framework"
description: "Lessons from Go, Ruby, and JavaScript's diverging paths"
date: "2024-11-24T00:00:00.000Z"
snippet: "Some programming languages flourish with one dominant server framework, while others split into a maze of competing options. Through practical Go and JavaScript server comparisons, this analysis shows how early ecosystem stability shapes a language's future."
tags: post
layout: layouts/post.njk
---

Some languages are really good at having a consistent experience for building http servers across the whole ecosystem, like Go which has [great http standard library](https://pkg.go.dev/net/http). Plenty of other languages have an extremely dominant framework for creating servers, like Ruby's like Ruby on Rails. Despite this, other prominent languages like JavaScript and Python both lack this dominating consistency? Why? I don't have enough experience to speak for [Python's http standard library](https://docs.python.org/3/library/http.html) but in modern versions of JavaScript/NodeJS it's [standard library can be quite effective and pretty similar in simplicity to Go's](https://nodejs.org/en/learn/modules/anatomy-of-an-http-transaction).

Here's quick comparison between a simple server built with Go's standard library and one built with JavaScript's standard library. To prove how simple they can be be to use I've gotten ChatGPT to generate the code for both of these (which to be fair did require be pushed to use modern JavaScript features like ESModules).

```go
package main

import (
	"fmt"
	"io"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	// Simple body parsing
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Responding to requests
	fmt.Fprintf(w, "Received: %s\n", string(body))
}

func main() {
	http.HandleFunc("/", handler)

	// Serve static files
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	fmt.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Error starting server: %s\n", err)
	}
}
```

```js
import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to parse the request body
const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

// Serve static files
const serveStatic = async (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "static",
      req.url.replace("/static/", ""),
    );
    const fileContent = await fs.readFile(filePath);
    res.writeHead(200);
    res.end(fileContent);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("File not found");
  }
};

// Request handler
const server = http.createServer(async (req, res) => {
  if (req.method === "POST") {
    try {
      const body = await parseBody(req);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`Received: ${body}`);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error processing request");
    }
  } else if (req.url.startsWith("/static/")) {
    await serveStatic(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
```

With the JavaScript example being quite comparable (especially if you overlook the parseBody and serverStatic utilities), why has the JavaScript ecosystem become fragmented with many major servers like Express, Fastify, NextJS, Remix, etc whilst Go's remains mostly using the standard library?

I believe this comes down to one simple reason:

## Early Stability

For the languages Go and Ruby, when they received their mass adoption they already had establish patterns for how to develop everything you need for http servers. For example at the inception of Go's use, it already had a quite robust and easy to use http standard library.

[Ruby on Rails](https://rubyonrails.org/) here is an interesting example. Whilst it has unchallenged dominance in the Ruby space, that wasn't always the case. There were times in the projects life where competitors flourished, such as [Merb](https://en.wikipedia.org/wiki/Merb). They took a relative unique approach to resolve this competition which involved merging the two open projects together. See the [Ruby on Rails Documentary](https://www.youtube.com/watch?v=HDKUEXBF3B4) for more information on the projects history.

I think the JavaScript and Python ecosystems could benefit a lot from learning from the experiences of it's language peers like Rails. Perhaps one day we could see frameworks like Express and NextJS putting aside their differences and join forces to help move the industries stability forward, as unfeasible as that seems today.

## What Could We Lose?

Frequently the argument is made that by merging major frameworks together in this way you lose the specialisation in solving particular problems and uses cases. JavaScript's wide variety of packages on NPM is a good example of this. Although, fragmentation of the developer community through this practice can backfire leading to unreasonable amounts of complexity being built into projects. This problem also get's exacerbated as the project matures and grows, especially in larger corporations or if packages become deprecated.

Anyone who's had extended experience maintaining a large project would agree that it's a lot easier to migrate something like a Ruby on Rails repository than it is to update all the packages in an older React 16 + Express + NestJS + Material UI + Redux + etc project. Especially if one of those packages is deprecated and required to be replaced by something with a different API.

In order to help improve my experience maintaining the projects I develop or work on, I have and will continue to try where possible to not stray from larger trusted libraries/tools in a languages ecosystem, and to try to reduce the total amount of packages I use. I feel that there is a lot of time that can be saved from taking a more minimalistic approach, even if it requires writing slightly more code yourself rather than relying on others packages.
