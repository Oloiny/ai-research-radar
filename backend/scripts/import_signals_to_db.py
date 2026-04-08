"""Import workspace/signals.json → raw_signals table.

Handles:
- Auto-creating data_source records for unknown sources
- Deduplication by URL
- Date parsing
"""
import sys
import os
import json
import hashlib
from datetime import datetime, date

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.exc import IntegrityError
from database import SessionLocal
from models.source import DataSource
from models.signal import RawSignal


def get_or_create_source(db, source_name: str) -> str:
    """Find existing data_source by name, or create one."""
    src = db.query(DataSource).filter(DataSource.name == source_name).first()
    if src:
        return src.id

    # Auto-create with sensible defaults
    new_src = DataSource(
        name=source_name,
        type="rss",
        url=f"auto-created-for-{source_name}",
        category="ai_research",
        is_active=True,
        fetch_interval_hours=12,
    )
    db.add(new_src)
    db.flush()
    print(f"  + Auto-created source: {source_name}")
    return new_src.id


def import_signals(signals_path: str = None):
    if signals_path is None:
        signals_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "workspace", "signals.json"
        )

    with open(signals_path, "r", encoding="utf-8") as f:
        signals = json.load(f)

    db = SessionLocal()
    try:
        # Cache source name → id
        source_cache = {}
        imported = 0
        skipped = 0

        for sig in signals:
            source_name = sig.get("source", "unknown")
            url = sig.get("url", "")
            if not url:
                skipped += 1
                continue

            # Get or create source
            if source_name not in source_cache:
                source_cache[source_name] = get_or_create_source(db, source_name)
            source_id = source_cache[source_name]

            # external_id = hash of URL (consistent with existing collectors)
            external_id = hashlib.sha256(url.encode()).hexdigest()[:32]

            # Parse date
            published_at = None
            date_str = sig.get("date")
            if date_str:
                try:
                    published_at = datetime.fromisoformat(date_str)
                except (ValueError, TypeError):
                    pass

            raw_signal = RawSignal(
                source_id=source_id,
                external_id=external_id,
                title=sig.get("title", "Untitled"),
                summary=sig.get("summary", "")[:1000] if sig.get("summary") else None,
                url=url,
                published_at=published_at,
            )

            try:
                db.add(raw_signal)
                db.flush()
                imported += 1
            except IntegrityError:
                db.rollback()
                skipped += 1
                # Re-build source cache after rollback
                source_cache = {}

        db.commit()
        print(f"\nImported {imported} signals, skipped {skipped} duplicates.")
    finally:
        db.close()


if __name__ == "__main__":
    import_signals()
