from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework import viewsets, status, permissions, generics
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action, permission_classes, action
from .models import Company, Representative, Posting, Application, Interview, Applicant, Watchlist, CompanyAdmin, RepresentativeInvitation
from .serializers import CompanySerializer, RepresentativeSerializer, RepresentativeDetailsSerializer, UserSerializer, PostingSerializer, ApplicationSerializer, PublicCompanySerializer, WatchlistSerializer, InterviewSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.db.models.functions import TruncDay, TruncWeek
from django.utils import timezone
from datetime import timedelta, datetime
from django.db import transaction
from rest_framework.exceptions import PermissionDenied

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    
    def get_permissions(self):
        action = getattr(self, 'action', None)
        if action in ['register', 'public_detail']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_authenticators(self):
        action = getattr(self, 'action', None)
        if action == 'public_detail':
            return []  # no auth for public endpoint
        return super().get_authenticators()

    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Register a new company
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save()
            return Response({
                'status': 'success',
                'company_id': company.id,
                'public_key': company.public_key,  # include public_key in response
                'message': 'Company registered successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(
        detail=False, 
        methods=['get'], 
        permission_classes=[AllowAny],
        url_path='public/(?P<public_key>[A-Z0-9]{8})',
        serializer_class=PublicCompanySerializer
    )
    def public_detail(self, request, public_key=None):
        """
        Public-facing company detail endpoint
        """
        try:
            company = get_object_or_404(Company, public_key=public_key, is_active=True)
            serializer = PublicCompanySerializer(company)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found or inactive"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class RepresentativeViewSet(viewsets.ModelViewSet):
    queryset = Representative.objects.all()
    serializer_class = RepresentativeSerializer
    permission_classes = [IsAuthenticated]  # needs authentication by default

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Publicly available endpoint to register a representative."""
        company_code = request.data.get('company_code')
        try:
            company = Company.objects.get(company_code=company_code)
        except Company.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid company code.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data.copy()
        data['company'] = company.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            representative = serializer.save()
            return Response({
                'status': 'success',
                'representative_id': representative.id,
                'message': 'Representative registered successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Authenticated endpoint to get the currently logged-in representative's profile."""
        try:
            representative = Representative.objects.get(user=request.user)
            serializer = self.get_serializer(representative)
            return Response(serializer.data)
        except Representative.DoesNotExist:
            return Response({'message': 'Representative profile not found'}, status=status.HTTP_404_NOT_FOUND)

class ApplicantRegistrationViewSet(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class PostingViewSet(viewsets.ModelViewSet):
    queryset = Posting.objects.all()
    serializer_class = PostingSerializer
    lookup_field = 'UID'
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Override get_queryset to support filtering by company public key
        """
        queryset = super().get_queryset()
        
        # filter by company public key, if provided
        company_public_key = self.request.query_params.get('company_public_key')
        if company_public_key:
            queryset = queryset.filter(company__public_key=company_public_key)
        
        # filter by status, if provided
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        #only show active postings for public access
        if not self.request.user.is_authenticated or not hasattr(self.request.user, 'representative'):
            queryset = queryset.filter(is_active=True, status='Active')
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        Automatically set company and representative based on authenticated user
        """
        user = self.request.user
        
        # Check if user is a representative
        if not hasattr(user, 'representative'):
            raise PermissionDenied("Only representatives can create postings.")
        
        representative = user.representative
        company = representative.company
        
        serializer.save(company=company, representative=representative)

    def perform_update(self, serializer):
        """
        Ensure validation runs on updates
        """
        serializer.save()
    @action(
      detail=True, 
      methods=['get'], 
      permission_classes=[AllowAny], 
      authentication_classes=[],
      url_path='public',     
    )
    def public_detail(self, request, UID=None):
        """
        Public-facing detail endpoint at:
        """
        posting = get_object_or_404(Posting, UID=UID)
        serializer = self.get_serializer(posting)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().select_related('posting', 'posting__company')
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated] # only authenticated users can access applications
    lookup_field = 'UID'

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'representative'):
            representative = user.representative
            #filter the applications so the application's posting belongs to this representative
            return Application.objects.filter(posting__representative=representative).order_by('-applied_at')
        # logic for applicants so they see their own applications
        elif user.is_authenticated:
            return Application.objects.filter(applicant=user).order_by('-applied_at')
        return Application.objects.none() # return empty if not authenticated or neither rep nor applicant

    def perform_create(self, serializer):
        # for when an applicant applies, we ensure the applicant is the current user
        serializer.save(applicant=self.request.user)

    # permit partial updates for status changes etc.
    def partial_update(self, request, *args, **kwargs):
         # Applicants should not be able to update these fields
        user = request.user
        if hasattr(user, 'applicant_profile'):
            # Define fields that only a representative can modify
            restricted_fields = ['status', 'feedback', 'interviewDetails', 'supervisor_id',
                                 'active_start_date', 'active_end_date', 'completion_remarks', 'completion_letter_link']
            for field in restricted_fields:
                if field in request.data:
                    raise PermissionDenied(f"Applicants are not allowed to update the '{field}' field.")

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def schedule_interview(self, request, UID=None):
        """
        Schedule an interview for an application
        """
        try:
            application = self.get_object()
            
            # ensure the user is a representative and is this application posting's author
            if not hasattr(request.user, 'representative'):
                return Response(
                    {'error': 'Only representatives can schedule interviews'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if application.posting.representative != request.user.representative:
                return Response(
                    {'error': 'You can only schedule interviews for your own postings'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # using an atomic transaction to ensure consistency
            with transaction.atomic():
                # update application status to "Interview Scheduled"
                application.status = "Interview Scheduled"
                application.feedback = request.data.get('feedback', application.feedback)
                application.save()
                
                #create or update interview
                interview_data = request.data.copy()
                interview_data['interviewer'] = request.user.representative.id
                
                try:
                    # try to update the existing interview
                    interview = application.interview
                    interview_serializer = InterviewSerializer(interview, data=interview_data, partial=True)
                except Interview.DoesNotExist:
                    # or create a new interview record
                    interview_serializer = InterviewSerializer(data=interview_data)
                
                if interview_serializer.is_valid():
                    interview = interview_serializer.save(application=application)
                    
                    # response contains data of the updated application with interview details
                    app_serializer = self.get_serializer(application)
                    return Response({
                        'message': 'Interview scheduled successfully',
                        'application': app_serializer.data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(interview_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
            return Response(
                {'error': f'Failed to schedule interview: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def generate_verification_link(self, request, pk=None):
        """Generate a verification link for a completed internship."""
        try:
            application = Application.objects.get(pk=pk, posting__representative=request.user.representative)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        if application.status != "Completed":
            return Response({'error': 'Application must be marked as Completed before verification.'}, status=status.HTTP_400_BAD_REQUEST)

        verification_link = f"http://127.0.0.1:8000/applicants/verify/{application.UID}/"
        return Response({'verification_link': verification_link})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def has_applied(self, request):
        """Check if the current user has applied to a specific posting."""
        posting_uid = request.query_params.get('posting_uid')
        if not posting_uid:
            return Response(
                {'error': 'posting_uid parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # check if user has applied to this posting
            has_applied = Application.objects.filter(
                applicant=request.user,
                posting__UID=posting_uid
            ).exists()
            
            return Response({
                'has_applied': has_applied,
                'posting_uid': posting_uid
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to check application status: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyApplicationView(RetrieveAPIView):
    queryset = Application.objects.filter(status="Completed")
    serializer_class = ApplicationSerializer
    lookup_field = "UID"
    permission_classes = []
    
    def get(self, request, UID=None):
        """
        Verify a completed application with additional verification details
        """
        try:
            # fetch the application
            application = Application.objects.select_related(
                'posting', 'posting__company', 'supervisor'
            ).get(UID=UID, status="Completed")
            
            # pull verification parameters
            last_name = request.GET.get('last_name', '').strip()
            email = request.GET.get('email', '').strip()
            
            # vfy the applicant details
            if not last_name or not email:
                return Response(
                    {"error": "Last name and email are required for verification."},
                    status=400
                )
            
            #check the last name matches (case-insensitive)
            if last_name.lower() not in application.full_name.lower():
                return Response(
                    {"error": "Last name does not match the application."},
                    status=400
                )
            
            # check if the email matches
            if email.lower() != application.email.lower():
                return Response(
                    {"error": "Email does not match the application."},
                    status=400
                )
            
            # prep the response data
            response_data = {
                "application": {
                    "UID": application.UID,
                    "full_name": application.full_name,
                    "email": application.email,
                    "phone": application.phone,
                    "location": application.location,
                    "applied_at": application.applied_at,
                    "status": application.status,
                    "resume_link": application.resume_link,
                    "cover_letter_link": application.cover_letter_link,
                    "active_start_date": application.active_start_date,
                    "active_end_date": application.active_end_date,
                    "completion_remarks": application.completion_remarks,
                    "completion_letter_link": application.completion_letter_link,
                    "supervisor": {
                        "full_name": f"{application.supervisor.first_name} {application.supervisor.last_name}"
                    } if application.supervisor else None,
                },
                "posting": {
                    "title": application.posting.title,
                    "job_type": application.posting.job_type,
                    "description": application.posting.description,
                    "location": application.posting.location,
                    "start_date": application.posting.start_date,
                    "end_date": application.posting.end_date,
                    "wage_type": application.posting.wage_type,
                    "pay_rate": application.posting.pay_rate,
                    "currency": application.posting.currency,
                    "status": application.posting.status,
                },
                "company": {
                    "name": application.posting.company.name,
                    "public_key": application.posting.company.public_key,
                    "description": application.posting.company.description,
                }
            }
            
            return Response(response_data)
            
        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found or not completed."},
                status=404
            )
        except Exception as e:
            return Response(
                {"error": "Verification failed. Please try again."},
                status=500
            ) 

class RepresentativeDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not hasattr(user, 'representative'):
            return Response(
                {"detail": "You are not authorized to view this dashboard or missing representative profile."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        representative = user.representative
        company = representative.company 

        user_details = {
            "first_name": user.first_name, # User model has first_name
        }

        company_details = {
            "name": company.name,
            "public_key": company.public_key,
        }

        # --- stats ---
        rep_postings = Posting.objects.filter(representative=representative)

        total_pending_applications = Application.objects.filter(
            posting__in=rep_postings,
        ).count()

        current_datetime = timezone.now()
        scheduled_interviews = Interview.objects.filter(
            application__posting__in=rep_postings
        ).select_related('application__posting')

        total_scheduled_interviews = 0
        for interview in scheduled_interviews:
            interview_datetime = datetime.combine(
                interview.interview_date, 
                interview.interview_time
            )
            # make it timezone-aware
            if timezone.is_aware(current_datetime):
                interview_datetime = timezone.make_aware(interview_datetime)
            
            if interview_datetime > current_datetime:
                total_scheduled_interviews += 1
        
        total_accepted_applications_count = Application.objects.filter(
            posting__in=rep_postings,
            status__in=['Active', 'Completed'] 
        ).count()

        total_applications = Application.objects.filter(
            posting__in=rep_postings
        ).count()

        acceptance_percentage = 0
        if total_applications > 0:
            acceptance_percentage = round((total_accepted_applications_count / total_applications) * 100, 2)
        
        stats = {
            "total_pending_applications": total_pending_applications,
            "total_scheduled_interviews": total_scheduled_interviews,
            "acceptance_percentage": acceptance_percentage, 
        }

        # --- application volume (per day) ---
        end_date = timezone.now()
        start_date = end_date - timedelta(days=5) 

        daily_applications = Application.objects.filter(
            posting__in=rep_postings,
            applied_at__range=(start_date, end_date) 
        ).annotate(
            day=TruncDay('applied_at')
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')

        app_volume_labels = []
        app_volume_data = []

        current_day_iter = start_date
        while current_day_iter <= end_date:
            day_label = current_day_iter.strftime('%a')
            app_volume_labels.append(day_label)
            
            # find data for this specific day
            found_data = next((item for item in daily_applications if item['day'].date() == current_day_iter.date()), None)
            app_volume_data.append(found_data['count'] if found_data else 0)
            
            current_day_iter += timedelta(days=1)
            
        application_volume = {
            "labels": app_volume_labels,
            "data": app_volume_data,
        }

        # --- application statuses ---
        application_statuses_counts = Application.objects.filter(
            posting__in=rep_postings
        ).values('status').annotate(
            count=Count('status')
        )
        
        status_labels = []
        status_data = []

        expected_statuses_order = [
            "Pending", "Denied", "Interview Scheduled", "Active", "Completed"
        ]
        
        status_map = {item['status']: item['count'] for item in application_statuses_counts}

        for status_name in expected_statuses_order:
            status_labels.append(status_name) # No need to capitalize if already capitalized in choices
            status_data.append(status_map.get(status_name, 0)) # Get count or 0 if no apps for that status

        application_statuses = {
            "labels": status_labels,
            "data": status_data,
        }

        # --- current interns ---
        current_interns_list = []
        active_intern_applications = Application.objects.filter(
            posting__in=rep_postings,
            status='Active'
        ).select_related('applicant', 'posting')

        for app in active_intern_applications:
            current_interns_list.append({
                "full_name": f"{app.applicant.first_name} {app.applicant.last_name}",
                "posting": app.posting.title 
            })
        
        current_interns = current_interns_list

        # --- Compile Final Response ---
        response_data = {
            "user_details": user_details,
            "company_details": company_details,
            "stats": stats,
            "application_volume": application_volume,
            "application_statuses": application_statuses,
            "current_interns": current_interns,
        }

        return Response(response_data, status=status.HTTP_200_OK)

class RepresentativeMyListingsView(generics.ListAPIView):
    serializer_class = PostingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            # if user not authenticated, return an empty set
            return Posting.objects.none()

        try:
            representative = Representative.objects.get(user=user)
            company = representative.company

            queryset = Posting.objects.filter(representative=representative)
            queryset = queryset.annotate(
                applications_count=Count('applications'),
                interviews_count=Count(
                    'applications',
                    filter=Q(applications__status="Interview Scheduled")
                ),
                rejections_count=Count(
                    'applications',
                    filter=Q(applications__status="Denied")
                )
            ).order_by('-created_at')

            return queryset

        except Representative.DoesNotExist:
            return Posting.objects.none()
        except Exception as e:
            print(f"Error in RepresentativeMyListingsView get_queryset: {e}")
            return Posting.objects.none()

class ApplicantDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        # Ensure the user is an applicant
        try:
            applicant_profile = user.applicant_profile
        except Applicant.DoesNotExist:
            return Response(
                {"detail": "You are not authorized to view this dashboard."},
                status=status.HTTP_403_FORBIDDEN
            )

        # --- user Details ---
        user_details = {
            "display_name": f"{user.first_name} {user.last_name}" or user.username,
            "email": user.email,
            "phone_number": applicant_profile.phone_number if applicant_profile.phone_number else None,
            "city": applicant_profile.city if applicant_profile.city else None,
            "country": applicant_profile.country if applicant_profile.country else None,
        }

        # --- fetch all applications for the user once, including supervisor details ---
        applications = Application.objects.filter(applicant=user).select_related(
            'posting', 'posting__company', 'supervisor', 'supervisor__user'
        ).order_by('-applied_at')

        # --- statistics ---
        total_applications = applications.count()
        interviews = applications.filter(status='Interview Scheduled').count()
        accepted = applications.filter(status__in=['Active', 'Completed']).count()
        
        stats = [
            {"icon": "fa-file-lines", "value": total_applications, "label": "Applications"},
            {"icon": "fa-comments", "value": interviews, "label": "Interviews"},
            {"icon": "fa-check", "value": accepted, "label": "Accepted"},
        ]

        # --- current internship details ---
        current_internship_app = applications.filter(status='Active').first()
        current_internship = None
        if current_internship_app:
            posting = current_internship_app.posting
            current_internship = {
                "company": posting.company.name if posting.company else 'Unknown Company',
                "position": posting.title,
                "location": posting.location,
                "startDate": current_internship_app.active_start_date.strftime("%Y-%m-%d") if current_internship_app.active_start_date else None,
                "endDate": current_internship_app.active_end_date.strftime("%Y-%m-%d") if current_internship_app.active_end_date else None,
                "supervisor": f"{current_internship_app.supervisor.first_name} {current_internship_app.supervisor.last_name}" if current_internship_app.supervisor else 'N/A',
                "notes": [current_internship_app.feedback] if current_internship_app.feedback else [],
                "uuid": current_internship_app.UID,
                "company_public_key": posting.company.public_key if posting.company else None,
                "listing_UID": posting.UID,
            }

        # --- recent applications (top 5, excluding active/completed) ---
        recent_applications = []
        recent_apps_query = applications.exclude(status__in=['Active', 'Completed'])[:5]
        for app in recent_apps_query:
            recent_applications.append({
                "company": app.posting.company.name if app.posting.company else 'Unknown Company',
                "position": app.posting.title,
                "dateApplied": app.applied_at.strftime("%b %d, %Y"),
                "lastUpdated": app.applied_at.strftime("%b %d, %Y"),
                "status": app.status,
                "UID": app.UID, # Add application UID
                "company_public_key": app.posting.company.public_key if app.posting.company else None, # Add company public_key
                "listing_UID": app.posting.UID,
            })

        # --- past internships ---
        past_internships = []
        past_apps_query = applications.filter(status='Completed')
        for app in past_apps_query:
            past_internships.append({
                "company": app.posting.company.name if app.posting.company else 'Unknown Company',
                "position": app.posting.title,
                "startDate": app.active_start_date.strftime("%Y-%m-%d") if app.active_start_date else None,
                "endDate": app.active_end_date.strftime("%Y-%m-%d") if app.active_end_date else None,
                "supervisor": f"{app.supervisor.first_name} {app.supervisor.last_name}" if app.supervisor else 'N/A',
                "company_public_key": app.posting.company.public_key if app.posting.company else None, # Add company public_key
                "listing_UID": app.posting.UID,
            })

        # --- compile final JSON response ---
        response_data = {
            "userDetails": user_details,
            "statistics": stats,
            "currentInternship": current_internship,
            "recentApplications": recent_applications,
            "pastInternships": past_internships
        }

        return Response(response_data, status=status.HTTP_200_OK)

class RepresentativeDetailsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Representative.objects.all()
    serializer_class = RepresentativeDetailsSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def by_company_public_key(self, request, company_public_key=None):
        """
        Retrieves representatives for a specific company identified by its public key.
        """
        if not company_public_key:
            return Response(
                {"detail": "The 'company_public_key' is missing from the URL path."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            company = Company.objects.get(public_key=company_public_key)
            representatives = Representative.objects.filter(company=company)
            serializer = self.get_serializer(representatives, many=True)
            return Response(serializer.data)
        except Company.DoesNotExist:
            return Response(
                {"detail": f"Company with public key '{company_public_key}' not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApplicantMyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'applicant_profile'):
            return Application.objects.filter(applicant=user.applicant_profile).order_by('-applied_at')
        return Application.objects.none()

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return the watchlist items for the current authenticated user"""
        return Watchlist.objects.filter(applicant=self.request.user).select_related('posting', 'posting__company')
    
    def perform_create(self, serializer):
        """Ensure the applicant is the current user when creating"""
        serializer.save(applicant=self.request.user)
    
    @action(detail=False, methods=['post'])
    def add_to_watchlist(self, request):
        """Add a posting to the user's watchlist"""
        posting_uid = request.data.get('posting_uid')
        if not posting_uid:
            return Response(
                {'error': 'posting_uid is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            posting = Posting.objects.get(UID=posting_uid)
        except Posting.DoesNotExist:
            return Response(
                {'error': 'Posting not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # check if already in watchlist
        if Watchlist.objects.filter(applicant=request.user, posting=posting).exists():
            return Response(
                {'error': 'Posting is already in your watchlist'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        watchlist_item = Watchlist.objects.create(
            applicant=request.user,
            posting=posting
        )
        
        serializer = self.get_serializer(watchlist_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['delete'])
    def remove_from_watchlist(self, request):
        """Remove a posting from the user's watchlist"""
        posting_uid = request.data.get('posting_uid')
        if not posting_uid:
            return Response(
                {'error': 'posting_uid is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            watchlist_item = Watchlist.objects.get(
                applicant=request.user,
                posting__UID=posting_uid
            )
            watchlist_item.delete()
            return Response({'message': 'Removed from watchlist'}, status=status.HTTP_200_OK)
        except Watchlist.DoesNotExist:
            return Response(
                {'error': 'Posting not found in watchlist'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class AdminDashboardView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get admin dashboard data"""
        user = request.user
        
        # ensure attempting user is a company admin
        try:
            admin_profile = user.company_admin
        except CompanyAdmin.DoesNotExist:
            return Response(
                {"detail": "You are not authorized to view this dashboard."},
                status=status.HTTP_403_FORBIDDEN
            )

        company = admin_profile.company

        # --- Admin Details ---
        admin_details = {
            "first_name": admin_profile.first_name,
            "last_name": admin_profile.last_name,
            "email": user.email,
        }

        # --- Company Details ---
        company_details = {
            "name": company.name,
            "description": company.description,
            "website": company.website,
            "address": company.address,
            "city": company.city,
            "state_province": company.state_province,
            "country": company.country,
            "postal_code": company.postal_code,
            "registration_number": company.registration_number,
            "incorporation_date": company.incorporation_date.strftime("%Y-%m-%d") if company.incorporation_date else None,
            "company_type": company.company_type,
            "email": company.email,
            "phone": company.phone,
            "public_key": company.public_key,
            "private_key": company.private_key,
            "is_active": company.is_active,
            "is_verified": company.is_verified,
            "registration_date": company.registration_date.strftime("%Y-%m-%d"),
        }

        # --- Current Representatives ---
        representatives = []
        reps_query = Representative.objects.filter(company=company).select_related('user')
        for rep in reps_query:
            representatives.append({
                "id": rep.id,
                "first_name": rep.first_name,
                "last_name": rep.last_name,
                "email": rep.user.email,
                "user_id": rep.user.id,
            })

        # --- Current Invitations ---
        invitations = []
        invs_query = RepresentativeInvitation.objects.filter(company=company).order_by('-invited_at')
        for inv in invs_query:
            invitations.append({
                "id": inv.id,
                "email": inv.email,
                "last_name": inv.last_name,
                "invitation_token": inv.invitation_token,
                "is_accepted": inv.is_accepted,
                "invited_at": inv.invited_at.strftime("%Y-%m-%d %H:%M"),
            })

        # --- Company Statistics ---
        total_postings = Posting.objects.filter(company=company).count()
        active_postings = Posting.objects.filter(company=company, status='Active').count()
        total_applications = Application.objects.filter(posting__company=company).count()
        active_interns = Application.objects.filter(
            posting__company=company, 
            status='Active'
        ).count()

        stats = {
            "total_postings": total_postings,
            "active_postings": active_postings,
            "total_applications": total_applications,
            "active_interns": active_interns,
        }

        # --- Compile Final Response ---
        response_data = {
            "admin_details": admin_details,
            "company_details": company_details,
            "representatives": representatives,
            "invitations": invitations,
            "stats": stats,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def delete_representative(self, request):
        """Delete a representative from the company"""
        representative_id = request.data.get('representative_id')
        if not representative_id:
            return Response(
                {'error': 'representative_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            admin_profile = request.user.company_admin
            representative = Representative.objects.get(
                id=representative_id,
                company=admin_profile.company
            )
            
            # del the associated user account
            user = representative.user
            representative.delete()
            user.delete()
            
            return Response({'message': 'Representative deleted successfully'}, status=status.HTTP_200_OK)
            
        except Representative.DoesNotExist:
            return Response(
                {'error': 'Representative not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to delete representative: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def generate_invitation(self, request):
        """Generate a new invitation for a representative"""
        email = request.data.get('email')
        last_name = request.data.get('last_name')
        
        if not email or not last_name:
            return Response(
                {'error': 'email and last_name are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            admin_profile = request.user.company_admin
            company = admin_profile.company
            
            # check if invitation already exists
            if RepresentativeInvitation.objects.filter(company=company, email=email).exists():
                return Response(
                    {'error': 'Invitation already exists for this email'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # generate a new invitation
            invitation = RepresentativeInvitation.objects.create(
                company=company,
                email=email,
                last_name=last_name
            )
            
            return Response({
                'message': 'Invitation generated successfully',
                'invitation': {
                    'id': invitation.id,
                    'email': invitation.email,
                    'last_name': invitation.last_name,
                    'invitation_token': invitation.invitation_token,
                    'invited_at': invitation.invited_at.strftime("%Y-%m-%d %H:%M"),
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate invitation: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def revoke_invitation(self, request):
        """Revoke an invitation"""
        invitation_id = request.data.get('invitation_id')
        if not invitation_id:
            return Response(
                {'error': 'invitation_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            admin_profile = request.user.company_admin
            invitation = RepresentativeInvitation.objects.get(
                id=invitation_id,
                company=admin_profile.company
            )
            
            invitation.delete()
            return Response({'message': 'Invitation revoked successfully'}, status=status.HTTP_200_OK)
            
        except RepresentativeInvitation.DoesNotExist:
            return Response(
                {'error': 'Invitation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to revoke invitation: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )