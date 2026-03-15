from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("createNew", views.createNewListing, name="createNew"),
    path("displayCategory", views.displayCategory, name="displayCategory"),
    path("viewListing/<int:id>", views.viewListing, name="viewListing"),
    path("removeFromWatchlist/<int:id>", views.removeFromWatchlist, name="removeFromWatchlist"),
    path("addToWatchlist/<int:id>", views.addToWatchlist, name="addToWatchlist"),
    path("myWatchlist", views.displayWatchlist, name="myWatchlist"),
    path("newComment/<int:id>", views.addComment, name="newComment"),
    path("placeBid/<int:id>", views.placeBid, name="placeBid"),
    path("endAuction/<int:id>", views.endAuction, name="endAuction"),
]
