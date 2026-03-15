from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    content = models.CharField(max_length=400)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")
    date = models.DateTimeField(auto_now_add=True)
    
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)  # Users who liked the post

    def __str__(self):
        return f"Post {self.id} made by {self.user} on {self.date.strftime('%d %b %Y %H:%M:%S')}"

    @property
    def like_count(self):
        return self.likes.count()  # Returns the number of likes

class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    receivingFollowUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userWhoIsFollowed")

    def __str__(self):
        return f"{self.user} is following {self.receivingFollowUser}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'receivingFollowUser'], name='unique_follow')
        ]


