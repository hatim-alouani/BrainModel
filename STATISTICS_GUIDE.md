# 📊 Statistics Page Guide

## Overview

The **Statistics Page** (`/statistics`) provides a comprehensive, interactive dashboard for analyzing your brain tumor classification model's performance. It features 6 tabs with different visualizations and metrics.

## 🎯 Features

### 1. **Overview Tab**
- **Key Metrics Cards**: Accuracy, Loss, F1 Scores, Sample Count
- **Performance Summary Dashboard**: All-in-one visualization with:
  - Overall metrics summary
  - Mini confusion matrix
  - Per-class metrics table
  - Visual performance bars

### 2. **Performance Tab**
- **Per-Class Performance Bar Chart**: Side-by-side comparison of Precision, Recall, and F1-Score
- **Detailed Metrics Table**: Interactive table with:
  - Precision, Recall, F1-Score for each class
  - Sample counts per class
  - Color-coded badges for easy reading

### 3. **Confusion Matrix Tab**
- **Original Confusion Matrix**: Shows actual prediction counts
- **Normalized Confusion Matrix**: Shows percentages for better comparison
- Side-by-side view for easy comparison

### 4. **ROC & PR Curves Tab**
- **ROC Curves (One-vs-Rest)**: 
  - Shows True Positive Rate vs False Positive Rate
  - Includes AUC scores for each class
  - Compares against random baseline
- **Precision-Recall Curves**:
  - Shows precision-recall tradeoff
  - Includes Average Precision scores
  - Useful for imbalanced datasets

### 5. **Distribution Tab**
- **Class Distribution Visualization**:
  - Bar chart + Pie chart showing sample distribution
  - Helps identify dataset imbalance
- **Sample Count Cards**:
  - Individual cards for each class
  - Shows count and percentage of total

### 6. **Detailed Tab**
- **Overall Performance Metrics**: All key scores in one place
- **ROC-AUC Scores**: Per-class AUC values
- **Full Classification Report**: Complete JSON report with all metrics

## 🎨 Design Features

- **Sticky Navigation**: Header and tabs stay visible while scrolling
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Color-Coded Metrics**: Different colors for different metric types
- **Interactive Tabs**: Switch between views without page reload
- **Professional Medical Theme**: Clean, hospital-style design
- **Loading States**: Shows spinner while fetching data
- **Error Handling**: Clear messages if artifacts are missing

## 🔗 Navigation

### Access the Statistics Page:
1. **From Landing Page**: Click "📊 View Statistics" button
2. **From Main App**: Click "📊 Statistics" in the top navigation bar
3. **Direct URL**: Navigate to `http://localhost:3000/statistics`

### Return to App:
- Click "← Back to App" button in the header (top-right)

## 📋 Usage

1. **Generate Artifacts First**:
   ```bash
   source myenv/bin/activate
   python generate_artifacts.py
   ```

2. **Start Backend**:
   ```bash
   ./run_backend.sh
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Navigate to Statistics**:
   - Go to `http://localhost:3000/statistics`
   - Or click the statistics button from landing/app page

## 📊 Visualizations Included

| Visualization | File | Description |
|--------------|------|-------------|
| Performance Summary | `performance_summary.png` | Complete dashboard (recommended view) |
| Confusion Matrix | `confusion_matrix.png` | Raw prediction counts |
| Normalized CM | `confusion_matrix_normalized.png` | Percentage view |
| ROC Curves | `roc_curves.png` | True/False positive rate curves |
| PR Curves | `precision_recall_curves.png` | Precision vs Recall |
| Per-Class Performance | `per_class_performance.png` | Bar chart comparison |
| Class Distribution | `class_distribution.png` | Sample distribution |

## 💡 Tips

- **Best Overview**: Start with the "Overview" tab to see the Performance Summary Dashboard
- **Compare Classes**: Use the "Performance" tab to identify which classes perform best/worst
- **Understand Errors**: Check "Confusion Matrix" tab to see which classes get confused
- **ROC Analysis**: Use "ROC & PR Curves" for detailed threshold analysis
- **Check Balance**: Use "Distribution" tab to identify dataset imbalance issues

## 🎓 Metrics Explained

### Accuracy
Overall percentage of correct predictions across all classes.

### Precision
Of all positive predictions for a class, how many were actually correct?

### Recall (Sensitivity)
Of all actual positive cases, how many did the model correctly identify?

### F1-Score
Harmonic mean of Precision and Recall. Good overall metric.

### ROC-AUC
Area Under the ROC Curve. Measures model's ability to distinguish classes.

### Confusion Matrix
Shows true vs predicted labels. Diagonal = correct predictions.

## 🛠️ Troubleshooting

**"No Statistics Available" error?**
- Run `python generate_artifacts.py` first
- Ensure backend is running on port 8000

**Visualizations not showing?**
- Check that all PNG files exist in `artifacts/` folder
- Verify backend `/metrics` endpoint returns data

**Slow loading?**
- First load may take time due to base64 encoding
- Subsequent loads use browser cache
