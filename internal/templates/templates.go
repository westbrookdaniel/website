package templates

import "html/template"

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

var Templates = template.Must(template.ParseGlob("templates/*.html"))
