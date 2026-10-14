
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    gender: Mapped[str] = mapped_column(String(20))
    tenure: Mapped[int] = mapped_column(Integer)
    contract: Mapped[str] = mapped_column(String(50))
    monthly_charges: Mapped[float] = mapped_column(Float)

    predictions = relationship(
        "Prediction",
        back_populates="customer",
        cascade="all, delete-orphan",
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"), nullable=False
    )
    churn_prediction: Mapped[bool] = mapped_column(Boolean)
    churn_probability: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    customer = relationship(
        "Customer",
        back_populates="predictions",
    )
