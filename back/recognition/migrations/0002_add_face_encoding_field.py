from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recognition', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='recognition',
            name='face_encoding',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='recognition',
            name='confidence_score',
            field=models.FloatField(default=0.0),
        ),
    ] 