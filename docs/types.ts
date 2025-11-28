// TypeScript interfaces mirroring the AWS Postgres schema for SciNet / ResearchOS.
// These focus on dynamic variable/metric capture and document embeddings.

export type DataType = 'number' | 'categorical' | 'boolean' | 'text' | 'json';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue; }
export interface JsonArray extends Array<JsonValue> {}

// Variable definitions drive dynamic form generation per project.
export interface ProjectVariable {
  id: string;
  project_id: string;
  slug: string; // Stable key used to store values inside experiment.inputs
  name: string;
  data_type: DataType;
  unit?: string | null;
  description?: string | null;
  allowed_values?: JsonObject; // e.g., { options: ['PLA', 'ABS'] }
  default_value?: JsonValue;
  required: boolean;
  created_at: string;
}

// Metrics are tracked outputs; same schema as variables but with optional calculation notes.
export interface ProjectMetric {
  id: string;
  project_id: string;
  slug: string; // Stable key used to store values inside experiment.outputs
  name: string;
  data_type: DataType;
  unit?: string | null;
  description?: string | null;
  calculation_notes?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id?: string | null;
  name: string;
  description?: string | null;
  status: 'draft' | 'active' | 'archived';
  hypothesis?: string | null;
  created_at: string;
  updated_at: string;
}

// Dynamic experiment payloads capture variable and metric data keyed by slug.
export interface ExperimentRun {
  id: string;
  project_id: string;
  run_number: number;
  title?: string | null;
  notes?: string | null;
  state: 'proposed' | 'running' | 'completed' | 'abandoned';
  inputs: Record<string, JsonValue>; // keys correspond to project_variables.slug
  outputs: Record<string, JsonValue>; // keys correspond to project_metrics.slug
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

// Normalized slices make aggregations easier without JSON path queries.
export interface ExperimentVariableFlat {
  id: number;
  experiment_id: string;
  project_id: string;
  variable_slug: string;
  value: JsonValue;
  created_at: string;
}

export interface ExperimentMetricFlat {
  id: number;
  experiment_id: string;
  project_id: string;
  metric_slug: string;
  value: JsonValue;
  created_at: string;
}

// Knowledge base assets and embeddings for RAG.
export interface ProjectDocument {
  id: string;
  project_id: string;
  title?: string | null;
  source_url?: string | null;
  storage_path: string; // S3 key or URL to the stored asset
  token_count?: number | null;
  checksum?: string | null;
  metadata: JsonObject;
  created_at: string;
}

export interface DocumentChunk {
  id: number;
  project_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count?: number | null;
  embedding: number[]; // pgvector values retrieved via your Postgres client
  metadata: JsonObject;
  created_at: string;
}

// AI artifacts capture suggestions, plans, analyses, and manuscript segments.
export type AiArtifactKind =
  | 'variable_suggestion'
  | 'metric_suggestion'
  | 'experiment_plan'
  | 'analysis'
  | 'manuscript_section';

export interface AiArtifact {
  id: string;
  project_id: string;
  experiment_id?: string | null;
  kind: AiArtifactKind;
  content: JsonObject; // structured payload with prompt, response, citations, etc.
  model?: string | null;
  created_at: string;
}
