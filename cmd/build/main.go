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

func main() {
	println("Building posts...\n")

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
	if err := os.Mkdir("build/meta", 0755); err != nil {
		if !os.IsExist(err) {
			panic(err)
		}
	}

	posts, err := getPosts()
	if err != nil {
		panic(err)
	}

	for _, post := range posts {
		println(post)
		if _, err := buildPost(post); err != nil {
			panic(err)
		}
	}

	println("\nDone!")
}

func getPosts() ([]string, error) {
	files, err := os.ReadDir("posts")
	if err != nil {
		return nil, err
	}

	posts := make([]string, 0, len(files))
	for _, file := range files {
		posts = append(posts, strings.TrimSuffix(file.Name(), ".md"))
	}

	return posts, nil
}

func buildPost(slug string) (string, error) {
	html, err := getPostHTML(slug)
	if err != nil {
		return "", err
	}

	if err := os.WriteFile("build/posts/"+slug+".html", html, 0644); err != nil {
		return "", err
	}

	return string(html), nil
}

func getPostHTML(slug string) ([]byte, error) {
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
	meta := templates.Meta{}

	if err := frontmatter.Get(ctx).Decode(&meta); err != nil {
		return nil, err
	}

	metaJson, err := json.Marshal(meta)
	if err != nil {
		return nil, err
	}

	if err := os.WriteFile("build/meta/"+slug+".json", metaJson, 0644); err != nil {
		return nil, err
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

	return html.Bytes(), nil
}
