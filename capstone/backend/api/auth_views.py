from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from datetime import timedelta, date
from django.utils import timezone
import uuid
from .models import Company, CompanyAdmin, RepresentativeInvitation, Representative, Applicant
from django.urls import reverse
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

FRONTEND_ROUTE_NAME = "register-rep"

# --- START: Validation Helper Functions ---

def validate_password(password):
    """
    Placeholder for password validation.
    Returns (True, "") if valid, (False, "error message") otherwise.
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one digit."
    if not any(char.isupper() for char in password):
        return False, "Password must contain at least one uppercase letter."
    if not any(char.islower() for char in password):
        return False, "Password must contain at least one lowercase letter."
    if not any(char in "!@#$%^&*()-_=+" for char in password): # Example special chars
         return False, "Password must contain at least one special character."
    return True, ""

def validate_phone(phone_number):
    """
    Placeholder for phone number validation.
    Returns (True, "") if valid, (False, "error message") otherwise.
    """
    # If phone_number is optional, an empty string is valid
    if not phone_number:
        return True, "" 
    
    # Basic check for non-empty phone number
    # A simple digit check, consider more robust regex for production
    if not all(char.isdigit() or char == '+' for char in phone_number.strip()):
        return False, "Phone number must contain only digits and optionally start with '+'."
    
    # Example length constraints (adjust as needed)
    cleaned_number = phone_number.replace('+', '').strip()
    if len(cleaned_number) < 7 or len(cleaned_number) > 15:
        return False, "Phone number length must be between 7 and 15 digits (excluding '+')."
    
    return True, ""
# --- END: Validation Helper Functions ---

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Unified login endpoint that determines user type and returns appropriate data
    """
    email = request.data.get('email')
    password = request.data.get('password')
    user_type = request.data.get('user_type')  # 'admin', 'representative', 'applicant'
    
    if not all([email, password, user_type]):
        return Response({'error': 'Email, password, and user_type are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Try to authenticate with email
    try:
        user = User.objects.get(email=email)
        user = authenticate(username=user.username, password=password)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if user type matches
    user_profile = None
    if user_type == 'admin':
        try:
            user_profile = user.company_admin
            profile_data = {
                'first_name': user_profile.first_name,
                'last_name': user_profile.last_name,
                'company': {
                    'name': user_profile.company.name,
                    'public_key': user_profile.company.public_key,
                }
            }
        except CompanyAdmin.DoesNotExist:
            return Response({'error': 'User is not a company admin'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    elif user_type == 'representative':
        try:
            user_profile = user.representative
            profile_data = {
                'first_name': user_profile.first_name,
                'last_name': user_profile.last_name,
                'company': {
                    'id': user_profile.company.id,
                    'name': user_profile.company.name,
                    'public_key': user_profile.company.public_key,
                }
            }
        except Representative.DoesNotExist:
            return Response({'error': 'User is not a representative'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    elif user_type == 'applicant':
        try:
            user_profile = user.applicant_profile
            profile_data = {
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        except Applicant.DoesNotExist:
            return Response({'error': 'User is not an applicant'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user_type': user_type,
        'profile': profile_data
    })

def validate_password(password):
    """
    Placeholder for password validation.
    Returns (True, "") if valid, (False, "error message") otherwise.
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one digit."
    if not any(char.isupper() for char in password):
        return False, "Password must contain at least one uppercase letter."
    if not any(char.islower() for char in password):
        return False, "Password must contain at least one lowercase letter."
    if not any(char in "!@#$%^&*()-_=+" for char in password):  # Example special chars
        return False, "Password must contain at least one special character."
    return True, ""

@api_view(['POST'])
@permission_classes([AllowAny])              
@authentication_classes([]) 
def register_company(request):
    """
    Register a new company with admin
    """
    try:
        with transaction.atomic():
            # Company data
            company_data = request.data.get('company', {})
            admin_data = request.data.get('admin', {})
            reps_data = request.data.get('reps', [])

            inc_date_str = company_data.get('incorporation_date')
            if not inc_date_str:
                return Response(
                    {'error': 'Company incorporation_date is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # parse ISO‐format string into a date
            try:
                inc_date = date.fromisoformat(inc_date_str)
            except ValueError:
                return Response(
                    {'error': 'Invalid incorporation_date format, expected YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            today = timezone.localdate()
            min_allowed = today - timedelta(days=14)

            if inc_date > today:
                return Response(
                    {'error': 'Incorporation date cannot be in the future.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if inc_date > min_allowed:
                return Response(
                    {'error': 'Incorporation date must be at least 14 days before today.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate required fields
            required_company_fields = ['name']
            required_admin_fields = ['first_name', 'last_name', 'email', 'password']
            
            for field in required_company_fields:
                if not company_data.get(field):
                    return Response({'error': f'Company {field} is required'}, 
                                  status=status.HTTP_400_BAD_REQUEST)
            
            for field in required_admin_fields:
                if not admin_data.get(field):
                    return Response({'error': f'Admin {field} is required'}, 
                                  status=status.HTTP_400_BAD_REQUEST)
            
            # Validate password strength
            password = admin_data.get('password')
            is_valid, error_message = validate_password(password)
            if not is_valid:
                return Response({'error': error_message}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email already exists
            if User.objects.filter(email=admin_data['email']).exists():
                return Response({'error': 'Email already registered'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Create company
            company = Company.objects.create(
                name                = company_data['name'],
                description         = company_data.get('description', ''),
                registration_number = company_data.get('registration_number', ''),
                incorporation_date  = company_data.get('incorporation_date'),
                company_type        = company_data.get('company_type', ''),
                address             = company_data.get('address', ''),
                city                = company_data.get('city', ''),
                state_province      = company_data.get('state_province', ''),
                country             = company_data.get('country', ''),
                postal_code         = company_data.get('postal_code', ''),
                email               = company_data.get('email', ''),
                phone               = company_data.get('phone', ''),
                website             = company_data.get('website', ''),
            )
            
            # Create admin user
            admin_user = User.objects.create_user(
                username   = admin_data['email'],
                email      = admin_data['email'],
                password   = admin_data['password'],
                first_name = admin_data['first_name'],
                last_name  = admin_data['last_name']
            )

            
            # Create admin profile
            admin_profile = CompanyAdmin.objects.create(
                company=company,
                user=admin_user,
                first_name=admin_data['first_name'],
                last_name=admin_data['last_name']
            )

            frontend_origin = (
                request.META.get("HTTP_X_FRONTEND_ORIGIN")
                or settings.FRONTEND_URL
            )
            
            invitation_links = []
            for rep_data in reps_data:
                invitation = RepresentativeInvitation.objects.create(
                    company=company,
                    email=rep_data.get('email'),
                    last_name=rep_data.get('last_name')
                )

                # Generate the full invitation link
                link = f"{frontend_origin}/invitation/accept?token={invitation.invitation_token}"
                invitation_links.append({
                    "email": invitation.email,
                    "link":  link
                })

            return Response({
                'message': 'Company registered successfully',
                'company': {
                    'id': company.id,
                    'name': company.name,
                    'public_key': company.public_key,
                    'private_key': company.private_key,
                },
                'invitation_links': invitation_links
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_applicant(request):
    """
    Register a new applicant with a user account and a comprehensive applicant profile.
    """
    # Extract data from request
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    phone_number = request.data.get('phone_number', '').strip()
    city = request.data.get('city', '').strip()
    state = request.data.get('state', '').strip()
    country = request.data.get('country', '').strip()

    # Validate required fields
    if not all([email, password, first_name, last_name, country]):
        return Response({
            'error': 'First name, last name, email, password, and country are required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Validate email format using try-except for ValidationError
    try:
        validate_email(email)
        is_valid_email = True
        email_error = ""
    except ValidationError as e:
        is_valid_email = False
        email_error = str(e)
    
    if not is_valid_email:
        return Response({'error': email_error}, status=status.HTTP_400_BAD_REQUEST)

    # Validate password strength
    is_valid_password, password_error = validate_password(password)
    if not is_valid_password:
        return Response({'error': password_error}, status=status.HTTP_400_BAD_REQUEST)

    # Validate phone number if provided
    is_valid_phone, phone_error = validate_phone(phone_number)
    if not is_valid_phone:
        return Response({'error': phone_error}, status=status.HTTP_400_BAD_REQUEST)

    # Validate name fields
    if len(first_name) < 2:
        return Response({'error': 'First name must be at least 2 characters long'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    if len(last_name) < 2:
        return Response({'error': 'Last name must be at least 2 characters long'}, 
                        status=status.HTTP_400_BAD_REQUEST)

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({'error': 'A user with this email already exists.'}, 
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Create the user object
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # address from components
            address_parts = []
            if city:
                address_parts.append(city)
            if state:
                address_parts.append(state)
            if country:
                address_parts.append(country)
            
            address = ', '.join(address_parts)

            # Create the applicant profile with all fields
            applicant = Applicant.objects.create(
                user=user,
                phone_number=phone_number,
                address=address,
                city=city,
                state=state,
                country=country
            )
            
            user_data = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile': {
                    'id': applicant.id,
                    'phone_number': applicant.phone_number,
                    'address': applicant.address,
                    'city': applicant.city,
                    'state': applicant.state,
                    'country': applicant.country,
                }
            }
            
            return Response({
                'message': 'Applicant registered successfully!',
                'user': user_data
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def validate_invitation_token(request, token):
    """
    Checks if an invitation token is valid and not yet accepted.
    """
    try:
        invitation = RepresentativeInvitation.objects.get(invitation_token=token, is_accepted=False)
        # If valid, return a success response.
        return Response({
            'message': 'Token is valid.',
        }, status=status.HTTP_200_OK)
    except RepresentativeInvitation.DoesNotExist:
        return Response({'error': 'This invitation is invalid or has already been used.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def accept_representative_invitation(request):
    """
    Allows a user to accept an invitation and register as a representative.
    """
    token = request.data.get('token')
    last_name = request.data.get('last_name')
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    password = request.data.get('password')
    private_code = request.data.get('private_code')

    # Validation steps:
    # 1. Check if token exists and is not already used
    try:
        invitation = RepresentativeInvitation.objects.get(invitation_token=token, is_accepted=False)
    except RepresentativeInvitation.DoesNotExist:
        return Response({'error': 'This invitation is invalid or has already been used.'}, status=status.HTTP_404_NOT_FOUND)

    # 2. Check if the last name matches
    if invitation.last_name.strip() != last_name.strip():
        return Response({'error': 'The last name does not match the invitation. This field is case sensitive.'}, status=status.HTTP_400_BAD_REQUEST)

    # 3. Check if the email matches
    if invitation.email.lower() != email.lower():
        return Response({'error': 'The email address does not match the invitation.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 4. Validate password requirements
    valid_password, password_msg = validate_password(password)
    if not valid_password:
        return Response({ 'error': password_msg },status=status.HTTP_400_BAD_REQUEST)
    
    # 5. Validate private code
    if not private_code:
        return Response({'error': 'Company private code is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if private code is exactly 8 characters
    if len(private_code) != 8:
        return Response({'error': 'Private code must be exactly 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if the private code matches the company's private code
    if invitation.company.private_key != private_code.upper():
        return Response({'error': 'The private code does not match the company code.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if a user with this email already exists
    if User.objects.filter(email=email).exists():
        return Response({'error': 'A user with this email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    # 6. If all checks pass, create the user and representative record
    try:
        with transaction.atomic():
            # Create the user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # Create the representative profile
            Representative.objects.create(
                user=user,
                company=invitation.company,
                first_name=first_name,
                last_name=last_name,
            )

            # Mark the invitation as accepted
            invitation.is_accepted = True
            invitation.save()

            # Prepare a simple user object to return
            user_data = {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }

            return Response({
                'message': 'Representative account created successfully!',
                'user': user_data
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)