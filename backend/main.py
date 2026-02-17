import os
import io
import json
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from .db import SessionLocal, engine, Base
from .models import Prediction
from . import predict as predictor
import shutil


# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Check if model exists on startup
@app.on_event("startup")
async def startup_event():
    import os
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts", "brain_model.h5")
    if not os.path.exists(model_path):
        print("\n" + "="*80)
        print("⚠️  WARNING: Model file not found!")
        print(f"Expected location: {model_path}")
        print("\nYou need to train the model first:")
        print("  1. Activate virtual environment: source myenv/bin/activate")
        print("  2. Run training: python model.py")
        print("="*80 + "\n")

# Basic CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get('/health')
def health():
    return {"status": "ok"}


@app.get('/metrics')
def metrics():
    m = predictor.get_saved_metrics()
    return m


@app.get('/metrics/plots')
def metrics_plots():
    m = predictor.get_saved_metrics()
    # return base64 images
    out = {
        "confusion_matrix_png_base64": m.get('confusion_matrix_png_base64'),
        "training_curves_png_base64": m.get('training_curves_png_base64')
    }
    return out


def _save_upload(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1] or '.png'
    filename = f"{os.urandom(8).hex()}{ext}"
    target = os.path.join(UPLOAD_DIR, filename)
    with open(target, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    return target


@app.post('/predict')
def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = file.file.read()
        # store file
        file.file.seek(0)
        saved_path = _save_upload(file)
        predicted_label, probabilities, predicted_index = predictor.predict_image(contents)
        # create DB entry
        p = Prediction(
            filename=file.filename,
            image_path=saved_path,
            predicted_label=predicted_label,
            probabilities_json=json.dumps(probabilities)
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        # recommendations
        recs = _get_recommendations()
        return JSONResponse({
            "id": p.id,
            "predicted_label": predicted_label,
            "probabilities": probabilities,
            "created_at": p.created_at.isoformat(),
            "recommendations": recs.get(predicted_label, {}),
        })
    except Exception as e:
        import traceback
        print("ERROR in /predict:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/history')
def history(db: Session = Depends(get_db)):
    rows = db.query(Prediction).order_by(Prediction.created_at.desc()).limit(50).all()
    out = []
    for r in rows:
        out.append({
            "id": r.id,
            "filename": r.filename,
            "predicted_label": r.predicted_label,
            "created_at": r.created_at.isoformat()
        })
    return out


@app.get('/history/{item_id}')
def history_item(item_id: str, db: Session = Depends(get_db)):
    r = db.query(Prediction).filter(Prediction.id == item_id).first()
    if not r:
        raise HTTPException(status_code=404, detail='Not found')
    # read image file and return base64
    img_b64 = None
    if r.image_path and os.path.exists(r.image_path):
        with open(r.image_path, 'rb') as f:
            img_b64 = base64.b64encode(f.read()).decode('utf-8')
    return {
        "id": r.id,
        "filename": r.filename,
        "predicted_label": r.predicted_label,
        "probabilities": json.loads(r.probabilities_json),
        "created_at": r.created_at.isoformat(),
        "image_base64": img_b64,
        "recommendations": _get_recommendations().get(r.predicted_label, {})
    }


def _get_recommendations():
    # EXACT structure required: four keys with title and 5 items
    return {
        "glioma": {
            "title": "Suspected Glioma - Suggested Next Steps",
            "items": [
                "Refer to a neuro-oncology specialist for further evaluation.",
                "Schedule MRI with contrast if not already performed.",
                "Consider expedited multidisciplinary tumor board review.",
                "Discuss possible biopsy or advanced imaging (MR spectroscopy, perfusion).",
                "Ensure neurologic exam and baseline cognitive assessment are recorded."
            ]
        },
        "meningioma": {
            "title": "Suspected Meningioma - Suggested Next Steps",
            "items": [
                "Consult with neurosurgery and review imaging for operability.",
                "Obtain contrast-enhanced MRI to assess dural attachment and edema.",
                "Discuss potential observation vs surgical resection depending on symptoms.",
                "Consider referral for radiosurgery evaluation if lesion is small and accessible.",
                "Document neurologic symptoms and coordinate follow-up imaging schedule."
            ]
        },
        "pituitary": {
            "title": "Suspected Pituitary Lesion - Suggested Next Steps",
            "items": [
                "Refer to endocrinology for hormonal assessment and baseline labs.",
                "Obtain dedicated pituitary MRI with thin cuts through the sella.",
                "Evaluate visual fields and ophthalmology assessment if mass effect suspected.",
                "Discuss multidisciplinary care (endocrinology + neurosurgery).",
                "Consider early follow-up imaging and hormone monitoring plan."
            ]
        },
        "notumor": {
            "title": "No Tumor Detected - Suggestions & Advice",
            "items": [
                "No tumor features identified on this scan; continue routine clinical follow-up.",
                "If symptoms persist or worsen, seek additional evaluation from your physician.",
                "Maintain healthy lifestyle measures and follow clinician guidance.",
                "Keep a record of any new neurological symptoms and report them promptly.",
                "This is an AI-based prediction and not a medical diagnosis. Consult a professional."
            ]
        }
    }
