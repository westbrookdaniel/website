package main

import (
	"encoding/json"
	"net/http"
	"os"
	"slices"

	"github.com/westbrookdaniel/website/internal/templates"
)

func handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		templates.Templates.ExecuteTemplate(w, "404.html", nil)
		return
	}
	metas := readMetas()
	templates.Templates.ExecuteTemplate(w, "index.html", metas[:3])
}

func handleBlog(w http.ResponseWriter, r *http.Request) {
	metas := readMetas()
	templates.Templates.ExecuteTemplate(w, "blog.html", metas)
}

func handlePost(w http.ResponseWriter, r *http.Request) {
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
}

func main() {
	http.Handle("GET /public/", http.FileServer(http.Dir("")))

	http.HandleFunc("GET /", handleIndex)

	http.HandleFunc("GET /blog", handleBlog)
	http.HandleFunc("GET /blog/{$}", handleBlog)

	http.HandleFunc("GET /blog/{slug}", handlePost)
	http.HandleFunc("GET /blog/{slug}/{$}", handlePost)

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

	slices.SortFunc(metas, func(a templates.Meta, b templates.Meta) int {
		return b.Date.Compare(a.Date)
	})

	return metas
}
