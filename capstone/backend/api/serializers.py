from rest_framework import serializers
from django.contrib.auth.models import User
from datetime import date, timedelta
from .models import Company, Representative, Posting, Application, Interview, Watchlist

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'website', 'industry', 'company_size',
            'address', 'city', 'state_province', 'country', 'postal_code',
            'is_active', 'is_verified',
            'registration_date', 'company_code'
        ]
        read_only_fields = ['company_code', 'registration_date']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def validate_email(self, value):
        # Check if a user with this email already exists.
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class RepresentativeSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Representative
        fields = ['id', 'company', 'first_name', 'last_name', 'user']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = UserSerializer().create(user_data)
        representative = Representative.objects.create(user=user, **validated_data)
        return representative

class RepresentativeDetailsSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Representative
        fields = ['id', 'first_name', 'last_name', 'user_full_name']
        read_only_fields = ['company', 'user']

    def get_user_full_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None

class PublicCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'public_key']

class RepresentativeNameSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email     = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Representative
        fields = ['full_name', 'email']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = [
            'interview_date', 'interview_time', 'location_type',
            'physical_address', 'meeting_link', 'additional_notes',
            'interviewer'
        ]
    
    def validate_interview_date(self, value):
        today = date.today()
        # date validation
        if value < today:
            raise serializers.ValidationError("Interview date cannot be in the past.")
        if value > today + timedelta(days=365):
            raise serializers.ValidationError("Interview date must be within one year from today.")
        return value

    def validate(self, data):
        """Ensure appropriate location details are provided"""
        location_type = data.get('location_type')
        physical_address = data.get('physical_address')
        meeting_link = data.get('meeting_link')

        if location_type == 'physical' and not physical_address:
            raise serializers.ValidationError({
                'physical_address': 'Physical address is required for physical interviews'
            })
        
        if location_type == 'online' and not meeting_link:
            raise serializers.ValidationError({
                'meeting_link': 'Meeting link is required for online interviews'
            })

        return data

class PostingSerializer(serializers.ModelSerializer):
    applications = serializers.IntegerField(source='applications_count', read_only=True)
    interviews = serializers.IntegerField(source='interviews_count', read_only=True)
    rejections = serializers.IntegerField(source='rejections_count', read_only=True)

    company = PublicCompanySerializer(read_only=True)
    representative = RepresentativeNameSerializer(read_only=True)

    is_paid = serializers.SerializerMethodField()

    class Meta:
        model = Posting
        fields = [
            'UID', 'title', 'job_type', 'description', 'additional_info',
            'location', 'start_date', 'end_date',
            'documents_needed', 'is_paid',
            'wage_type', 'pay_rate', 'currency',
            'status', 'created_at', 'is_active',
            'applications', 'interviews', 'rejections',
            'company', 'representative',
        ]

    def get_is_paid(self, obj):
        return obj.wage_type != 'UNPAID'

    def validate_start_date(self, value):
        """Validate that start_date is not in the past"""
        from django.utils import timezone
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past.")
        return value

    def validate_end_date(self, value):
        """Validate that end_date is not in the past"""
        from django.utils import timezone
        if value and value < timezone.now().date():
            raise serializers.ValidationError("End date cannot be in the past.")
        return value

    def validate(self, data):
        """Validate the entire data set"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })
        
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get('request')
        user = getattr(request, 'user', None)

        # remove sensitive fields if user is not authenticated
        if not user or not user.is_authenticated:
            data.pop('created_at', None)
            data.pop('representative', None)
        return data

class ApplicationSerializer(serializers.ModelSerializer):
    applicant           = UserSerializer(read_only=True)
    posting             = PostingSerializer(read_only=True)
    posting_uid         = serializers.UUIDField(write_only=True, required=False)

    # interview (read-only)
    interview           = InterviewSerializer(read_only=True)
    interviewDetails    = InterviewSerializer(
        write_only=True, required=False, allow_null=True,
        help_text="Use this to create/update the Interview when scheduling."
    )

    # read-only nested supervisor detail
    supervisor          = RepresentativeDetailsSerializer(read_only=True)
    supervisor_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source='supervisor',
        queryset=Representative.objects.all(),
        required=False,  
        allow_null=True,   
        help_text="ID of the rep to supervise (only required when status is Active)"
    )
    active_start_date = serializers.DateField(
        required=False,
        allow_null=True,
        help_text="…"
    )
    active_end_date = serializers.DateField(
        required=False,
        allow_null=True,
        help_text="…"
    )
    completion_remarks      = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Remarks to include in the completion letter (required when status == Completed)"
    )
    completion_letter_link  = serializers.URLField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="URL to the completion letter (required when status == Completed)"
    )

    class Meta:
        model = Application
        fields = [
            'UID', 'status', 'applied_at', 'full_name', 'email', 'location',
            'resume_link', 'cover_letter_link', 'additional_info', 'feedback',
            'completion_remarks', 'completion_letter_link',
            'applicant', 'posting', 'posting_uid', 'phone',
            'interview', 'interviewDetails',
            'supervisor', 'supervisor_id',
            'active_start_date', 'active_end_date',
        ]
        read_only_fields = [
            'UID', 'applied_at',
            'applicant', 'posting',
            'interview', 'supervisor'
        ]

    def create(self, validated_data):
        posting_uid = validated_data.pop('posting_uid', None)
        if posting_uid:
            try:
                posting = Posting.objects.get(UID=posting_uid)
                validated_data['posting'] = posting
            except Posting.DoesNotExist:
                raise serializers.ValidationError({
                    'posting_uid': 'Posting not found with the provided UID.'
                })
        
        return super().create(validated_data)

    def validate(self, data):
        # grab the raw input so we can see which keys were provided
        request = self.context.get('request')
        req = getattr(request, 'data', {}) if request else {}
        status = data.get('status', self.instance.status if self.instance else None)

        # check if the user is an applicant and trying to update fields they shouldn't
        user = self.context['request'].user
        if hasattr(user, 'applicant_profile'):
            # These are fields only representatives can update
            restricted_fields = [
                'status', 'feedback', 'interviewDetails', 'supervisor_id',
                'active_start_date', 'active_end_date', 'completion_remarks', 'completion_letter_link'
            ]
            for field in restricted_fields:
                if field in req:
                    raise PermissionDenied(f"Applicants are not allowed to update the '{field}' field.")

        # interview Scheduled so interviewDetails necessary
        if status == "Interview Scheduled":
            if 'interviewDetails' not in self.context['request'].data:
                raise serializers.ValidationError({
                    'interviewDetails': 'You must provide interviewDetails when scheduling an interview.'
                })

        # status is active so supervisor_id and dates required
        if status == "Active":
            req = self.context['request'].data
            missing = []
            for fld in ('supervisor_id', 'active_start_date', 'active_end_date'):
                if fld not in req or req.get(fld) in (None, ""):
                    missing.append(fld)
            if missing:
                raise serializers.ValidationError({
                    f'{fld}': 'This field is required when status is Active.' 
                    for fld in missing
                })

        if status == "Completed":
            missing = []
            if 'completion_remarks' not in req or not req.get('completion_remarks', "").strip():
                missing.append('completion_remarks')
            if 'completion_letter_link' not in req or not req.get('completion_letter_link', "").strip():
                missing.append('completion_letter_link')
            if missing:
                raise serializers.ValidationError({
                    fld: 'This field is required when status is Completed.'
                    for fld in missing
                })

        return data

    def update(self, instance, validated_data):
        # pop the nested interview payload
        interview_data = validated_data.pop('interviewDetails', None)

        # pop the active internship fields
        supervisor      = validated_data.pop('supervisor', None)
        start_date      = validated_data.pop('active_start_date', None)
        end_date        = validated_data.pop('active_end_date', None)

        comp_remarks     = validated_data.pop('completion_remarks', None)
        comp_letter_link = validated_data.pop('completion_letter_link', None)

        # update all of the other fields normally
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # handle interviewDetails
        if interview_data is not None:
            interviewer_instance = getattr(instance, 'interview', None)
            ser = InterviewSerializer(
                instance=interviewer_instance,
                data=interview_data,
                context=self.context,
                partial=True
            )
            ser.is_valid(raise_exception=True)
            ser.save(application=instance)

        # handle active internship status
        if instance.status == "Active":
            # still active so update dates and supervisor
            instance.supervisor         = supervisor
            instance.active_start_date  = start_date
            instance.active_end_date    = end_date
            instance.save()
        elif instance.status not in ("Active", "Completed"):
            # only clear when leaving both Active and Completed
            instance.supervisor         = None
            instance.active_start_date  = None
            instance.active_end_date    = None
            instance.save()

        # if status moved off "Interview Scheduled", delete nested
        if instance.status != "Interview Scheduled":
            try:
                instance.interview.delete()
            except Interview.DoesNotExist:
                pass

        if instance.status == "Completed":
            instance.completion_remarks     = comp_remarks
            instance.completion_letter_link = comp_letter_link
            instance.save()
        else:
            # clear on status change away from completed status
            instance.completion_remarks     = ""
            instance.completion_letter_link = None
            instance.save()

        return instance

class PublicCompanySerializer(serializers.ModelSerializer):
    """
    Serializer for public company information - excludes sensitive data
    """
    active_postings_count = serializers.SerializerMethodField()
    total_postings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'public_key', 'name', 'description', 'website', 'city', 
            'state_province', 'country', 'is_verified', 'active_postings_count', 
            'total_postings_count', 'registration_number', 'incorporation_date'
        ]
    
    def get_active_postings_count(self, obj):
        """Count of currently active postings"""
        return obj.postings.filter(status='Active', is_active=True).count()
    
    def get_total_postings_count(self, obj):
        """Total count of all postings ever created"""
        return obj.postings.count()

class SimplifiedPostingSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name')
    class Meta:
        model = Posting
        fields = ['title', 'company_name']

class WatchlistSerializer(serializers.ModelSerializer):
    posting = PostingSerializer(read_only=True)
    added_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Watchlist
        fields = ['id', 'posting', 'added_at']
        read_only_fields = ['applicant', 'added_at']
    
    def create(self, validated_data):
        # ensure the applicant is the current user
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)