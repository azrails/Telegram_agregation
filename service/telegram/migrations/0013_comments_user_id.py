# Generated by Django 4.2.4 on 2023-08-26 14:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('telegram', '0012_alter_gptposts_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='comments',
            name='user_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='comments', to='telegram.tguser'),
        ),
    ]