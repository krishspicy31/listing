# Generated by Django 5.2.3 on 2025-07-03 16:07

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['status'], name='events_even_status_5709b6_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['city'], name='events_even_city_533bd7_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['category'], name='events_even_categor_25d9bd_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['event_date'], name='events_even_event_d_2c2da5_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['status', 'event_date'], name='events_even_status_fcd052_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['status', 'city'], name='events_even_status_a9a25f_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['status', 'category'], name='events_even_status_734e88_idx'),
        ),
    ]
