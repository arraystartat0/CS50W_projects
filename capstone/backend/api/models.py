from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import JSONField
from django.utils import timezone
import random
import string
import uuid

def generate_key(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state_province = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    incorporation_date  = models.DateField(blank=True, null=True)
    company_type        = models.CharField(max_length=50, blank=True, null=True)
    email               = models.EmailField(blank=True, null=True)
    phone               = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    registration_date = models.DateTimeField(auto_now_add=True)

    public_key = models.CharField(max_length=8, unique=True)
    private_key = models.CharField(max_length=8, unique=True)


    def generate_unique_public_key(self):
        key = generate_key()
        while Company.objects.filter(public_key=key).exists():
            key = generate_key()
        return key

    def generate_unique_private_key(self):
        key = generate_key()
        while Company.objects.filter(private_key=key).exists():
            key = generate_key()
        return key

    def save(self, *args, **kwargs):
        if not self.public_key:
            self.public_key = self.generate_unique_public_key()
        if not self.private_key:
            self.private_key = self.generate_unique_private_key()
        super().save(*args, **kwargs)

    def generate_unique_code(self):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        while Company.objects.filter(company_code=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return code

    def __str__(self):
        return self.name

class CompanyAdmin(models.Model):
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='admin')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_admin')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} (Admin - {self.company.name})"

class Representative(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='representatives')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.company.name})"

class Applicant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="applicant_profile")
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # ensure this user is not already a representative.
        if hasattr(self.user, 'representative'):
            raise ValidationError("This user is already registered as a representative.")

    def __str__(self):
        return f"{self.user.username} (Applicant)"

class Posting(models.Model):
    UID = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="postings")
    representative = models.ForeignKey(Representative, on_delete=models.CASCADE, related_name="postings")
    
    # posting details
    title = models.CharField(max_length=255)
    job_type = models.CharField(
        max_length=20,
        choices=[("Apprenticeship", "Apprenticeship"), ("Internship", "Internship"), ("Full-time", "Full-time"), ("Part-time", "Part-time")]
    )
    description = models.TextField()
    additional_info = models.TextField(blank=True, null=True, help_text="Any additional information about the job.")

    location = models.CharField(max_length=255, blank=True, null=True, help_text="Geographic location of the job")
    start_date = models.DateField(blank=True, null=True, help_text="Estimated start date of the job")
    end_date = models.DateField(blank=True, null=True, help_text="Estimated end date of the job (if applicable)")

    documents_needed = models.JSONField(
        default=list,
        blank=True,
        help_text="A list of documents required from applicants (e.g., ['Resume', 'Cover Letter'])."
    )
    
    PAYMENT_WAGE_TYPES = [
        ('HOURLY', 'Per Hour'),
        ('COMMISSION', 'Per Commission'),
        ('PROJECT', 'Per Project'),
        ('SALARY', 'Salary'),
        ('UNPAID', 'Unpaid'), 
    ]
    wage_type = models.CharField(max_length=20, choices=PAYMENT_WAGE_TYPES, default='UNPAID', help_text="Type of wage offered.")
    pay_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Numeric value for the payment rate.")

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('UGX', 'Ugandan Shilling'),
    ]
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, null=True, blank=True, help_text="Currency of the payment.")


    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Archived', 'Archived'),
        ('Closed', 'Closed'),
    ]
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='Active',
        help_text="Current status of the job posting"
    )

    # status tracking
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def clean(self):
        """Validate the model data"""
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        from datetime import date
        
        super().clean()

        today = timezone.now().date()
        
        # validate start date is not in the past
        if self.start_date and self.start_date < today:
            raise ValidationError({
                'start_date': 'Start date cannot be in the past.'
            })
        
        # validate end date is not in the past
        if self.end_date and self.end_date < today:
            raise ValidationError({
                'end_date': 'End date cannot be in the past.'
            })
        
        # validate end date is after start date if both are provided
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError({
                'end_date': 'End date must be after start date.'
            })

    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.company.name})"

class Application(models.Model):
    UID = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    posting = models.ForeignKey(Posting, on_delete=models.CASCADE, related_name="applications")
    
    # application details
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=255)
    resume_link = models.URLField() 
    cover_letter_link = models.URLField()  
    additional_info = models.TextField(blank=True, null=True)

    feedback = models.TextField(
        blank=True,
        null=True,
        help_text="Feedback/comments from the representative"
    )

    # application Status
    STATUS_CHOICES = [
        ("Unopened", "Unopened"),
        ("Under Review", "Under Review"),
        ("Decision Pending", "Decision Pending"),
        ("Denied", "Denied"),
        ("Interview Scheduled", "Interview Scheduled"),
        ("Active", "Active"),
        ("Completed", "Completed") 
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Unopened")
    applied_at = models.DateTimeField(auto_now_add=True)

    supervisor = models.ForeignKey(
        'Representative',
        on_delete=models.CASCADE, 
        null=True,
        blank=True,
        related_name='supervised_applications',
        help_text="Supervisor assigned for active internships (must be a representative from the posting's company)"
    )
    active_start_date = models.DateField(blank=True, null=True, help_text="Start date for active internship")
    active_end_date = models.DateField(blank=True, null=True, help_text="End date for active internship")

    # additional fields for when the application is completed/ended
    completion_remarks = models.TextField(blank=True, null=True)
    completion_letter_link = models.URLField(blank=True, null=True)

    def clean(self):
        super().clean()
        # validate the assigned supervisor belongs to the same company as the posting
        if self.supervisor and self.posting:
            if self.supervisor.company != self.posting.company:
                raise ValidationError(
                    {'supervisor': "The assigned supervisor must belong to the same company as the job posting."}
                )

    def save(self, *args, **kwargs):
        self.full_clean() 
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.full_name} - {self.posting.title}"

class Watchlist(models.Model):
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist_items')
    posting = models.ForeignKey(Posting, on_delete=models.CASCADE, related_name='watchlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('applicant', 'posting')  # Prevent duplicate watchlist entries
    
    def __str__(self):
        return f"{self.applicant.username} - {self.posting.title}"

class RepresentativeInvitation(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    last_name = models.CharField(max_length=100)
    invitation_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_accepted = models.BooleanField(default=False)
    invited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invitation for {self.email} to {self.company.name}"

class Interview(models.Model):
    application = models.OneToOneField('Application', on_delete=models.CASCADE, related_name='interview')
    
    # interview scheduling details
    interview_date = models.DateField(default=timezone.now, help_text="Date of the interview")
    interview_time = models.TimeField(default=timezone.now, help_text="Time of the interview")
    
    # location details - physical or online
    LOCATION_TYPE_CHOICES = [
        ('physical', 'Physical Location'),
        ('online', 'Online Meeting'),
    ]
    location_type = models.CharField(default="online" ,max_length=10, choices=LOCATION_TYPE_CHOICES, help_text="Type of interview location")
    physical_address = models.TextField(blank=True, null=True, help_text="Physical address for in-person interview")
    meeting_link = models.URLField(blank=True, null=True, help_text="Link for online interview")
    
    # additional details
    interviewer = models.ForeignKey(Representative, on_delete=models.SET_NULL, null=True, blank=True, related_name='conducted_interviews')
    additional_notes = models.TextField(blank=True, null=True, help_text="Additional notes about the interview")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validate that appropriate location details are provided based on location_type"""
        if self.location_type == 'physical' and not self.physical_address:
            raise ValidationError("Physical address is required for physical interviews")
        if self.location_type == 'online' and not self.meeting_link:
            raise ValidationError("Meeting link is required for online interviews")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def scheduled_datetime(self):
        """Combine date and time for easier access"""
        from datetime import datetime
        return datetime.combine(self.interview_date, self.interview_time)

    def __str__(self):
        return f"Interview for {self.application.full_name} ({self.application.posting.title}) on {self.interview_date} at {self.interview_time}"