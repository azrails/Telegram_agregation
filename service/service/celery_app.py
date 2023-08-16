import os
import time
from celery import Celery
from django.conf import settings
from celery.schedules import crontab
os.environ.setdefault('DJANGO_SETTINGS_MODULE',"service.settings")

app=Celery('service')
app.config_from_object('django.conf.settings')
app.conf.broker_url = settings.CELERY_BROKER_URL

app.autodiscover_tasks()

app.conf.beat_schedule = {
    'task1': { 
        'task': 'telegram.tasks.parse_data',
        'schedule': crontab(minute='*/15'),
    },
    'task2': { 
        'task': 'telegram.tasks.get_gpt_posts_hour',
        'schedule': crontab(minute='*/60'),
    },
    'task3': { 
        'task': 'telegram.tasks.get_gpt_posts_day',
        'schedule': crontab(hour='*/24'),
    },
}