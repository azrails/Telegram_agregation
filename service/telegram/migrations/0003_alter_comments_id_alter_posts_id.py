# Generated by Django 4.2.4 on 2023-08-05 22:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('telegram', '0002_alter_comments_id_alter_posts_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comments',
            name='id',
            field=models.CharField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='posts',
            name='id',
            field=models.CharField(primary_key=True, serialize=False),
        ),
    ]
