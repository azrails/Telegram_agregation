# Generated by Django 4.2.4 on 2023-08-23 18:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('telegram', '0008_tguser_user_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tguser',
            name='user_id',
            field=models.CharField(blank=True, default='0', null=True),
        ),
    ]
