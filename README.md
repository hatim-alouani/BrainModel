# Brain Prediction Tumor

AI-powered MRI brain tumor classification with FastAPI backend and Next.js frontend.

## Setup

### 1. Install Python Dependencies
```bash
make
```

This creates a virtual environment and installs all required packages.

### 2. Train the Model (First Time)
```bash
source myenv/bin/activate
python model.py
```

This will:
- Train the model on your dataset
- Save `artifacts/brain_model.h5`
- Generate metrics, confusion matrix, and training curves

## Running the Application

### Backend (FastAPI)
```bash
# Option 1: Use the helper script
chmod +x run_backend.sh
./run_backend.sh

# Option 2: Manual command
source myenv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000

**Endpoints:**
- `GET /health` - Health check
- `GET /metrics` - Model evaluation metrics
- `GET /metrics/plots` - Confusion matrix and training curves (base64)
- `POST /predict` - Upload image for prediction
- `GET /history` - List prediction history
- `GET /history/{id}` - Get specific prediction details

**Database:** SQLite file at `backend/predictions.db` (created automatically)

### Frontend (Next.js)
```bash
cd frontend

# First time only: copy background image
mkdir -p public
cp ../brain.png public/brain.png

# Install dependencies (if not done)
npm install

# Run development server
npm run dev
```

The frontend will be available at: http://localhost:3000

**Pages:**
- `/` - Landing page with project description
- `/app` - Main application with upload, prediction, and history
- `/statistics` - Comprehensive statistics dashboard with all visualizations

## Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Architecture

- **Training**: `model.py` - TensorFlow/Keras model with residual blocks, focal loss, class weights
- **Backend**: FastAPI with SQLite database for prediction history
- **Frontend**: Next.js (App Router) with Tailwind CSS
- **Storage**: Uploaded images saved to `backend/uploads/`

## Predictions

The model classifies MRI scans into 4 categories:
- Glioma
- Meningioma
- Pituitary tumor
- No tumor

Each prediction includes:
- Predicted class
- Probability distribution
- Medical recommendations (5 actionable items per class)
- Prediction history tracking

## Notes

- Ensure `data/Training` and `data/Testing` directories exist with your dataset
- Model must be trained before running the backend
- SQLite database is file-based and created automatically
- CORS is enabled for development (adjust for production)
