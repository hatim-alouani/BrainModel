import io
import os
import json
import base64
from uuid import uuid4
from PIL import Image
import numpy as np
import tensorflow as tf


class FocalLoss(tf.keras.losses.Loss):
    def __init__(self, gamma=2., alpha=0.25, **kwargs):
        super(FocalLoss, self).__init__(**kwargs)
        self.gamma = gamma
        self.alpha = alpha

    def call(self, y_true, y_pred):
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)
        cross_entropy = -y_true * tf.math.log(y_pred)
        weight = self.alpha * tf.math.pow(1 - y_pred, self.gamma)
        return tf.reduce_sum(weight * cross_entropy, axis=1)


ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "brain_model.h5")
CLASS_INDICES_PATH = os.path.join(ARTIFACTS_DIR, "class_indices.json")
METRICS_PATH = os.path.join(ARTIFACTS_DIR, "metrics.json")
CM_PATH = os.path.join(ARTIFACTS_DIR, "confusion_matrix.npy")

# All visualization images
VISUALIZATION_IMAGES = {
    "confusion_matrix": os.path.join(ARTIFACTS_DIR, "confusion_matrix.png"),
    "confusion_matrix_normalized": os.path.join(ARTIFACTS_DIR, "confusion_matrix_normalized.png"),
    "training_curves": os.path.join(ARTIFACTS_DIR, "training_curves.png"),
    "roc_curves": os.path.join(ARTIFACTS_DIR, "roc_curves.png"),
    "precision_recall_curves": os.path.join(ARTIFACTS_DIR, "precision_recall_curves.png"),
    "per_class_performance": os.path.join(ARTIFACTS_DIR, "per_class_performance.png"),
    "class_distribution": os.path.join(ARTIFACTS_DIR, "class_distribution.png"),
    "performance_summary": os.path.join(ARTIFACTS_DIR, "performance_summary.png"),
}


# Load model singleton
_model = None
_labels = None


def _ensure_loaded():
    global _model, _labels
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        _model = tf.keras.models.load_model(MODEL_PATH, custom_objects={"FocalLoss": FocalLoss})
    if _labels is None:
        if os.path.exists(CLASS_INDICES_PATH):
            with open(CLASS_INDICES_PATH, 'r') as f:
                class_indices = json.load(f)
            # invert mapping
            _labels = {v: k for k, v in class_indices.items()}
        else:
            _labels = {}


def _preprocess_image_bytes(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('L')  # grayscale
    img = img.resize((224, 224))
    arr = np.asarray(img).astype('float32') / 255.0
    arr = arr.reshape((1, 224, 224, 1))
    return arr


def predict_image(image_bytes):
    """Returns (predicted_label, probabilities_dict, predicted_index)"""
    _ensure_loaded()
    x = _preprocess_image_bytes(image_bytes)
    preds = _model.predict(x)
    preds = preds[0].tolist()
    # map indices to labels
    labels = [None] * len(preds)
    for i in range(len(preds)):
        labels[i] = _labels.get(i, str(i))
    prob_dict = {labels[i]: float(preds[i]) for i in range(len(preds))}
    predicted_index = int(np.argmax(preds))
    predicted_label = labels[predicted_index]
    return predicted_label, prob_dict, predicted_index


def get_saved_metrics():
    out = {}
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, 'r') as f:
            out.update(json.load(f))
    # classification report
    cr_path = os.path.join(ARTIFACTS_DIR, "classification_report.json")
    if os.path.exists(cr_path):
        with open(cr_path, 'r') as f:
            out['classification_report'] = json.load(f)
    # confusion matrix
    if os.path.exists(CM_PATH):
        out['confusion_matrix'] = np.load(CM_PATH).tolist()
    
    # Load all visualization images as base64
    for key, img_path in VISUALIZATION_IMAGES.items():
        if os.path.exists(img_path):
            with open(img_path, 'rb') as f:
                out[f'{key}_base64'] = base64.b64encode(f.read()).decode('utf-8')
    
    return out


if __name__ == '__main__':
    print('Test predict module load...')
    try:
        _ensure_loaded()
        print('Model loaded OK')
    except Exception as e:
        print('Model load failed:', e)
