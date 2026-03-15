from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Category(models.Model):
    categoryName = models.CharField(max_length=50) #Expected shorter categories

    def __str__(self):
        return self.categoryName
    
class Bid(models.Model):
    bid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="bids_placed")

    def __str__(self):
        return f"{self.bid}"
    
class Listing(models.Model):
    name = models.CharField(max_length=80)
    description = models.TextField(max_length=1500)
    imgUrl = models.CharField(max_length=2083)  # standard maximum length for URLs
    price = models.ForeignKey(Bid, on_delete=models.CASCADE, blank=True, null=True, related_name="bid_prices")
    isActive = models.BooleanField(default=True)
    auctioneer = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, related_name="auctions_as_auctioneer")  # No auction without auctioneer and required field in form
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name="auctions")
    watchlist = models.ManyToManyField(User, blank=True, related_name="watchlist_listings")

    def __str__(self):
        return self.name
    
class Comment(models.Model):
    commentor = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, related_name="comments_made")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, null=False, blank=False, related_name="comments")
    comment = models.CharField(max_length=250)

    def __str__(self):
        return f"{self.commentor} comment on {self.listing}"
    