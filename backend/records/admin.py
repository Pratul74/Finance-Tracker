from django.contrib import admin
from .models import Record

@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display=['id', 'user', 'amount', 'type', 'category', 'date']
    list_filter=['type', 'category', 'date']
    search_fields=['description', 'user__email']
    ordering=['-date']
