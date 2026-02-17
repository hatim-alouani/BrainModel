"""
Generate artifacts (metrics, graphs) from existing .h5 model file
Run this if you have brain_model.h5 but missing metrics/graphs
"""
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import os
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.metrics import (
    f1_score, classification_report, confusion_matrix, 
    roc_auc_score, roc_curve, auc, 
    precision_recall_curve, average_precision_score,
    precision_score, recall_score
)
from sklearn.preprocessing import label_binarize
import seaborn as sns


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


# Create artifacts directory
ARTIFACTS_DIR = "artifacts"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Check if model exists
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "brain_model.h5")
if not os.path.exists(MODEL_PATH):
    print(f"❌ Error: Model file not found at {MODEL_PATH}")
    print("Please ensure brain_model.h5 is in the artifacts/ directory")
    exit(1)

print(f"✅ Found model at {MODEL_PATH}")
print("Loading model...")

# Load the model with custom FocalLoss
model = tf.keras.models.load_model(MODEL_PATH, custom_objects={"FocalLoss": FocalLoss})
print("✅ Model loaded successfully")

# Create test data generator (same as training)
test_datagen = ImageDataGenerator(rescale=1./255)

test_generator = test_datagen.flow_from_directory(
    "data/Testing",
    target_size=(224, 224),
    batch_size=32,
    color_mode="grayscale",
    class_mode="categorical",
    shuffle=False
)

print(f"✅ Test data loaded: {test_generator.samples} samples")
print(f"Classes: {list(test_generator.class_indices.keys())}")

# Also load training data to get class indices
train_datagen = ImageDataGenerator(rescale=1./255)
train_generator = train_datagen.flow_from_directory(
    "data/Training",
    target_size=(224, 224),
    batch_size=32,
    color_mode="grayscale",
    class_mode="categorical",
    shuffle=False
)

# Save class indices
class_indices_path = os.path.join(ARTIFACTS_DIR, "class_indices.json")
with open(class_indices_path, 'w') as f:
    json.dump(train_generator.class_indices, f)
print(f"✅ Saved class indices to {class_indices_path}")

# Evaluate on test set
print("\nEvaluating model on test set...")
loss_test, accuracy_test = model.evaluate(test_generator, verbose=1)
print(f"Test loss: {loss_test}")
print(f"Test accuracy: {accuracy_test}")

# Get predictions
print("\nGenerating predictions...")
y_pred = model.predict(test_generator, verbose=1)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true = test_generator.classes

# Calculate metrics
print("\nCalculating metrics...")
f1 = f1_score(y_true, y_pred_classes, average='weighted')
print(f"F1 Score (weighted): {f1}")

class_report = classification_report(y_true, y_pred_classes, output_dict=True)
print("Classification Report:")
print(json.dumps(class_report, indent=2))

cm = confusion_matrix(y_true, y_pred_classes)
print("Confusion Matrix:")
print(cm)

# Prepare metrics dictionary
metrics = {
    "test_loss": float(loss_test),
    "test_accuracy": float(accuracy_test),
    "f1_weighted": float(f1),
    "labels": [None] * len(train_generator.class_indices)
}

# Invert class_indices to list labels by index
inv = {v: k for k, v in train_generator.class_indices.items()}
for i in range(len(inv)):
    metrics['labels'][i] = inv[i]

# Save metrics
metrics_path = os.path.join(ARTIFACTS_DIR, "metrics.json")
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=2)
print(f"\n✅ Saved metrics to {metrics_path}")

# Save classification report
classification_report_path = os.path.join(ARTIFACTS_DIR, "classification_report.json")
with open(classification_report_path, 'w') as f:
    json.dump(class_report, f, indent=2)
print(f"✅ Saved classification report to {classification_report_path}")

# Save confusion matrix (numpy)
cm_path = os.path.join(ARTIFACTS_DIR, "confusion_matrix.npy")
np.save(cm_path, cm)
print(f"✅ Saved confusion matrix to {cm_path}")

# Generate confusion matrix image
print("\nGenerating confusion matrix plot...")
cm_img_path = os.path.join(ARTIFACTS_DIR, "confusion_matrix.png")
plt.figure(figsize=(8, 6))
plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
plt.title('Confusion Matrix')
plt.colorbar()
tick_marks = np.arange(len(metrics['labels']))
plt.xticks(tick_marks, metrics['labels'], rotation=45)
plt.yticks(tick_marks, metrics['labels'])

# Add text annotations
thresh = cm.max() / 2.
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        plt.text(j, i, format(cm[i, j], 'd'),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black")

plt.ylabel('True label')
plt.xlabel('Predicted label')
plt.tight_layout()
plt.savefig(cm_img_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved confusion matrix image to {cm_img_path}")

# Create a placeholder training curves image (since we don't have training history)
print("\nGenerating placeholder training curves...")
tc_path = os.path.join(ARTIFACTS_DIR, "training_curves.png")
plt.figure(figsize=(10, 6))
plt.text(0.5, 0.5, 'Training curves not available\n(Model was pre-trained)', 
         ha='center', va='center', fontsize=16, transform=plt.gca().transAxes)
plt.title('Training Curves')
plt.axis('off')
plt.tight_layout()
plt.savefig(tc_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved placeholder training curves to {tc_path}")

# ========== NEW ADVANCED VISUALIZATIONS ==========

print("\n" + "="*60)
print("📊 Generating Advanced Performance Visualizations...")
print("="*60)

n_classes = len(inv)
y_true_b = label_binarize(y_true, classes=list(range(n_classes)))
y_score = y_pred

# 1. ROC Curves (One vs Rest)
print("\n1️⃣  Generating ROC curves...")
roc_fig_path = os.path.join(ARTIFACTS_DIR, "roc_curves.png")
plt.figure(figsize=(10, 8))
colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']

for i in range(n_classes):
    try:
        fpr, tpr, _ = roc_curve(y_true_b[:, i], y_score[:, i])
        roc_auc_val = auc(fpr, tpr)
        plt.plot(fpr, tpr, color=colors[i % len(colors)], lw=2,
                label=f'{inv[i]} (AUC = {roc_auc_val:.3f})')
    except Exception as e:
        print(f"  ⚠️  Could not plot ROC for {inv[i]}: {e}")

plt.plot([0, 1], [0, 1], 'k--', lw=2, label='Random (AUC = 0.500)')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate', fontsize=12)
plt.ylabel('True Positive Rate', fontsize=12)
plt.title('ROC Curves - Multi-Class Classification', fontsize=14, fontweight='bold')
plt.legend(loc="lower right", fontsize=10)
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(roc_fig_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved ROC curves to {roc_fig_path}")

# 2. Precision-Recall Curves
print("\n2️⃣  Generating Precision-Recall curves...")
pr_fig_path = os.path.join(ARTIFACTS_DIR, "precision_recall_curves.png")
plt.figure(figsize=(10, 8))

for i in range(n_classes):
    try:
        precision, recall, _ = precision_recall_curve(y_true_b[:, i], y_score[:, i])
        avg_precision = average_precision_score(y_true_b[:, i], y_score[:, i])
        plt.plot(recall, precision, color=colors[i % len(colors)], lw=2,
                label=f'{inv[i]} (AP = {avg_precision:.3f})')
    except Exception as e:
        print(f"  ⚠️  Could not plot PR for {inv[i]}: {e}")

plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('Recall', fontsize=12)
plt.ylabel('Precision', fontsize=12)
plt.title('Precision-Recall Curves', fontsize=14, fontweight='bold')
plt.legend(loc="lower left", fontsize=10)
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(pr_fig_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved Precision-Recall curves to {pr_fig_path}")

# 3. Per-Class Performance Metrics Bar Chart
print("\n3️⃣  Generating per-class performance chart...")
perf_fig_path = os.path.join(ARTIFACTS_DIR, "per_class_performance.png")

# Extract per-class metrics
class_names = [inv[i] for i in range(n_classes)]
precisions = []
recalls = []
f1_scores = []

for i, class_name in enumerate(class_names):
    if str(i) in class_report:
        precisions.append(class_report[str(i)]['precision'])
        recalls.append(class_report[str(i)]['recall'])
        f1_scores.append(class_report[str(i)]['f1-score'])
    elif class_name in class_report:
        precisions.append(class_report[class_name]['precision'])
        recalls.append(class_report[class_name]['recall'])
        f1_scores.append(class_report[class_name]['f1-score'])
    else:
        precisions.append(0)
        recalls.append(0)
        f1_scores.append(0)

x = np.arange(len(class_names))
width = 0.25

fig, ax = plt.subplots(figsize=(12, 6))
bars1 = ax.bar(x - width, precisions, width, label='Precision', color='#3498db')
bars2 = ax.bar(x, recalls, width, label='Recall', color='#2ecc71')
bars3 = ax.bar(x + width, f1_scores, width, label='F1-Score', color='#e74c3c')

ax.set_xlabel('Class', fontsize=12)
ax.set_ylabel('Score', fontsize=12)
ax.set_title('Per-Class Performance Metrics', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(class_names, rotation=15, ha='right')
ax.legend(fontsize=10)
ax.set_ylim([0, 1.1])
ax.grid(axis='y', alpha=0.3)

# Add value labels on bars
for bars in [bars1, bars2, bars3]:
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.3f}', ha='center', va='bottom', fontsize=8)

plt.tight_layout()
plt.savefig(perf_fig_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved per-class performance to {perf_fig_path}")

# 4. Normalized Confusion Matrix
print("\n4️⃣  Generating normalized confusion matrix...")
cm_norm_path = os.path.join(ARTIFACTS_DIR, "confusion_matrix_normalized.png")
cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(cm_normalized, annot=True, fmt='.2%', cmap='Blues', 
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={'label': 'Percentage'}, ax=ax)
plt.title('Normalized Confusion Matrix (%)', fontsize=14, fontweight='bold')
plt.ylabel('True Label', fontsize=12)
plt.xlabel('Predicted Label', fontsize=12)
plt.tight_layout()
plt.savefig(cm_norm_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved normalized confusion matrix to {cm_norm_path}")

# 5. Class Distribution Plot
print("\n5️⃣  Generating class distribution chart...")
dist_fig_path = os.path.join(ARTIFACTS_DIR, "class_distribution.png")

# Count samples per class
unique, counts = np.unique(y_true, return_counts=True)
class_counts = dict(zip(unique, counts))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Bar chart
class_labels = [inv[i] for i in sorted(class_counts.keys())]
class_values = [class_counts[i] for i in sorted(class_counts.keys())]
bars = ax1.bar(class_labels, class_values, color=colors[:len(class_labels)])
ax1.set_xlabel('Class', fontsize=12)
ax1.set_ylabel('Number of Samples', fontsize=12)
ax1.set_title('Test Set Class Distribution', fontsize=12, fontweight='bold')
ax1.tick_params(axis='x', rotation=15)

# Add count labels
for bar in bars:
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height,
            f'{int(height)}', ha='center', va='bottom', fontsize=10)

# Pie chart
ax2.pie(class_values, labels=class_labels, autopct='%1.1f%%',
        colors=colors[:len(class_labels)], startangle=90)
ax2.set_title('Class Distribution (%)', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.savefig(dist_fig_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved class distribution to {dist_fig_path}")

# 6. Model Performance Summary Dashboard
print("\n6️⃣  Generating performance summary dashboard...")
summary_fig_path = os.path.join(ARTIFACTS_DIR, "performance_summary.png")

fig = plt.figure(figsize=(16, 10))
gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)

# Overall Metrics (top left)
ax1 = fig.add_subplot(gs[0, :])
ax1.axis('off')
summary_text = f"""
MODEL PERFORMANCE SUMMARY
{'='*80}

Overall Accuracy:  {accuracy_test:.4f} ({accuracy_test*100:.2f}%)
Overall Loss:      {loss_test:.4f}
Weighted F1-Score: {f1:.4f}

Total Test Samples: {len(y_true)}
Number of Classes:  {n_classes}
Classes: {', '.join(class_names)}
"""
ax1.text(0.1, 0.5, summary_text, fontsize=11, family='monospace',
         verticalalignment='center', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3))

# Mini confusion matrix (middle left)
ax2 = fig.add_subplot(gs[1, 0])
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
            xticklabels=class_names, yticklabels=class_names, ax=ax2)
ax2.set_title('Confusion Matrix', fontsize=10, fontweight='bold')
ax2.set_xlabel('Predicted', fontsize=9)
ax2.set_ylabel('True', fontsize=9)
ax2.tick_params(labelsize=8)

# Per-class metrics table (middle center & right)
ax3 = fig.add_subplot(gs[1, 1:])
ax3.axis('tight')
ax3.axis('off')

table_data = [['Class', 'Precision', 'Recall', 'F1-Score', 'Support']]
for i, class_name in enumerate(class_names):
    key = str(i) if str(i) in class_report else class_name
    if key in class_report:
        row = [
            class_name,
            f"{class_report[key]['precision']:.3f}",
            f"{class_report[key]['recall']:.3f}",
            f"{class_report[key]['f1-score']:.3f}",
            f"{int(class_report[key]['support'])}"
        ]
        table_data.append(row)

table = ax3.table(cellText=table_data, cellLoc='center', loc='center',
                 colWidths=[0.25, 0.15, 0.15, 0.15, 0.15])
table.auto_set_font_size(False)
table.set_fontsize(9)
table.scale(1, 2)

# Style header row
for i in range(5):
    table[(0, i)].set_facecolor('#3498db')
    table[(0, i)].set_text_props(weight='bold', color='white')

ax3.set_title('Detailed Per-Class Metrics', fontsize=10, fontweight='bold', pad=20)

# Performance bars (bottom)
ax4 = fig.add_subplot(gs[2, :])
x_pos = np.arange(len(class_names))
width = 0.25
bars1 = ax4.bar(x_pos - width, precisions, width, label='Precision', alpha=0.8, color='#3498db')
bars2 = ax4.bar(x_pos, recalls, width, label='Recall', alpha=0.8, color='#2ecc71')
bars3 = ax4.bar(x_pos + width, f1_scores, width, label='F1-Score', alpha=0.8, color='#e74c3c')

ax4.set_xlabel('Class', fontsize=10)
ax4.set_ylabel('Score', fontsize=10)
ax4.set_title('Visual Performance Comparison', fontsize=10, fontweight='bold')
ax4.set_xticks(x_pos)
ax4.set_xticklabels(class_names, rotation=15, ha='right')
ax4.legend(loc='lower right', fontsize=9)
ax4.set_ylim([0, 1.1])
ax4.grid(axis='y', alpha=0.3)
ax4.axhline(y=1.0, color='gray', linestyle='--', alpha=0.5)

plt.savefig(summary_fig_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"✅ Saved performance summary to {summary_fig_path}")

# 7. Save additional metrics to JSON
print("\n7️⃣  Saving additional metrics...")
additional_metrics = {
    "per_class_precision": {inv[i]: float(precisions[i]) for i in range(n_classes)},
    "per_class_recall": {inv[i]: float(recalls[i]) for i in range(n_classes)},
    "per_class_f1": {inv[i]: float(f1_scores[i]) for i in range(n_classes)},
    "macro_precision": float(precision_score(y_true, y_pred_classes, average='macro')),
    "macro_recall": float(recall_score(y_true, y_pred_classes, average='macro')),
    "macro_f1": float(f1_score(y_true, y_pred_classes, average='macro')),
    "class_distribution": {inv[k]: int(v) for k, v in class_counts.items()},
    "total_samples": int(len(y_true)),
    "n_classes": n_classes
}

metrics.update(additional_metrics)
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=2)
print(f"✅ Updated metrics.json with additional metrics")

print("\n" + "="*60)
print("\n" + "="*60)
print("✅ All artifacts generated successfully!")
print("="*60)
print(f"\nGenerated files in {ARTIFACTS_DIR}/:")
print("  - brain_model.h5 (existing)")
print("  - class_indices.json")
print("  - metrics.json (with extended metrics)")
print("  - classification_report.json")
print("  - confusion_matrix.npy")
print("\n📊 Visualizations:")
print("  - confusion_matrix.png (original)")
print("  - confusion_matrix_normalized.png (percentage)")
print("  - roc_curves.png (ROC curves for all classes)")
print("  - precision_recall_curves.png")
print("  - per_class_performance.png (bar chart)")
print("  - class_distribution.png (bar + pie chart)")
print("  - performance_summary.png (comprehensive dashboard)")
print("  - training_curves.png (placeholder)")
print("\n✅ You can now start the backend: ./run_backend.sh")
print("\n💡 Tip: Check the performance_summary.png for a complete overview!")

