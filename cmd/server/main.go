package main

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/westbrookdaniel/website/internal/templates"
)

func main() {
	http.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			templates.Templates.ExecuteTemplate(w, "404.html", nil)
			return
		}
		templates.Templates.ExecuteTemplate(w, "index.html", nil)
	})

	http.HandleFunc("GET /blog", func(w http.ResponseWriter, r *http.Request) {
		metas := readMetas()
		templates.Templates.ExecuteTemplate(w, "blog.html", metas)
	})

	http.HandleFunc("GET /blog/{slug}", func(w http.ResponseWriter, r *http.Request) {
		slug := r.PathValue("slug")
		html, err := os.ReadFile("build/posts/" + slug + ".html")
		if err != nil {
			templates.Templates.ExecuteTemplate(w, "404.html", nil)
			return
		}

		metas := readMetas()
		var meta templates.Meta
		for _, m := range metas {
			if m.Slug == slug {
				meta = m
				break
			}
		}

		post := templates.CreatePost(meta, html)

		templates.Templates.ExecuteTemplate(w, "post.html", post)
	})

	http.ListenAndServe("localhost:3000", nil)
}

func readMetas() []templates.Meta {
	b, err := os.ReadFile("./build/meta.json")
	if err != nil {
		panic(err)
	}

	metas := make([]templates.Meta, 0)

	err = json.Unmarshal(b, &metas)
	if err != nil {
		panic(err)
	}

	return metas
}
