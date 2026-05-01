from django.db import models
from accounts.models import User

class Record(models.Model):
    TYPE = [
        ('income', 'Income'),
        ('expense', 'Expense')
    ]

    CATEGORY = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('clothing', 'Clothing'),
        ('medicine', 'Medicine'),
        ('entertainment', 'Entertainment'),
        ('fitness', 'Fitness'),
        ('skills', 'Skills'),
        ('investment', 'Investment'),
        ('hobby', 'Hobby'),
        ('others', 'Others')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="records")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(choices=CATEGORY, default='others', max_length=25)
    type = models.CharField(choices=TYPE, default='expense', max_length=15)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user} - {self.type} - ₹{self.amount}"

    class Meta:
        ordering = ['-date']
    
