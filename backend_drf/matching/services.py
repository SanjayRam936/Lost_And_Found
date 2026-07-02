"""
Backwards-compatibility shim.

The matching engine now lives in matching/views.py. Other apps (found_items,
lost_items) import the pipeline entry points from here, so we simply re-export
them to avoid touching those call sites.
"""
from .views import (  # noqa: F401
    run_matching_for_found,
    run_matching_for_lost,
    compute_confidence,
    get_match_status,
)
