# SciNet / ResearchOS on AWS (with Vercel frontend)

This guide maps the existing data model to AWS primitives while keeping the Next.js app on Vercel.

## Core components
- **Frontend**: Next.js 14 on Vercel (App Router).
- **Auth**: Amazon Cognito User Pool (store the Cognito `sub` in your app's `users` table or another identity map; reference it via `projects.owner_id`).
- **Database**: Amazon RDS or Aurora PostgreSQL with the `vector` extension enabled (required for embeddings).
- **Object storage**: Amazon S3 for PDF uploads and derived artifacts (store the S3 key in `project_documents.storage_path`).
- **Embeddings & search**: pgvector inside Postgres (as defined in `docs/aws_postgres_schema.sql`).

## Deployment flow
1. **Provision RDS/Aurora Postgres** and enable the `vector`, `uuid-ossp`, and `pgcrypto` extensions. Run `docs/aws_postgres_schema.sql` against the database.
2. **Create an S3 bucket** for document uploads. The app should write to a path such as `s3://<bucket>/projects/<project_id>/<filename>` and persist that key in `project_documents.storage_path`.
3. **Set up Cognito**: Configure a User Pool + hosted UI. Expose Cognito env vars to Vercel (user pool id, client id) and to your backend/API routes for JWT verification. The Cognito `sub` should be persisted alongside the user record referenced by `projects.owner_id`.
4. **Connect Next.js API routes to AWS**:
   - Use standard Postgres drivers (e.g., `@neondatabase/serverless` is not needed; use `pg` with an RDS proxy or connection pooler like pgBouncer/RDS Proxy).
   - Use AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/client-cognito-identity-provider`) from server actions or API routes.
   - For embeddings, call your chosen model provider (Gemini 1.5 Pro via Vercel SDK) and store vectors in `document_chunks.embedding`.
5. **Secrets & environment variables**: Store RDS credentials, Cognito secrets, and S3 keys as Vercel Environment Variables. For local dev, use `.env.local`.
6. **Networking**: If Vercel cannot reach the database directly, place Postgres behind RDS Proxy and allow public access with IP allowlisting, or host a lightweight API/Edge Function inside AWS (e.g., Lambda behind API Gateway) that the Vercel app can call.

## Data model notes
- The schema in `docs/aws_postgres_schema.sql` remains dynamic (variables/metrics in JSONB). It uses pgvector for semantic search over document chunks.
- `owner_id` is intentionally generic so you can map Cognito users or service accounts without Supabase's `auth.users` table.
- Use the optional flattened tables (`experiment_variables_flat`, `experiment_metrics_flat`) when you need analytics-friendly queries or materialized views.

## Next steps
- Scaffold a small `users` table keyed by Cognito `sub` or create a view that maps Cognito identities to `projects.owner_id`.
- Add ingestion workers (Lambda or Fargate) if embeddings or PDF parsing become too heavy for Vercel serverless functions.
