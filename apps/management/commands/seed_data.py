from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.models import Lead, LeadActivity

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with initial test users and leads for UI testing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding test data...')

        # Create Admin User
        admin_user, created = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'Admin',
                'department': 'Management',
                'phone_number': '+998901112233',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('AdminPassword123!')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_user.email}'))

        # Create Sales User
        sales_user, created = User.objects.get_or_create(
            email='sales@example.com',
            defaults={
                'first_name': 'Ali',
                'last_name': 'Rahimov',
                'role': 'Sales Manager',
                'department': 'Sales',
                'phone_number': '+998901234567',
            }
        )
        if created:
            sales_user.set_password('TestPassword123!')
            sales_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created sales user: {sales_user.email}'))

        # Create Sample Leads if none exist
        if Lead.objects.count() == 0:
            leads_data = [
                {
                    "name": "Sarah Karimova",
                    "email": "sarah@example.com",
                    "phone": "+998912345678",
                    "source": "social-media",
                    "status": "new",
                    "priority": "high",
                    "estimated_value": 5000.00,
                    "company": "TechCorp",
                    "assigned_to": sales_user,
                    "created_by": admin_user
                },
                {
                    "name": "John Toshmatov",
                    "email": "john@example.com",
                    "phone": "+998934567890",
                    "source": "referral",
                    "status": "contacted",
                    "priority": "medium",
                    "estimated_value": 3200.00,
                    "company": "Global Trade",
                    "assigned_to": sales_user,
                    "created_by": admin_user
                },
                {
                    "name": "Maryam Ahmedova",
                    "email": "maryam@example.com",
                    "phone": "+998945678901",
                    "source": "website",
                    "status": "qualified",
                    "priority": "high",
                    "estimated_value": 12000.00,
                    "company": "Apex Solutions",
                    "assigned_to": sales_user,
                    "created_by": admin_user
                },
                {
                    "name": "Bobur Nazarov",
                    "email": "bobur@example.com",
                    "phone": "+998956789012",
                    "source": "cold-call",
                    "status": "won",
                    "priority": "low",
                    "estimated_value": 7500.00,
                    "company": "Nazarov LLC",
                    "assigned_to": sales_user,
                    "created_by": admin_user
                },
            ]

            for l_data in leads_data:
                lead = Lead.objects.create(**l_data)
                LeadActivity.objects.create(
                    lead=lead,
                    user=sales_user,
                    activity_type='note',
                    title='Initial Contact',
                    description=f'Created lead for {lead.company}'
                )

            self.stdout.write(self.style.SUCCESS(f'Successfully created {len(leads_data)} sample leads!'))
        else:
            self.stdout.write('Leads already exist in database, skipping lead seeding.')

        self.stdout.write(self.style.SUCCESS('Seeding completed successfully!'))
