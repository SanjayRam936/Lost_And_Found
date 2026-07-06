from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rewards', '0002_reward_cf_order_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='reward',
            name='otp',
            field=models.CharField(blank=True, default='', max_length=6),
        ),
        migrations.AddField(
            model_name='reward',
            name='otp_attempts',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
