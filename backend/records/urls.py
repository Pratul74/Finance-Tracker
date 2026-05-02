from django.urls import path
from .views import RecordView, SummaryView, MonthlyView, CategoryView

urlpatterns = [
    path('', RecordView.as_view()),
    path('summary/', SummaryView.as_view()),
    path('monthly/', MonthlyView.as_view()),
    path('category/', CategoryView.as_view()),
]