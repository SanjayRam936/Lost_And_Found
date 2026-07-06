from django.db import migrations, models


def mark_existing_verified(apps, schema_editor):
    """Existing accounts predate email verification — treat them as verified so
    they are never locked out by the new gate."""
    User = apps.get_model('user_accounts', 'User')
    User.objects.update(is_email_verified=True)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('user_accounts', '0002_alter_user_managers_remove_user_username_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_email_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='email_otp',
            field=models.CharField(blank=True, default='', max_length=6),
        ),
        migrations.AddField(
            model_name='user',
            name='email_otp_sent_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='email_otp_attempts',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.RunPython(mark_existing_verified, noop),
    ]
