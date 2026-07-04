# Shared validation engine for Lost & Found report submissions.
#
# Both the lost and found report flows run the SAME validation pipeline
# (see engine.run_report_validation). The only behavioural difference is that a
# photo is optional for lost reports and mandatory for found reports.
#
# Design notes:
#   * Every AI-backed check is FAIL-OPEN — if a model errors or is unavailable
#     (e.g. torch not installed, CLIP download failed), the check is skipped
#     rather than blocking a legitimate submission.
#   * AI models are the SAME lazily-loaded singletons used by the matching
#     engine (matching.views), so we never load a second copy into memory.
default_app_config = 'validation.apps.ValidationConfig'
