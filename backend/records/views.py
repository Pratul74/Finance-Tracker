from django.db.models import Sum, DecimalField, Case, When
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
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


class RecordView(BaseRecordView):

    def get(self, request):
        records = self.get_filtered_queryset(request)
        serializer = RecordSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = RecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SummaryView(BaseRecordView):

    def get(self, request):
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

        return Response(data, status=status.HTTP_200_OK)

class MonthlyView(BaseRecordView):

    def get(self, request):
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

        result = []
        for item in data:
            result.append({
                "month": item["month"].strftime("%Y-%m"),
                "income": item["income"] or 0,
                "expense": item["expense"] or 0
            })

        return Response(result, status=status.HTTP_200_OK)



class CategoryView(BaseRecordView):

    def get(self, request):
        qs = self.get_filtered_queryset(request)

        data = (
            qs.filter(type='expense')
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        result = []
        for item in data:
            result.append({
                "category": item["category"],
                "total": item["total"] or 0
            })

        return Response(result, status=status.HTTP_200_OK)
    




    

