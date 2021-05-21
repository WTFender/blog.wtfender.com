---
title: "Building My Site in Flask"
date: 2019-10-20T00:00:00-00:00
summary: An example of building basic Flask sites in Google App Engine
tags: ['flask', 'python']
---

This is a how-to for building simple sites in Flask. If you want a quick personal blog, I'd recommend deploying a pre-built WordPress instance on Google Cloud or AWS. In my case, I wanted to get a little more experience with Flask and general web development, so I built a basic blog in Flask. This could easily serve as an example for deploying APIs on Google App Engine.

Complete [example on GitHub](https://github.com/WTFender/wtfender_blog).

## Getting Started

First, you'll need flask.

```bash
pip install flask
```

A boilerplate flask app looks like this. Serve `index.html` on `/test`.
```python
from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route("/test")
def index():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
```

Below are are additional examples for URL routing. `send_static()` serves any and all files from the static directory using the URL path as a variable. `send_post()` only serves URLs from `myList`.
```python
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

myList = ['post1', 'post2', 'post3']
@app.route('/<any({}):path>''.format(str(myList)[1:-1]))
def send_post(path):
    return send_from_directory('posts', path+'.html')
```

## Flask Templates
`send_from_directory` is useful for serving static files, but `render_template` is better for dynamicly generating pages. Below I pass a variable, `myList`, to the template `index.html`. By default, flask looks for templates under `static/`. Templates have access to python variables and can perform basic functions using the Jinja template engine. Jinja is included with Flask - [check out this article](https://www.techiediaries.com/flask-tutorial-templates/) for more about template syntax.`
```python
@app.route("/test")
def index():
    myList = ['post1', 'post2', 'post3']
    return render_template('index.html', myList=myList)
```

Our template uses special tags `{{ variable }}` and `{% function %}` to interact with our `posts` variable. We've also added `{% block content %}`, which contains the body of our html page.
```html
<!--- static/index.html --->
{% block content %}
<ul>
    {% for p in posts %}
    <li>
        {{ p }}
    </li>
    {% endfor %}
</ul>
{% endblock %}

<!--- Output --->
∙ post1
∙ post2
∙ post3
```

## Organizing Pages
I created a manifest file, `paths.yaml`, as a list of all the URLs I want to serve. Each path includes a pointer to the html page containing the post/page content. Any other post or URL specific info could be stored here as well, such as post image, author, date, etc.
```yaml
# paths.yaml
posts:
    my-first-post:
        name: My very first post.
        html: posts/my-first-post.html
    my-second-post:
        name: AWS Temporary Access Tokens
        html: posts/my-second-post.html
```

Flask loads the list of paths as routes and passes the post variable to the template as a variable, depending on the path.
```python
posts = yaml.safe_load(open("paths.yaml","r"))['posts']
@app.route("/".format(str(list(posts.keys()))[1:-1]))
def send_post(path):
    return render_template('post.html', post=posts[path])
```

Our template, `post.html`, displays the post's name and displays the post's html.
```html
{% block content %}
    {{ post['name'] }}
    {% include post['html'] %}
{% endblock %}
```

## Putting it all Together

Directory structure:
```text
main.py
paths.yaml
templates/
    index.html
    post.html
    posts/
        my-first-post.html
        my-second-post.html
```

templates/posts/my-first-post.html
```html
<p>This is my first post.</p>
```

templates/index.html
```html
{% block content %}
<ul>
    {% for p in posts %}
    <li>
        <a href='{{p}}'>{{ p }}</a>
    </li>
    {% endfor %}
</ul>
{% endblock %}
```

paths.yaml
```yaml
posts:
    my-first-post:
        name: My very first post.
        html: posts/my-first-post.html
    my-second-post:
        name: AWS Temporary Access Tokens
        html: posts/my-second-post.html
```

main.py
```python
#!/usr/bin/env python3
from flask import Flask, render_template
import yaml

app = Flask(__name__)
posts = yaml.safe_load(open('paths.yaml','r'))['posts']

@app.route('/<any({}):path>'.format(str(list(posts.keys()))[1:-1]))
def send_post(path):
    return render_template('post.html', post=posts[path])

@app.route('/')
def index():
    return render_template('index.html', posts=posts)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
```

Results:
```text
<!--- curl http://127.0.0.1:8080 --->
<ul>
    <li>
        <a href='my-first-post'>my-first-post</a>
    </li>
    <li>
        <a href='my-second-post'>my-second-post</a>
    </li>
</ul>

<!--- curl http://127.0.0.1:8080/my-first-post --->
My very first post.
<p>This is my first post.</p>
```

## Deploy on GAE
In order to deploy your app on GAE, you'll just need to add an app.yml and requirements.txt before deploying.

app.yml
```yaml
service: default
runtime: python37
```

requirements.txt
```text
flask==1.0.2
pyyaml==5.1.2
gunicorn
```

GAE Deploy command
```text
gcloud app deploy .
```