from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

# Register your models here.
from .models import (
    Company,
    CompanyAdmin    as CompanyAdminModel,
    Representative,
    Applicant,
    Posting,
    Application,
    Watchlist,
    RepresentativeInvitation,
    Interview,
)

# Unregister the built‑in User admin 
admin.site.unregister(User)

# re‑register it using the default UserAdmin which includes password‑change capability
@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    list_filter  = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering     = ('username',)

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'registration_number', 'incorporation_date', 'is_active', 'is_verified')
    search_fields = ('name', 'registration_number', 'email')
    list_filter   = ('is_active', 'is_verified', 'country')

@admin.register(CompanyAdminModel)
class CompanyAdminInline(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'company')
    search_fields = ('first_name', 'last_name', 'company__name')

@admin.register(Representative)
class RepresentativeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'company', 'user')
    search_fields = ('first_name', 'last_name', 'company__name', 'user__username')

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'city', 'country', 'created_at')
    search_fields = ('user__username', 'phone_number', 'city', 'country')

@admin.register(Posting)
class PostingAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'company', 'representative', 'job_type', 'location',
        'wage_type', 'pay_rate', 'currency', 'status', 'is_active',
        'created_at', 'UID'
    )
    list_filter  = (
        'job_type', 'is_active', 'status', 'wage_type',
        'start_date', 'end_date', 'created_at', 'currency'
    )
    search_fields = (
        'title', 'description', 'additional_info', 'location',
        'documents_needed', 'payment_details',
        'company__name', 'representative__first_name', 'representative__last_name'
    )
    fieldsets = (
        (None, {
            'fields': ('title', 'job_type', 'location', 'start_date', 'end_date', 'status', 'is_active', 'UID')
        }),
        ('Content', {
            'fields': ('description', 'additional_info', 'documents_needed')
        }),
        ('Payment', {
            'fields': ('wage_type', 'pay_rate', 'currency')
        }),
        ('Associations', {
            'fields': ('company', 'representative')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    readonly_fields = ('UID', 'created_at',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'posting', 'email', 'status', 'feedback_preview', 'applied_at', 'UID')
    list_filter  = ('status',)
    search_fields = ('full_name', 'email', 'posting__title', 'feedback', 'UID')
    readonly_fields = ('UID', 'applied_at')

    def feedback_preview(self, obj):
        # show up to 50 chars in list view
        return (obj.feedback[:50] + '…') if obj.feedback and len(obj.feedback) > 50 else obj.feedback
    feedback_preview.short_description = 'Feedback'

    # show the related interview inline on the Application page
    from django.contrib.admin import StackedInline

    class InterviewInline(StackedInline):
        model = Interview
        extra = 0
        readonly_fields = ('created_at', 'updated_at')

    inlines = [InterviewInline]

@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'posting', 'added_at')
    search_fields = ('applicant__username', 'posting__title')

@admin.register(RepresentativeInvitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'company', 'last_name', 'is_accepted', 'invited_at')
    list_filter  = ('is_accepted',)

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = (
        'application', 'interview_date', 'interview_time',
        'location_type', 'interviewer', 'created_at'
    )
    list_filter = ('location_type', 'interview_date', 'interviewer')
    search_fields = (
        'application__full_name', 'application__UID',
        'physical_address', 'meeting_link', 'additional_notes'
    )
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': (
                'application', 'interviewer',
                'interview_date', 'interview_time', 'location_type'
            )
        }),
        ('Details', {
            'fields': ('physical_address', 'meeting_link', 'additional_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )