from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_accounts', '0003_email_verification'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='upi_id',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
