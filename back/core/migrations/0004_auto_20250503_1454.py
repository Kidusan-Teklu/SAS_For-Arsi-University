# Generated by Django 3.1.12 on 2025-05-03 11:54

import bson.objectid
from django.db import migrations, models
import django.db.models.deletion
import djongo.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20250426_2329'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='attendance',
            name='id',
        ),
        migrations.RemoveField(
            model_name='employee',
            name='id',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='id',
        ),
        migrations.RemoveField(
            model_name='student',
            name='id',
        ),
        migrations.RemoveField(
            model_name='user',
            name='id',
        ),
        migrations.AddField(
            model_name='attendance',
            name='_id',
            field=djongo.models.fields.ObjectIdField(auto_created=True, default=bson.objectid.ObjectId, primary_key=True, serialize=False),
        ),
        migrations.AddField(
            model_name='employee',
            name='_id',
            field=djongo.models.fields.ObjectIdField(auto_created=True, default=bson.objectid.ObjectId, primary_key=True, serialize=False),
        ),
        migrations.AddField(
            model_name='notification',
            name='_id',
            field=djongo.models.fields.ObjectIdField(auto_created=True, default=bson.objectid.ObjectId, primary_key=True, serialize=False),
        ),
        migrations.AddField(
            model_name='student',
            name='_id',
            field=djongo.models.fields.ObjectIdField(auto_created=True, default=bson.objectid.ObjectId, primary_key=True, serialize=False),
        ),
        migrations.AddField(
            model_name='user',
            name='_id',
            field=djongo.models.fields.ObjectIdField(auto_created=True, default=bson.objectid.ObjectId, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='attendance',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_records', to='core.user'),
        ),
        migrations.AlterField(
            model_name='employee',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='employee_profile', to='core.user'),
        ),
        migrations.AlterField(
            model_name='notification',
            name='recipient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='core.user'),
        ),
        migrations.AlterField(
            model_name='student',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='student_profile', to='core.user'),
        ),
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('_id', djongo.models.fields.ObjectIdField(auto_created=True, default=bson.objectid.ObjectId, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('location', models.CharField(max_length=255)),
                ('instructor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedules', to='core.user')),
            ],
        ),
    ]
