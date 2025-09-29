import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image

model = tf.keras.models.load_model("Brain_model.h5", compile=False)

img_path = "BrainData/Testing/pituitary/image(8).jpg"

img = image.load_img(img_path, target_size=(224, 224), color_mode="grayscale")
img_array = image.img_to_array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

pred = model.predict(img_array)
predicted_class = np.argmax(pred, axis=1)[0]
print("Predicted class:", predicted_class)
