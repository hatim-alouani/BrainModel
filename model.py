import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, BatchNormalization, Dense, Dropout, GlobalAveragePooling2D, Input, Add, Activation
from tensorflow.keras.regularizers import l2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import f1_score, classification_report, confusion_matrix

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

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.7, 1.3],
    shear_range=0.1,
    fill_mode='nearest',
    validation_split=0.2,
    preprocessing_function=lambda x: tf.image.random_contrast(x, 0.8, 1.2)
)

test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    "data/Training",
    target_size=(224, 224),
    batch_size=32,
    color_mode="grayscale",
    class_mode="categorical",
    subset="training"
)

val_generator = train_datagen.flow_from_directory(
    "data/Training",
    target_size=(224, 224),
    batch_size=32,
    color_mode="grayscale",
    class_mode="categorical",
    subset="validation"
)

test_generator = test_datagen.flow_from_directory(
    "data/Testing",
    target_size=(224, 224),
    batch_size=32,
    color_mode="grayscale",
    class_mode="categorical",
    shuffle=False
)

def residual_block(x, filters, kernel_size=3, reg=5e-4):
    shortcut = x
    out = Conv2D(filters, kernel_size, padding="same", activation="relu", kernel_regularizer=l2(reg))(x)
    out = BatchNormalization()(out)
    out = Conv2D(filters, kernel_size, padding="same", kernel_regularizer=l2(reg))(out)
    out = BatchNormalization()(out)
    if shortcut.shape[-1] != filters:
        shortcut = Conv2D(filters, kernel_size=1, padding="same", kernel_regularizer=l2(reg))(shortcut)
    out = Add()([out, shortcut])
    out = Activation("relu")(out)
    return out

def build_model():
    inputs = Input(shape=(224,224,1))
    x = Conv2D(32, 3, padding='same', activation='relu', kernel_regularizer=l2(5e-4))(inputs)
    x = BatchNormalization()(x)
    x = residual_block(x, 32)
    x = MaxPooling2D(2)(x)
    x = Dropout(0.35)(x)

    x = Conv2D(64, 3, padding='same', activation='relu', kernel_regularizer=l2(5e-4))(x)
    x = BatchNormalization()(x)
    x = residual_block(x, 64)
    x = MaxPooling2D(2)(x)
    x = Dropout(0.35)(x)

    x = Conv2D(128, 3, padding='same', activation='relu', kernel_regularizer=l2(5e-4))(x)
    x = BatchNormalization()(x)
    x = residual_block(x, 128)
    x = MaxPooling2D(2)(x)
    x = Dropout(0.35)(x)

    x = Conv2D(256, 3, padding='same', activation='relu', kernel_regularizer=l2(5e-4))(x)
    x = BatchNormalization()(x)
    x = residual_block(x, 256)
    x = MaxPooling2D(2)(x)
    x = Dropout(0.35)(x)

    x = Conv2D(256, 3, padding='same', activation='relu', kernel_regularizer=l2(1e-4))(x)
    x = BatchNormalization()(x)
    x = residual_block(x, 256)
    x = MaxPooling2D(2)(x)
    x = Dropout(0.35)(x)

    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu', kernel_regularizer=l2(5e-4))(x)
    x = Dropout(0.5)(x)
    outputs = Dense(train_generator.num_classes, activation='softmax')(x)
    return Model(inputs, outputs)

model = build_model()
model.compile(optimizer='adam', loss=FocalLoss(), metrics=['accuracy'])

early_stop = EarlyStopping(patience=5, restore_best_weights=True)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6, verbose=1)

classes = np.unique(train_generator.classes)
class_weights = compute_class_weight('balanced', classes=classes, y=train_generator.classes)
class_weights = dict(zip(classes, class_weights))

model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=30,
    callbacks=[early_stop, reduce_lr],
    class_weight=class_weights,
    verbose=1
)


loss_test, accuracy_test = model.evaluate(test_generator, verbose=0)
print("Test loss:", loss_test)
print("Test accuracy:", accuracy_test)

x_sample, y_sample = test_generator[1] 
prediction = model.predict(x_sample[:1])
prediction_class = np.argmax(prediction, axis=1)[0]
true_class = np.argmax(y_sample[:1], axis=1)[0]

print("Predicted class:", prediction_class)
print("True class:", true_class)
print("Prediction probabilities:", prediction)


y_pred = model.predict(test_generator)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true = test_generator.classes

f1 = f1_score(y_true, y_pred_classes, average='weighted')
print("F1 Score:", f1)
print("Classification Report:\n", classification_report(y_true, y_pred_classes))
print("Confusion Matrix:\n", confusion_matrix(y_true, y_pred_classes))