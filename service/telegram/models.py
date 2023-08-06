from email import message
from operator import mod
from statistics import mode
from django.db import models
# from django.db.models.ImageField

class Groups(models.Model):
    GROUPS_CHOISES = [
        ('undef', ''),
        ('buisness', 'Бизнес'),
        ('finance', 'Финансы'),
        ('traveling', 'Путишествия')
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
    url = models.CharField(max_length=1000)
    type = models.CharField(choices=TYPE_CHOISES, default='telegram')

    def __str__(self) -> str:
        return self.url


class Projects(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=80)
    description = models.CharField(max_length=300, blank=True)
    update_time = models.TimeField()
    group_id = models.ForeignKey(Groups, related_name='projects', on_delete=models.SET_NULL, null=True)
    sourses = models.ManyToManyField(Sources, related_name='projects')

    def __str__(self) -> str:
        return self.title

class Promts(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=200, blank=True)
    promt_text = models.TextField()
    project_id = models.ForeignKey(Projects, related_name='promts', on_delete=models.CASCADE)

class GptPosts(models.Model):
    id = models.AutoField(primary_key=True)
    summary = models.TextField(blank=True)
    project_id = models.ForeignKey(Projects, related_name='gpt_posts', on_delete=models.CASCADE)
    promt_id = models.ForeignKey(Promts, related_name='gpt_posts', on_delete=models.CASCADE)

class Posts(models.Model):
    id = models.CharField(primary_key=True)
    post_text = models.TextField(blank=True)
    date = models.DateTimeField()
    source_id = models.ForeignKey(Sources, related_name='posts', on_delete=models.CASCADE)

class Comments(models.Model):
    id = models.CharField(primary_key=True)
    comment_text = models.TextField()
