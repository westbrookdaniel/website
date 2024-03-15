package main

import (
	"embed"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"

	"github.com/westbrookdaniel/website/templates"
)

//go:embed build/**/*
var b embed.FS

type Page struct {
	Path  string
	Post  templates.Post   // optional
	Metas []templates.Meta // optional
}

func (p Page) IsActive(href string) bool {
	if href == "/" {
		return href == p.Path
	}
	return strings.HasPrefix(p.Path, href)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		err := templates.Templates.ExecuteTemplate(w, "404.html", Page{
			Path: r.URL.Path,
		})
		check(err)
		return
	}
	metas := readMetas()
	err := templates.Templates.ExecuteTemplate(w, "index.html", Page{
		Path:  r.URL.Path,
		Metas: metas[:3],
	})
	check(err)
}

func handleBlog(w http.ResponseWriter, r *http.Request) {
	metas := readMetas()
	err := templates.Templates.ExecuteTemplate(w, "blog.html", Page{
		Path:  r.URL.Path,
		Metas: metas,
	})
	check(err)
}

func handlePost(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	html, err := b.ReadFile("build/posts/" + slug + ".html")
	if err != nil {
		err = templates.Templates.ExecuteTemplate(w, "404.html", Page{
			Path: r.URL.Path,
		})
		check(err)
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

	err = templates.Templates.ExecuteTemplate(w, "post.html", Page{
		Path: r.URL.Path,
		Post: post,
	})
	check(err)
}

func main() {
	addr := os.Getenv("PORT")
	if addr == "" {
		addr = "localhost:3000"
	} else {
		addr = ":" + addr
	}

	http.Handle("GET /public/", http.FileServer(http.Dir("")))

	http.HandleFunc("GET /", handleIndex)

	http.HandleFunc("GET /blog", handleBlog)
	http.HandleFunc("GET /blog/{$}", handleBlog)

	http.HandleFunc("GET /blog/{slug}", handlePost)
	http.HandleFunc("GET /blog/{slug}/{$}", handlePost)

	log.Println("listening on", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func readMetas() []templates.Meta {
	b, err := b.ReadFile("build/meta.json")
	check(err)

	metas := make([]templates.Meta, 0)

	err = json.Unmarshal(b, &metas)
	check(err)

	slices.SortFunc(metas, func(a templates.Meta, b templates.Meta) int {
		return b.Date.Compare(a.Date)
	})

	return metas
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
