import os
import json
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import psycopg2
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'dbname': os.getenv('DB_NAME', 'smtms'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
}

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'violation_predictor.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'model', 'scaler.pkl')


def get_db_connection():
    """Get a PostgreSQL database connection."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None


def fetch_vehicle_features():
    """Fetch vehicle features from the database for prediction."""
    conn = get_db_connection()
    if not conn:
        return pd.DataFrame()

    try:
        query = """
        SELECT
            v.id AS vehicle_id,
            v."registrationNumber",
            v."ownerName",
            v."maxLoadCapacity",
            v."hasBuiltInGPS",
            v."isGPSActive",
            COALESCE(trip_stats.total_trips, 0) AS total_trips,
            COALESCE(trip_stats.unauthorized_trips, 0) AS unauthorized_trips,
            COALESCE(trip_stats.avg_load, 0) AS avg_load,
            COALESCE(trip_stats.max_load, 0) AS max_load,
            COALESCE(trip_stats.trips_last_7_days, 0) AS trips_last_7_days,
            COALESCE(violation_stats.total_violations, 0) AS total_violations,
            COALESCE(violation_stats.critical_violations, 0) AS critical_violations,
            COALESCE(violation_stats.violations_last_30_days, 0) AS violations_last_30_days,
            COALESCE(violation_stats.gps_tampering_count, 0) AS gps_tampering_count,
            COALESCE(alert_stats.total_alerts, 0) AS total_alerts,
            COALESCE(alert_stats.unresolved_alerts, 0) AS unresolved_alerts
        FROM "Vehicles" v
        LEFT JOIN (
            SELECT
                "vehicleId",
                COUNT(*) AS total_trips,
                SUM(CASE WHEN "isAuthorized" = false THEN 1 ELSE 0 END) AS unauthorized_trips,
                AVG("loadWeight") AS avg_load,
                MAX("loadWeight") AS max_load,
                SUM(CASE WHEN "startTime" >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS trips_last_7_days
            FROM "Trips"
            GROUP BY "vehicleId"
        ) trip_stats ON v.id = trip_stats."vehicleId"
        LEFT JOIN (
            SELECT
                "vehicleId",
                COUNT(*) AS total_violations,
                SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) AS critical_violations,
                SUM(CASE WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS violations_last_30_days,
                SUM(CASE WHEN type = 'gps_tampering' THEN 1 ELSE 0 END) AS gps_tampering_count
            FROM "Violations"
            GROUP BY "vehicleId"
        ) violation_stats ON v.id = violation_stats."vehicleId"
        LEFT JOIN (
            SELECT
                "vehicleId",
                COUNT(*) AS total_alerts,
                SUM(CASE WHEN "isResolved" = false THEN 1 ELSE 0 END) AS unresolved_alerts
            FROM "Alerts"
            GROUP BY "vehicleId"
        ) alert_stats ON v.id = alert_stats."vehicleId"
        WHERE v.status = 'active'
        ORDER BY COALESCE(violation_stats.violations_last_30_days, 0) DESC
        """

        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        print(f"Query error: {e}")
        return pd.DataFrame()
    finally:
        conn.close()


def generate_synthetic_training_data(n_samples=1000):
    """Generate synthetic training data for the ML model."""
    np.random.seed(42)

    data = {
        'total_trips': np.random.randint(0, 200, n_samples),
        'unauthorized_trips': np.random.randint(0, 30, n_samples),
        'avg_load': np.random.uniform(5, 30, n_samples),
        'max_load': np.random.uniform(10, 40, n_samples),
        'trips_last_7_days': np.random.randint(0, 30, n_samples),
        'total_violations': np.random.randint(0, 20, n_samples),
        'critical_violations': np.random.randint(0, 10, n_samples),
        'violations_last_30_days': np.random.randint(0, 15, n_samples),
        'gps_tampering_count': np.random.randint(0, 5, n_samples),
        'total_alerts': np.random.randint(0, 25, n_samples),
        'unresolved_alerts': np.random.randint(0, 10, n_samples),
        'has_builtin_gps': np.random.choice([0, 1], n_samples),
        'is_gps_active': np.random.choice([0, 1], n_samples, p=[0.2, 0.8]),
        'max_load_capacity': np.random.uniform(10, 30, n_samples),
    }

    df = pd.DataFrame(data)

    # Create risk label based on feature combinations
    risk_score = (
        df['unauthorized_trips'] * 3 +
        df['critical_violations'] * 4 +
        df['violations_last_30_days'] * 2 +
        df['gps_tampering_count'] * 5 +
        df['unresolved_alerts'] * 1.5 +
        (1 - df['is_gps_active']) * 3 +
        (df['avg_load'] > df['max_load_capacity']).astype(int) * 3
    )

    # Classify: 0 = low risk, 1 = medium risk, 2 = high risk
    df['risk_label'] = pd.cut(risk_score, bins=[-1, 10, 30, 200], labels=[0, 1, 2]).astype(int)

    return df


def train_model():
    """Train the prediction model."""
    print("Training ML model...")

    df = generate_synthetic_training_data(2000)

    feature_cols = [
        'total_trips', 'unauthorized_trips', 'avg_load', 'max_load',
        'trips_last_7_days', 'total_violations', 'critical_violations',
        'violations_last_30_days', 'gps_tampering_count', 'total_alerts',
        'unresolved_alerts', 'has_builtin_gps', 'is_gps_active', 'max_load_capacity'
    ]

    X = df[feature_cols]
    y = df['risk_label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(X_train_scaled, y_train)

    accuracy = model.score(X_test_scaled, y_test)
    print(f"Model accuracy: {accuracy:.2%}")

    # Save model and scaler
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print("Model saved.")

    return model, scaler


def load_or_train_model():
    """Load existing model or train a new one."""
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            print("Model loaded from disk.")
            return model, scaler
        except Exception:
            pass
    return train_model()


# Load model on startup
model, scaler = load_or_train_model()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


@app.route('/predict', methods=['GET'])
def predict():
    """Predict risk levels for all active vehicles."""
    global model, scaler

    df = fetch_vehicle_features()

    if df.empty:
        # Return fallback predictions
        return jsonify({
            'predictions': [],
            'message': 'No vehicle data available for prediction',
        })

    feature_cols = [
        'total_trips', 'unauthorized_trips', 'avg_load', 'max_load',
        'trips_last_7_days', 'total_violations', 'critical_violations',
        'violations_last_30_days', 'gps_tampering_count', 'total_alerts',
        'unresolved_alerts', 'has_builtin_gps', 'is_gps_active', 'max_load_capacity'
    ]

    # Prepare features
    features_df = pd.DataFrame()
    features_df['total_trips'] = df['total_trips'].fillna(0)
    features_df['unauthorized_trips'] = df['unauthorized_trips'].fillna(0)
    features_df['avg_load'] = df['avg_load'].fillna(0)
    features_df['max_load'] = df['max_load'].fillna(0)
    features_df['trips_last_7_days'] = df['trips_last_7_days'].fillna(0)
    features_df['total_violations'] = df['total_violations'].fillna(0)
    features_df['critical_violations'] = df['critical_violations'].fillna(0)
    features_df['violations_last_30_days'] = df['violations_last_30_days'].fillna(0)
    features_df['gps_tampering_count'] = df['gps_tampering_count'].fillna(0)
    features_df['total_alerts'] = df['total_alerts'].fillna(0)
    features_df['unresolved_alerts'] = df['unresolved_alerts'].fillna(0)
    features_df['has_builtin_gps'] = df['hasBuiltInGPS'].astype(int).fillna(0)
    features_df['is_gps_active'] = df['isGPSActive'].astype(int).fillna(1)
    features_df['max_load_capacity'] = df['maxLoadCapacity'].fillna(20)

    try:
        X = features_df[feature_cols].values
        X_scaled = scaler.transform(X)
        risk_predictions = model.predict(X_scaled)
        risk_probabilities = model.predict_proba(X_scaled)
    except Exception as e:
        print(f"Prediction error: {e}")
        # Fallback: rule-based prediction
        risk_predictions = []
        for _, row in features_df.iterrows():
            score = row['violations_last_30_days'] * 2 + row['gps_tampering_count'] * 5 + row['unauthorized_trips'] * 3
            if score >= 10:
                risk_predictions.append(2)
            elif score >= 5:
                risk_predictions.append(1)
            else:
                risk_predictions.append(0)
        risk_probabilities = None

    risk_labels = {0: 'low', 1: 'medium', 2: 'high'}

    predictions = []
    for i, row in df.iterrows():
        risk_level = risk_labels.get(int(risk_predictions[i]), 'low')
        confidence = float(max(risk_probabilities[i])) if risk_probabilities is not None else 0.0

        predictions.append({
            'vehicleId': int(row['vehicle_id']),
            'registrationNumber': row['registrationNumber'],
            'ownerName': row['ownerName'],
            'riskLevel': risk_level,
            'confidence': round(confidence, 2),
            'violationCount': int(row['violations_last_30_days']),
            'totalViolations': int(row['total_violations']),
            'unauthorizedTrips': int(row['unauthorized_trips']),
            'gpsTamperingCount': int(row['gps_tampering_count']),
            'unresolvedAlerts': int(row['unresolved_alerts']),
            'prediction': get_prediction_text(risk_level, row),
        })

    # Sort by risk level (high first)
    predictions.sort(key=lambda x: {'high': 0, 'medium': 1, 'low': 2}.get(x['riskLevel'], 3))

    return jsonify({'predictions': predictions, 'source': 'ml_model'})


def get_prediction_text(risk_level, row):
    """Generate human-readable prediction text."""
    if risk_level == 'high':
        reasons = []
        if row['gps_tampering_count'] > 0:
            reasons.append(f"GPS tampering detected {int(row['gps_tampering_count'])} times")
        if row['unauthorized_trips'] > 0:
            reasons.append(f"{int(row['unauthorized_trips'])} unauthorized trips")
        if row['critical_violations'] > 0:
            reasons.append(f"{int(row['critical_violations'])} critical violations")
        return f"HIGH RISK: {'; '.join(reasons) if reasons else 'Multiple violation indicators detected'}"
    elif risk_level == 'medium':
        return f"MEDIUM RISK: {int(row['violations_last_30_days'])} violations in last 30 days. Monitoring recommended."
    else:
        return "LOW RISK: Normal operating pattern."


@app.route('/retrain', methods=['POST'])
def retrain():
    """Retrain the model with latest data."""
    global model, scaler
    model, scaler = train_model()
    return jsonify({'message': 'Model retrained successfully'})


if __name__ == '__main__':
    print("\n==========================================")
    print("  SMTMS ML Prediction API")
    print("  Port: 5001")
    print("  URL: http://localhost:5001")
    print("  Health: http://localhost:5001/health")
    print("  Predict: http://localhost:5001/predict")
    print("==========================================\n")
    app.run(host='0.0.0.0', port=5001, debug=True)
