from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib import messages

from .models import User, Category, Listing, Comment, Bid


def index(request):
    activeListings = Listing.objects.filter(isActive=True)
    allCategories = Category.objects.all()
    return render(request, "auctions/index.html", {
        "listings": activeListings,
        "categories": allCategories
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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
    
def createNewListing(request):
    if request.method == "GET":
        allCategories = Category.objects.all().order_by('id')
        return render(request, "auctions/createNew.html", {
            "categories": allCategories
        })
    else:
        name = request.POST.get('name')
        description = request.POST.get('description', '')  # Default to empty if not provided
        imageUrl = request.POST.get('imgUrl', '')  # Default to empty if not provided
        price = request.POST.get('price')
        condition_name = request.POST.get('condition')

        try:
            condition = Category.objects.get(categoryName=condition_name)
        except Category.DoesNotExist:
            return render(request, "auctions/createNew.html", {
                "categories": Category.objects.all(),
                "error_message": "Selected category does not exist."
            })

        user = request.user  # Ensure this is the authenticated user

        if not all([name, description, imageUrl, price, condition]):
            return render(request, "auctions/createNew.html", {
                "categories": Category.objects.all(),
                "error_message": "All fields are required."
            })
        
        bid = Bid(bid=float(price), bidder=user)
        bid.save()

        newListing = Listing(
            name=name, 
            description=description, 
            imgUrl=imageUrl, 
            price=bid,
            category=condition, 
            auctioneer=user
        )
        newListing.save()
        return HttpResponseRedirect(reverse('index'))


def displayCategory(request):
    if request.method == "POST":
        formCategory = request.POST['condition']
        allCategories = Category.objects.all()

        if formCategory == "All":
            activeListings = Listing.objects.filter(isActive=True)
        else:
            category = Category.objects.get(categoryName=formCategory)
            activeListings = Listing.objects.filter(isActive=True, category=category)

        return render(request, "auctions/index.html", {
            "listings": activeListings,
            "categories": allCategories,
            "selected_category": formCategory 
        })

def viewListing(request, id):
    listingData = Listing.objects.get(pk=id)
    isListingInWatchlist = request.user in listingData.watchlist.all()
    allComments = Comment.objects.filter(listing=listingData)
    isLister = request.user.username == listingData.auctioneer.username
    return render(request, "auctions/viewListing.html", {
        "listing":listingData,
        "isListingInWatchlist": isListingInWatchlist,
        "allComments": allComments,
        "isLister":isLister,
    })

def removeFromWatchlist(request, id):
    listingData = Listing.objects.get(pk=id)
    currentUser = request.user
    listingData.watchlist.remove(currentUser)
    return HttpResponseRedirect(reverse("viewListing", args=(id, )))

def addToWatchlist(request, id):
    listingData = Listing.objects.get(pk=id)
    currentUser = request.user
    listingData.watchlist.add(currentUser)
    return HttpResponseRedirect(reverse("viewListing", args=(id, )))

def displayWatchlist(request):
    if not request.user.is_authenticated:
        # Handle unauthenticated users by passing no listings
        return render(request, "auctions/myWatchlist.html", {
            "listings": None,
        })

    # Handle authenticated users
    currentUser = request.user
    listings = currentUser.watchlist_listings.all()
    return render(request, "auctions/myWatchlist.html", {
        "listings": listings,
    })

def addComment(request, id):
    currentUser = request.user
    listingData = Listing.objects.get(pk=id)
    message = request.POST['comment']

    newComment = Comment(
        commentor=currentUser,
        listing=listingData,
        comment=message
    )

    newComment.save()

    return HttpResponseRedirect(reverse("viewListing", args=(id, )))

def placeBid(request, id):
    newBid = request.POST['bid_amount']
    listingData = Listing.objects.get(pk=id)
    if float(newBid) > listingData.price.bid:
        updateBid = Bid(bidder=request.user, bid=float(newBid))
        updateBid.save()
        listingData.price = updateBid
        listingData.save()
        isLister = request.user.username == listingData.auctioneer.username
        return render(request, "auctions/viewListing.html", {
            "listing" : listingData,
            "message": "Bid placed successfully!",
            "update": True,
            "isLister":isLister,
        })
    else:
        return render(request, "auctions/viewListing.html", {
            "listing" : listingData,
            "message": "Error placing bid, please use a larger amount than the current bid.",
            "update": False,
            "isLister":isLister,
        })
    
def endAuction(request, id):
    listingData = Listing.objects.get(pk=id)
    listingData.isActive = False
    listingData.save()
    isLister = request.user.username == listingData.auctioneer.username
    return render(request, "auctions/viewListing.html", {
        "listing":listingData,
        "update":True,
    })
    
