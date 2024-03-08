package templates

import "html/template"

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
	Date        string `json:"date"`
	Snippet     string `json:"snippet"`
}

type Post struct {
	Slug        string
	Content     template.HTML
	Title       string
	Description string
	Date        string
	Snippet     string
}

var Templates = template.Must(template.ParseGlob("templates/*.html"))
