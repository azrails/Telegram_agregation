from email import message
from operator import mod
from statistics import mode
from django.db import models
from django.utils import timezone
import datetime
# from django.db.models.ImageField

class TGUser(models.Model):
    user_id = models.CharField(blank=True, null=True, default='0')
    username = models.CharField(blank=True, null=True, default='Аноним')

    def __str__(self) -> str:
        return self.username

class Groups(models.Model):
    GROUPS_CHOISES = [
        ('undef', ''),
        ('buisness', 'Бизнес'),
        ('finance', 'Финансы'),
        ('traveling', 'Путешествия')
    ]
    id = models.AutoField(primary_key=True)
    title = models.CharField(choices=GROUPS_CHOISES, default='undef')

    def __str__(self) -> str:
        return self.title

class Sources(models.Model):
    TYPE_CHOISES = [
        ('telegram', 'Telegram'),
    ]
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100, blank=True)
    url = models.CharField(max_length=1000)
    type = models.CharField(choices=TYPE_CHOISES, default='telegram')

    @property
    def projects_list(self):
        projects = []
        for p in self.projects.all():
            projects.append(p.title)
        return projects

    def __str__(self) -> str:
        return str(self.url)


class Projects(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=80)
    description = models.CharField(max_length=300, blank=True)
    update_time = models.TimeField()
    group_id = models.ForeignKey(Groups, related_name='projects', on_delete=models.SET_NULL, null=True)
    sourses = models.ManyToManyField(Sources, related_name='projects')
    current_promt = models.IntegerField(null=True)

    def __str__(self) -> str:
        return self.title

class Promts(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=200, blank=True)
    promt_text = models.TextField()
    project_id = models.ForeignKey(Projects, related_name='promts', on_delete=models.CASCADE)

    def __str__(self):
        return self.description

class GptPosts(models.Model):
    id = models.AutoField(primary_key=True)
    summary = models.TextField(blank=True)
    project_id = models.ForeignKey(Projects, related_name='gpt_posts', on_delete=models.CASCADE)
    promt_id = models.ForeignKey(Promts, related_name='gpt_posts', on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)
    long_type = models.TimeField(default=datetime.time(1,0))
    creation_date = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-creation_date','-date']

    def __str__(self):
        return str(self.date)

class Posts(models.Model):
    id = models.CharField(primary_key=True)
    post_text = models.TextField(blank=True)
    date = models.DateTimeField()
    source_id = models.ForeignKey(Sources, related_name='posts', on_delete=models.CASCADE)
    user_id = models.ForeignKey(TGUser, related_name='posts', on_delete=models.DO_NOTHING, null=True)


class Comments(models.Model):
    id = models.CharField(primary_key=True)
    comment_text = models.TextField()
    source_id = models.ForeignKey(Sources, related_name='comments', on_delete=models.CASCADE, null=True)
    user_id = models.ForeignKey(TGUser, related_name='comments', on_delete=models.DO_NOTHING, null=True)
