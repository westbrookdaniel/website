package main

import (
	"bytes"
	"encoding/json"
	"html/template"
	"os"
	"strings"

	"github.com/westbrookdaniel/website/internal/templates"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"go.abhg.dev/goldmark/frontmatter"
)

func checkFoldersExist() {
	if err := os.Mkdir("build", 0755); err != nil {
		if !os.IsExist(err) {
			panic(err)
		}
	}
	if err := os.Mkdir("build/posts", 0755); err != nil {
		if !os.IsExist(err) {
			panic(err)
		}
	}
}

func main() {
	println("Building posts...\n")

	checkFoldersExist()

	posts := getPostFileNames()

	metas := make([]templates.Meta, len(posts))

	for i, slug := range posts {
		println(slug)

		html, meta := parsePost(slug)

		metas[i] = meta

		if err := os.WriteFile("build/posts/"+slug+".html", html, 0644); err != nil {
			panic(err)
		}
	}

	println("\nBuilding meta...")

	metasJson, err := json.Marshal(metas)
	if err != nil {
		panic(err)
	}
	if err := os.WriteFile("build/meta.json", metasJson, 0644); err != nil {
		panic(err)
	}

	println("\nDone!")
}

func getPostFileNames() []string {
	files, err := os.ReadDir("posts")
	if err != nil {
		panic(err)
	}

	posts := make([]string, 0, len(files))
	for _, file := range files {
		posts = append(posts, strings.TrimSuffix(file.Name(), ".md"))
	}

	return posts
}

func parsePost(slug string) ([]byte, templates.Meta) {
	data, err := os.ReadFile("posts/" + slug + ".md")
	if err != nil {
		panic(err)
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
		panic(err)
	}

	content := string(buff.Bytes())
	meta := templates.Meta{}

	if err := frontmatter.Get(ctx).Decode(&meta); err != nil {
		panic(err)
	}

	post := templates.Post{
		Slug:        slug,
		Content:     template.HTML(content),
		Title:       meta.Title,
		Description: meta.Description,
		Date:        meta.Date,
		Snippet:     meta.Snippet,
	}

	var html bytes.Buffer
	templates.Templates.ExecuteTemplate(&html, "post.html", post)

	return html.Bytes(), meta
}
