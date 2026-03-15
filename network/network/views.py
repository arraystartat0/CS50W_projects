import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.core.paginator import Paginator
from django.middleware.csrf import get_token

from .models import User, Post, Follow

def index(request):
    allPosts = Post.objects.all().order_by("-date")
    paginator = Paginator(allPosts, 10)
    pageNum = request.GET.get("page")
    postsOfPage = paginator.get_page(pageNum)
    
    if request.user.is_authenticated:
        following_ids = list(
            Follow.objects.filter(user=request.user)
                  .values_list('receivingFollowUser__id', flat=True)
        )
    else:
        following_ids = []

    return render(request, "network/index.html", {
        "allPosts": allPosts,
        "postsOfPage": postsOfPage,
        "following_ids": following_ids,
    })



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def newPost(request):
    if request.method == 'POST':
        content = request.POST['content']
        user = get_object_or_404(User, pk=request.user.id)
        post = Post(
            content = content,
            user = user
        )
        post.save()
        return HttpResponseRedirect(reverse(index))
        
def profile(request, user_id):
    profile_user = get_object_or_404(User, pk=user_id)
    # Get all posts in reverse chronological order
    allPosts = Post.objects.filter(user=profile_user).order_by("-date")
    
    following_qs = Follow.objects.filter(user=profile_user)
    followers_qs = Follow.objects.filter(receivingFollowUser=profile_user)
    
    is_following = False
    if request.user.is_authenticated and request.user != profile_user:
        is_following = Follow.objects.filter(user=request.user, receivingFollowUser=profile_user).exists()
    
    if request.user.is_authenticated:
        following_ids = list(Follow.objects.filter(user=request.user).values_list('receivingFollowUser__id', flat=True))
    else:
        following_ids = []
    
    return render(request, "network/profile.html", {
        "profile_user": profile_user,
        "allPosts": allPosts,  # All posts (not paginated)
        "followers_count": followers_qs.count(),
        "following_count": following_qs.count(),
        "is_following": is_following,
        "following_ids": following_ids,
    })

def follow(request):
    followed_user_id = request.POST.get('followedUser', '').strip()
    currentUser = get_object_or_404(User, pk=request.user.id)
    followedUserData = get_object_or_404(User, pk=followed_user_id)
    
    f = Follow(user=currentUser, receivingFollowUser=followedUserData)
    f.save()
    
    followers_count = Follow.objects.filter(receivingFollowUser=followedUserData).count()
    new_token = get_token(request)
    return JsonResponse({
        "status": "followed",
        "csrf_token": new_token,
        "user_id": followedUserData.id,
        "followers_count": followers_count
    })

def unfollow(request):
    followed_user_id = request.POST.get('followedUser', '').strip()
    currentUser = get_object_or_404(User, pk=request.user.id)
    followedUserData = get_object_or_404(User, pk=followed_user_id)
    
    Follow.objects.filter(user=currentUser, receivingFollowUser=followedUserData).delete()
    
    followers_count = Follow.objects.filter(receivingFollowUser=followedUserData).count()
    new_token = get_token(request)
    return JsonResponse({
        "status": "unfollowed",
        "csrf_token": new_token,
        "user_id": followedUserData.id,
        "followers_count": followers_count
    })

def editPost(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get("post_id")
        new_content = data.get("content")

        # Retrieve the post and verify ownership
        post = get_object_or_404(Post, pk=post_id)
        if request.user != post.user:
            return JsonResponse({"error": "Unauthorized"}, status=403)
        
        post.content = new_content
        post.save()

        return JsonResponse({"message": "Post updated successfully", "new_content": post.content})
    
    return JsonResponse({"error": "Invalid request"}, status=400)

def toggle_like(request, post_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required"}, status=403)

        post = get_object_or_404(Post, id=post_id)
        if request.user in post.likes.all():
            post.likes.remove(request.user)
            liked = False
        else:
            post.likes.add(request.user)
            liked = True

        return JsonResponse({"liked": liked, "likes": int(post.like_count)})

    return JsonResponse({"error": "POST request required"}, status=400)
