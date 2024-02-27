package main

import (
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
		templates.Templates.ExecuteTemplate(w, "blog.html", nil)
	})

	http.HandleFunc("GET /blog/{slug}", func(w http.ResponseWriter, r *http.Request) {
		slug := r.PathValue("slug")
		html, err := os.ReadFile("build/" + slug + ".html")
		if err != nil {
			templates.Templates.ExecuteTemplate(w, "404.html", nil)
			return
		}
		w.Write(html)
	})

	http.ListenAndServe("localhost:3000", nil)
}
