"""
ML API Bridge — connects the trained Keras model to the backend
Run this AFTER training your model in the Jupyter notebooks.

Usage:
    pip install flask tensorflow pillow numpy
    python ml_api.py
"""

from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
import os

app = Flask(__name__)

# ── Load your trained model ──
MODEL_PATH  = r'D:\Files\AI X-Ray Detection\Models\EfficientNetB4_finetuned.keras'
CLASS_NAMES = ['normal', 'pneumonia', 'tuberculosis']

model = None

def load_model():
    global model
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print(f'✅ Model loaded from {MODEL_PATH}')
    except Exception as e:
        print(f'⚠️  Model not loaded: {e}')
        print('   API will return mock results')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({ 'status': 'ok', 'model_loaded': model is not None })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    image_path = data.get('image_path')

    if not image_path or not os.path.exists(image_path):
        return jsonify({ 'error': 'Image not found' }), 400

    if model is None:
        # Mock response when model isn't loaded
        return jsonify({
            'prediction': 'PNEUMONIA',
            'confidence': 87.3,
            'results': { 'normal': 0.127, 'pneumonia': 0.873 }
        })

    try:
        import tensorflow as tf
        img = Image.open(image_path).convert('RGB').resize((224, 224))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0).astype(np.float32)

        preds = model.predict(img_array, verbose=0)[0]
        pred_idx = int(np.argmax(preds))
        confidence = float(preds[pred_idx]) * 100

        results = { cls.lower(): float(preds[i]) for i, cls in enumerate(CLASS_NAMES) }

        return jsonify({
            'prediction': CLASS_NAMES[pred_idx],
            'confidence': round(confidence, 2),
            'results': results
        })

    except Exception as e:
        return jsonify({ 'error': str(e) }), 500

if __name__ == '__main__':
    load_model()
    print('🚀 ML API running on http://localhost:8000')
    app.run(port=8000, debug=False)
