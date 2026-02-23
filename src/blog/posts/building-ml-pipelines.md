---
title: Building Scalable ML Pipelines with Apache Spark and MLflow
date: 2024-02-08
author: Sai Sridhar Tarra
category: MLOps
tags: [MLOps, Spark, MLflow, Python, Data Engineering]
featured: true
excerpt: Learn how to build production-grade ML pipelines that process petabytes of data, track experiments with MLflow, and deploy models with confidence.
---

# Building Scalable ML Pipelines with Apache Spark and MLflow

At Scale AI, I built data pipelines processing 500M+ images monthly. At Anthropic, I run training jobs on thousands of GPUs. The common thread: **solid pipeline engineering** is what separates toy projects from production systems.

In this post, I'll share the architecture and patterns I've learned for building ML pipelines that actually scale.

## The Problem with Jupyter Notebooks

Everyone starts with notebooks. They're great for exploration. But production ML needs:

- **Reproducibility**: can you reproduce your results 6 months later?
- **Scalability**: can it handle 100x the data?
- **Reliability**: does it fail gracefully and retry?
- **Observability**: do you know when it breaks?

This is where structured pipelines shine.

## Architecture Overview

A production ML pipeline has four layers:

```
Data Ingestion → Feature Engineering → Training → Serving
      ↓                 ↓                 ↓          ↓
   Spark            Spark/dbt          MLflow     FastAPI
   Airflow          Feature Store      Ray        Triton
   Kafka            Redis/Feast        DVC        Docker/K8s
```

## Layer 1: Data Ingestion with Apache Spark

For large-scale data processing, Spark is the workhorse:

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import *

def create_spark_session(app_name: str) -> SparkSession:
    return (
        SparkSession.builder
        .appName(app_name)
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
        .config("spark.executor.memory", "8g")
        .config("spark.executor.cores", "4")
        .getOrCreate()
    )

class DataIngestionPipeline:
    def __init__(self, spark: SparkSession, config: dict):
        self.spark = spark
        self.config = config

    def ingest_raw_data(self, source_path: str):
        """Read and validate raw data from S3."""
        df = (
            self.spark.read
            .option("mergeSchema", "true")
            .parquet(source_path)
        )

        # Data validation
        total = df.count()
        nulls = df.select([F.count(F.when(F.isnull(c), c)).alias(c) for c in df.columns])

        print(f"Loaded {total:,} records")
        return df

    def clean_and_partition(self, df, output_path: str):
        """Clean data and write partitioned output."""
        cleaned = (
            df
            .dropDuplicates(["id"])
            .filter(F.col("quality_score") > 0.7)
            .withColumn("year", F.year("created_at"))
            .withColumn("month", F.month("created_at"))
        )

        (
            cleaned
            .repartition("year", "month")
            .write
            .mode("overwrite")
            .partitionBy("year", "month")
            .parquet(output_path)
        )

        return cleaned
```

## Layer 2: Feature Engineering

A feature store ensures features are:
- Computed once, used everywhere
- Consistent between training and serving
- Versioned and documented

```python
import feast
from feast import FeatureStore, Entity, FeatureView, Field
from feast.types import Float32, Int64

class MLFeatureStore:
    def __init__(self, repo_path: str):
        self.store = FeatureStore(repo_path=repo_path)

    def get_training_features(self, entity_df, feature_refs: list):
        """Retrieve point-in-time correct features for training."""
        return self.store.get_historical_features(
            entity_df=entity_df,
            features=feature_refs,
        ).to_df()

    def get_online_features(self, entity_rows: list, feature_refs: list):
        """Get low-latency features for online serving."""
        return self.store.get_online_features(
            features=feature_refs,
            entity_rows=entity_rows,
        ).to_dict()
```

## Layer 3: Experiment Tracking with MLflow

MLflow is the backbone of experiment reproducibility:

```python
import mlflow
import mlflow.pytorch
from mlflow.tracking import MlflowClient
from contextlib import contextmanager

class ExperimentTracker:
    def __init__(self, experiment_name: str, tracking_uri: str):
        mlflow.set_tracking_uri(tracking_uri)
        mlflow.set_experiment(experiment_name)
        self.client = MlflowClient()

    @contextmanager
    def run(self, run_name: str, tags: dict = None):
        """Context manager for a clean MLflow run."""
        with mlflow.start_run(run_name=run_name, tags=tags) as run:
            yield run

    def log_model_with_signature(self, model, X_sample, run_id: str):
        """Log PyTorch model with input/output signature."""
        signature = mlflow.models.infer_signature(
            model_input=X_sample.numpy(),
            model_output=model(X_sample).detach().numpy()
        )

        mlflow.pytorch.log_model(
            pytorch_model=model,
            artifact_path="model",
            signature=signature,
            registered_model_name="my_model",
        )

# Usage
tracker = ExperimentTracker("my_experiment", "http://mlflow.internal:5000")

with tracker.run("training_run_v2", tags={"team": "ml-platform", "task": "classification"}) as run:
    mlflow.log_params({
        "learning_rate": 3e-4,
        "batch_size": 256,
        "epochs": 50,
        "model_arch": "resnet50",
    })

    for epoch in range(50):
        train_loss, val_acc = train_epoch(model, train_loader, optimizer)
        mlflow.log_metrics({
            "train_loss": train_loss,
            "val_accuracy": val_acc,
        }, step=epoch)

    tracker.log_model_with_signature(model, X_sample, run.info.run_id)
```

## Layer 4: Automated Pipeline Orchestration with Airflow

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    "owner": "ml-platform",
    "depends_on_past": False,
    "start_date": datetime(2024, 1, 1),
    "email_on_failure": True,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="ml_training_pipeline",
    default_args=default_args,
    schedule_interval="@daily",
    catchup=False,
    tags=["ml", "training"],
) as dag:

    ingest = PythonOperator(
        task_id="ingest_data",
        python_callable=run_ingestion,
        op_kwargs={"date": "{{ ds }}"},
    )

    features = PythonOperator(
        task_id="compute_features",
        python_callable=run_feature_engineering,
        op_kwargs={"date": "{{ ds }}"},
    )

    train = PythonOperator(
        task_id="train_model",
        python_callable=run_training,
        op_kwargs={"experiment": "daily_retrain"},
    )

    evaluate = PythonOperator(
        task_id="evaluate_and_register",
        python_callable=run_evaluation,
    )

    deploy = PythonOperator(
        task_id="deploy_if_better",
        python_callable=conditional_deploy,
    )

    ingest >> features >> train >> evaluate >> deploy
```

## Critical Lessons Learned

**1. Idempotency is non-negotiable.** Every step should be safe to run multiple times. Write outputs atomically, use checksums, never assume the previous run completed.

**2. Fail fast with clear errors.** Cryptic errors 10 hours into a training run are expensive. Validate your data, configs, and infrastructure before starting expensive jobs.

**3. Monitor data drift, not just model metrics.** Your model might perform well on old data while failing silently on new data. Track input feature distributions in production.

**4. Separate concerns cleanly.** Data engineers shouldn't need to understand model code. ML scientists shouldn't need to understand infrastructure. Design clear interfaces between layers.

**5. Test your pipelines.** Unit test your feature transforms. Integration test your pipeline with a small data subset. Don't wait for a full production run to find bugs.

---

Building scalable ML pipelines is part engineering, part operational discipline. The tooling keeps improving — but the fundamentals stay the same: reproducibility, observability, and clean separation of concerns.

In the next post, I'll cover **distributed training at scale** — how to efficiently train billion-parameter models across thousands of GPUs.
