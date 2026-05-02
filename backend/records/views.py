from django.db.models import Sum, DecimalField, Case, When
from django.db.models.functions import TruncMonth
from django.core.cache import cache

from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Record
from .serializers import RecordSerializer


class BaseRecordView(APIView):
    permission_classes = [IsAuthenticated]

    def get_filtered_queryset(self, request):
        qs = Record.objects.filter(user=request.user)

        start = request.GET.get('start')
        end = request.GET.get('end')

        if start:
            qs = qs.filter(date__date__gte=start)
        if end:
            qs = qs.filter(date__date__lte=end)

        return qs

    def get_cache_key(self, request, prefix):
        return f"{prefix}_user_{request.user.id}_{request.GET.urlencode()}"
    
    def delete_user_cache(self, user_id):
        from django_redis import get_redis_connection
        con= get_redis_connection("default")
        keys = con.keys(f"*user_{user_id}_*")
        if keys:
            con.delete(*keys)



class RecordView(BaseRecordView, ListCreateAPIView):
    serializer_class = RecordSerializer

    def get_queryset(self):
        return self.get_filtered_queryset(self.request)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        self.delete_user_cache(self.request.user.id)


class SummaryView(BaseRecordView):

    def get(self, request):
        cache_key = self.get_cache_key(request, "summary")

        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        qs = self.get_filtered_queryset(request)

        data = qs.aggregate(
            total_income=Sum(
                Case(
                    When(type='income', then='amount'),
                    default=0,
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )
            ),
            total_expense=Sum(
                Case(
                    When(type='expense', then='amount'),
                    default=0,
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )
            )
        )

        data['total_income'] = data['total_income'] or 0
        data['total_expense'] = data['total_expense'] or 0
        data['balance'] = data['total_income'] - data['total_expense']

        cache.set(cache_key, data, timeout=60 * 5)

        return Response(data)

class MonthlyView(BaseRecordView):

    def get(self, request):
        cache_key = self.get_cache_key(request, "monthly")

        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        qs = self.get_filtered_queryset(request)

        data = (
            qs.annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(
                income=Sum(
                    Case(
                        When(type='income', then='amount'),
                        default=0,
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                ),
                expense=Sum(
                    Case(
                        When(type='expense', then='amount'),
                        default=0,
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            )
            .order_by('month')
        )

        result = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "income": item["income"] or 0,
                "expense": item["expense"] or 0
            }
            for item in data
        ]

        cache.set(cache_key, result, timeout=60 * 5)

        return Response(result)

class CategoryView(BaseRecordView):

    def get(self, request):
        cache_key = self.get_cache_key(request, "category")

        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        qs = self.get_filtered_queryset(request)

        data = (
            qs.filter(type='expense')
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        result = [
            {
                "category": item["category"],
                "total": item["total"] or 0
            }
            for item in data
        ]

        cache.set(cache_key, result, timeout=60 * 5)

        return Response(result)
    




    

