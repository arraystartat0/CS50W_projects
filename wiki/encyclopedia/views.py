from django.shortcuts import render
from markdown2 import Markdown
import random

from . import util

def convertMdToHTML(title):
    content = util.get_entry(title)
    markdowner = Markdown() 
    if content is None: 
        return None
    else:
        return markdowner.convert(content)  

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, title):
    htmlContent = convertMdToHTML(title)
    if htmlContent is None: 
        return render(request, "encyclopedia/error.html", {
            "message": "This entry doesn't exist."
        })
    else:
        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "htmlContent": htmlContent 
        })

def search(request):
    if request.method == "POST": 
        entrySearch = request.POST['q']
        htmlContent = convertMdToHTML(entrySearch)
        if htmlContent is not None:
            return render(request, "encyclopedia/entry.html", {
                "title": entrySearch,
                "htmlContent": htmlContent 
            })
        else:
            allEntries = util.list_entries()
            recommendation = []
            for entry in allEntries:
                if entrySearch.lower() in entry.lower():
                    recommendation.append(entry)
    return render(request, "encyclopedia/search.html", {
        "recommendation" : recommendation
    })

def newPage(request):
    if request.method == "GET":
        return render(request, "encyclopedia/newPage.html")
    else:
        title = request.POST['title']
        content = request.POST['content']
        titleExists = util.get_entry(title)
        if titleExists is not None:
            return render(request, "encyclopedia/error.html",{
                "message" : "Entry already exists"
            })
        else:
            util.save_entry(title, content)
            htmlContent = convertMdToHTML(title)
            return render(request, "encyclopedia/entry.html", {
                "title" : title,
                "htmlContent" : htmlContent
            })

def editPage(request):
    if request.method == 'POST':
        title = request.POST['entryTitle']
        htmlContent = util.get_entry(title)
        return render(request, "encyclopedia/editPage.html", {
            "title" : title,
            "htmlContent" : htmlContent
        })

def saveEdit(request):
    if request.method == 'POST':
        title = request.POST['title']
        htmlContent = request.POST['content']
        util.save_entry(title, htmlContent)
        htmlContent = convertMdToHTML(title)
        return render(request, "encyclopedia/entry.html", {
            "title" : title,
            "htmlContent" : htmlContent
        })
    
def rand(request):
    allEntries = util.list_entries()
    randomEntry = random.choice(allEntries)
    htmlContent = convertMdToHTML(randomEntry)
    return render(request, "encyclopedia/entry.html", {
        "title" : randomEntry,
        "htmlContent": htmlContent
    })