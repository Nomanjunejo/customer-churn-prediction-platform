
from pathlib import Path

import joblib
import pandas as pd
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine, get_db
from backend.models import Customer, Prediction

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "churn_pipeline.joblib"

# Load trained model
model = joblib.load(MODEL_PATH)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Customer Churn Prediction API",
    description="Predict churn and save results to Neon PostgreSQL.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomerData(BaseModel):
    gender: str
    SeniorCitizen: int = Field(ge=0, le=1)
    Partner: str
    Dependents: str
    tenure: int = Field(ge=0)
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str
    MonthlyCharges: float = Field(ge=0)
    TotalCharges: float = Field(ge=0)


@app.get("/")
def home():
    return {"message": "Customer Churn Prediction API is running!"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/predict")
def predict_churn(
    customer: CustomerData,
    db: Session = Depends(get_db),
):
    try:
        # Convert input into the format expected by the model
        customer_df = pd.DataFrame([customer.model_dump()])

        probability = float(model.predict_proba(customer_df)[0][1])
        prediction = probability >= 0.50

        if probability < 0.30:
            risk_level = "Low"
        elif probability < 0.60:
            risk_level = "Medium"
        else:
            risk_level = "High"

        # Save basic customer information
        db_customer = Customer(
            gender=customer.gender,
            tenure=customer.tenure,
            contract=customer.Contract,
            monthly_charges=customer.MonthlyCharges,
        )
        db.add(db_customer)
        db.flush()  # Obtain the generated customer ID

        # Save the model's prediction
        db_prediction = Prediction(
            customer_id=db_customer.id,
            churn_prediction=prediction,
            churn_probability=probability,
            risk_level=risk_level,
        )
        db.add(db_prediction)

        db.commit()
        db.refresh(db_customer)
        db.refresh(db_prediction)

        return {
            "customer_id": db_customer.id,
            "prediction_id": db_prediction.id,
            "churn_prediction": "Yes" if prediction else "No",
            "churn_probability": round(probability, 4),
            "churn_percentage": round(probability * 100, 2),
            "risk_level": risk_level,
            "saved_to_database": True,
        }

    except Exception as error:
        db.rollback()
        print(f"Prediction/database error: {error}")
        raise HTTPException(
            status_code=500,
            detail="Prediction could not be completed or saved.",
        )



@app.get("/predictions")
def get_predictions(
    db: Session = Depends(get_db),
):
    try:
        records = (
            db.query(Prediction)
            .join(Customer)
            .order_by(Prediction.created_at.desc())
            .limit(100)
            .all()
        )

        return [
            {
                "prediction_id": record.id,
                "customer_id": record.customer_id,
                "gender": record.customer.gender,
                "tenure": record.customer.tenure,
                "contract": record.customer.contract,
                "monthly_charges": record.customer.monthly_charges,
                "churn_prediction": (
                    "Yes" if record.churn_prediction else "No"
                ),
                "churn_probability": round(
                    record.churn_probability, 4
                ),
                "risk_level": record.risk_level,
                "created_at": record.created_at.isoformat(),
            }
            for record in records
        ]

    except Exception as error:
        print(f"Prediction history error: {error}")
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve prediction history.",
        )
