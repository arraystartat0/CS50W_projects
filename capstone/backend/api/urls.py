from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import auth_views 
from .views import RepresentativeDashboardView, RepresentativeMyListingsView, ApplicantDashboardView, RepresentativeDetailsViewSet

# API router for ViewSets
router = DefaultRouter()
router.register(r'companies', views.CompanyViewSet)
router.register(r'representatives', views.RepresentativeViewSet)
router.register(r'postings', views.PostingViewSet, basename='posting') 
router.register(r'applications', views.ApplicationViewSet, basename='application')
router.register(r'watchlist', views.WatchlistViewSet, basename='watchlist')
router.register(r'admin', views.AdminDashboardView, basename='admin')


urlpatterns = [
    # authentication
    path('auth/login/', auth_views.login_view, name='login'),  # login endpoint
    path('auth/token/', auth_views.login_view, name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # registration
    path('auth/register/company/', auth_views.register_company, name='register_company'),
    path('auth/register/representative/', views.RepresentativeViewSet.as_view({'post': 'register'})),
    path('auth/register/applicant/', auth_views.register_applicant, name='register_applicant'),
    path('auth/invitation/validate/<uuid:token>/', auth_views.validate_invitation_token, name='validate_invitation_token'),
    path('auth/register/representative/accept/', auth_views.accept_representative_invitation, name='accept_representative_invitation'),
    
    # public endpoints
    path('postings/public/<uuid:UID>/', views.PostingViewSet.as_view({'get': 'public_detail'})),
    path('companies/public/<str:public_key>/', views.CompanyViewSet.as_view({'get': 'public_detail'}), name='company-public-detail'),

    # rep endpoints
    path('rep/dashboard/', RepresentativeDashboardView.as_view(), name='rep-dashboard'),
    path('rep/my-listings/', RepresentativeMyListingsView.as_view(), name='rep-my-listings'),
    path('api/companies/<str:company_public_key>/representatives/', RepresentativeDetailsViewSet.as_view({'get': 'by_company_public_key'}), name='company-representatives'),

    # applicant endpoints
    path('applicant/dashboard/', ApplicantDashboardView.as_view(), name='applicant-dashboard'),

    # verification endpoints
    path('applications/verify/<uuid:UID>/', views.VerifyApplicationView.as_view(), name='verify-application'),
    
    # all other CRUD endpoints
    path('', include(router.urls)),
]