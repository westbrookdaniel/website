package main

import (
	"bytes"
	"html/template"
	"net/http"
	"os"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"go.abhg.dev/goldmark/frontmatter"
)

var templates = template.Must(template.ParseGlob("templates/*.html"))

type Meta struct {
	Title       string `yaml:"title"`
	Description string `yaml:"description"`
	Date        string `yaml:"date"`
	Snippet     string `yaml:"snippet"`
}

type Post struct {
	Slug        string
	Content     template.HTML
	Title       string
	Description string
	Date        string
	Snippet     string
}

func main() {
	http.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			templates.ExecuteTemplate(w, "404.html", nil)
			return
		}
		templates.ExecuteTemplate(w, "index.html", nil)
	})

	http.HandleFunc("GET /blog", func(w http.ResponseWriter, r *http.Request) {
		templates.ExecuteTemplate(w, "blog.html", nil)
	})

	http.HandleFunc("GET /blog/{slug}", func(w http.ResponseWriter, r *http.Request) {
		slug := r.PathValue("slug")
		html, err := getPostHTML(slug)
		if err != nil {
			templates.ExecuteTemplate(w, "404.html", nil)
			return
		}
		w.Write(html)
	})

	http.ListenAndServe("localhost:3000", nil)
}

func getPost(slug string) (string, error) {
	// check in /build for a prebuilt html file
	data, err := os.ReadFile("build/" + slug + ".html")
	if err == nil {
		return string(data), nil
	}

	// otherwise build it
	html, err := getPostHTML(slug)
	if err != nil {
		return "", err
	}

	// save the post in /build
	if err := os.WriteFile("build/"+slug+".html", html, 0644); err != nil {
		return "", err
	}

	return string(html), nil
}

func getPostHTML(slug string) ([]byte, error) {
	// if it doesn't exist, check in /posts for the md file
	// if it exists, convert it into html and return it
	data, err := os.ReadFile("posts/" + slug + ".md")
	if err != nil {
		return nil, err
	}

	var buff bytes.Buffer

	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			&frontmatter.Extender{},
		),
	)

	ctx := parser.NewContext()
	if err := md.Convert(data, &buff, parser.WithContext(ctx)); err != nil {
		return nil, err
	}

	content := string(buff.Bytes())
	meta := Meta{}

	if err := frontmatter.Get(ctx).Decode(&meta); err != nil {
		return nil, err
	}

	post := Post{
		Slug:        slug,
		Content:     template.HTML(content),
		Title:       meta.Title,
		Description: meta.Description,
		Date:        meta.Date,
		Snippet:     meta.Snippet,
	}

	var html bytes.Buffer
	templates.ExecuteTemplate(&html, "post.html", post)
	print(html.String())

	return html.Bytes(), nil
}
