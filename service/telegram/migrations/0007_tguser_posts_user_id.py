# Generated by Django 4.2.4 on 2023-08-23 16:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('telegram', '0006_comments_source_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='TGUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(blank=True, default='Аноним', null=True)),
            ],
        ),
        migrations.AddField(
            model_name='posts',
            name='user_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='posts', to='telegram.tguser'),
        ),
    ]
