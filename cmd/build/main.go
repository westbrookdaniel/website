package main

import (
	"bytes"
	"encoding/json"
	"os"
	"strings"
	"time"

	"github.com/westbrookdaniel/website/templates"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"go.abhg.dev/goldmark/frontmatter"

	highlighting "github.com/yuin/goldmark-highlighting/v2"
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

	metas := make([]templates.Meta, 0, len(posts))

	for _, slug := range posts {
		println(slug)

		html, meta := parsePost(slug)

		metas = append(metas, meta)

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
			highlighting.NewHighlighting(
				highlighting.WithStyle("catppuccin-mocha"),
			),
		),
	)

	ctx := parser.NewContext()
	if err := md.Convert(data, &buff, parser.WithContext(ctx)); err != nil {
		panic(err)
	}

	front := templates.Front{}
	if err := frontmatter.Get(ctx).Decode(&front); err != nil {
		panic(err)
	}

	date, err := time.Parse(layout, front.Date)
	if err != nil {
		panic(err)
	}

	meta := templates.Meta{
		Slug:        slug,
		Title:       front.Title,
		Description: front.Description,
		Date:        date,
		Snippet:     front.Snippet,
	}

	return buff.Bytes(), meta
}

const layout = "2006-01-02T15:04:05.999Z"
