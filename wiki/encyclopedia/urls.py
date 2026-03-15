from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>/", views.entry, name="entry"),
    path("search/", views.search, name="search"),
    path('new/', views.newPage, name="newPage"),
    path('edit/', views.editPage, name="editPage"),
    path('saveEdit/', views.saveEdit, name="saveEdit"),
    path('rand/', views.rand, name="rand"),
]
