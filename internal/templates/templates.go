package templates

import (
	"html/template"
	"time"
)

type Front struct {
	Title       string `yaml:"title"`
	Description string `yaml:"description"`
	Date        string `yaml:"date"`
	Snippet     string `yaml:"snippet"`
}

type Meta struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        time.Time `json:"date"`
	Snippet     string `json:"snippet"`
}

type Post struct {
	Slug        string
	Content     template.HTML
	Title       string
	Description string
	Date        time.Time
	Snippet     string
}

var Templates = template.Must(template.ParseGlob("templates/*.html"))

func CreatePost(meta Meta, content []byte) Post {
	return Post{
		Slug:        meta.Slug,
		Content:     template.HTML(content),
		Title:       meta.Title,
		Description: meta.Description,
		Date:        meta.Date,
		Snippet:     meta.Snippet,
	}
}
