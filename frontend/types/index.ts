// API Response Types

export interface PredictionResult {
  id: string;
  predicted_label: string;
  probabilities: Record<string, number>;
  created_at: string;
  recommendations: {
    title: string;
    items: string[];
  };
}

export interface HistoryItem {
  id: string;
  filename: string | null;
  predicted_label: string;
  created_at: string;
}

export interface HistoryDetails extends HistoryItem {
  image_path: string | null;
  probabilities: Record<string, number>;
  image_base64?: string;
  recommendations: {
    title: string;
    items: string[];
  };
}

export interface Metrics {
  test_accuracy: number;
  test_loss: number;
  f1_weighted: number;
  macro_f1?: number;
  total_samples?: number;
  n_classes?: number;
  labels: string[];
  per_class_precision?: Record<string, number>;
  per_class_recall?: Record<string, number>;
  per_class_f1?: Record<string, number>;
  class_distribution?: Record<string, number>;
  roc_auc?: Record<string, number>;
  confusion_matrix?: number[][];
  classification_report?: any;
  // Base64 images
  confusion_matrix_base64?: string;
  confusion_matrix_normalized_base64?: string;
  training_curves_base64?: string;
  roc_curves_base64?: string;
  precision_recall_curves_base64?: string;
  per_class_performance_base64?: string;
  class_distribution_base64?: string;
  performance_summary_base64?: string;
}

export interface ApiError {
  detail: string;
}
