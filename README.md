# Customer Churn Prediction Platform

An end-to-end Machine Learning web application that predicts customer churn, estimates churn probability, assigns customer risk levels, and stores prediction history for analysis.

## Overview

Customer churn occurs when customers stop using a company's products or services. This project uses Machine Learning to identify customers who may be at risk of leaving, helping businesses make more informed customer-retention decisions.

The platform combines a trained Machine Learning model with a FastAPI backend, React frontend, and PostgreSQL database.

## Features

- Customer churn prediction using Logistic Regression
- Churn probability and percentage estimation
- Low, Medium, and High customer risk classification
- Data preprocessing with missing-value imputation, one-hot encoding, and feature scaling
- Model evaluation using Accuracy, Precision, Recall, F1 Score, and ROC-AUC
- Classification report and confusion matrix
- Interactive frontend dashboard and visualizations
- PostgreSQL storage for customer information and prediction history
- REST API built with FastAPI
- Saved Machine Learning pipeline for model inference

## Tech Stack

**Machine Learning**
- Python
- Pandas
- Scikit-learn
- NumPy
- Joblib

**Backend**
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic

**Frontend**
- React.js
- Tailwind CSS
- JavaScript
- Axios (if used in the frontend)

**Tools**
- Git and GitHub
- VS Code
- Postman / FastAPI Swagger UI

## Machine Learning Workflow

1. Load and prepare the cleaned customer churn dataset.
2. Separate input features from the target variable.
3. Split the dataset into training and testing sets.
4. Handle missing values and preprocess categorical and numerical features.
5. Train a Logistic Regression classification model.
6. Evaluate performance on unseen test data.
7. Save the complete preprocessing and model pipeline.
8. Integrate the trained pipeline with the FastAPI backend.
9. Display predictions and history through the frontend.

## Model Evaluation

The model is evaluated using the following metrics:

| Metric | Purpose |
|---|---|
| Accuracy | Measures the proportion of correct predictions. |
| Precision | Measures how many predicted churn cases are actual churn cases. |
| Recall | Measures how many actual churn cases are identified. |
| F1 Score | Balances precision and recall. |
| ROC-AUC | Measures the model's ability to distinguish between churn and non-churn customers. |

**Actual evaluation results:** Add the scores produced by your model's evaluation script here.

- Accuracy: `Add actual value`
- Precision: `Add actual value`
- Recall: `Add actual value`
- F1 Score: `Add actual value`
- ROC-AUC: `Add actual value`

## Project Structure

The following is a suggested structure. Adjust the paths and filenames to match your