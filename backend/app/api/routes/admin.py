
"""Admin-only API endpoints for AGROVERSE AI."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.models.farm import Farm

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """Return statistics visible only to admins."""

    total_users = db.query(User).count()
    total_farms = db.query(Farm).count()
    active_users = db.query(User).filter(
        User.is_active.is_(True)
    ).count()

    return {
        "total_users": total_users,
        "total_farms": total_farms,
        "active_accounts": active_users,
    }
