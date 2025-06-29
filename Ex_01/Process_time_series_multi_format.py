import pandas as pd
import os
import time
from multiprocessing import Pool, cpu_count

CHUNK_SIZE = 10000

OUTPUT_FOLDER = "EX02_4_OUTPUT"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

INPUT_FILE = "time_series.csv"  # כאן הקובץ נמצא בתיקיית הפרויקט הראשית
OUTPUT_FILE = os.path.join(OUTPUT_FOLDER, "final_hour.csv")


def read_file(file_path, chunk_size=CHUNK_SIZE):
    if file_path.lower().endswith(".csv"):
        return pd.read_csv(file_path, sep="\t", chunksize=chunk_size, header=None, names=["timestamp", "value"])
    elif file_path.lower().endswith(".parquet"):
        df = pd.read_parquet(file_path)
        return [df]  # עטיפה כדי לאחד API עם chunks
    else:
        raise ValueError("Unsupported file format")


def save_file(df, file_path):
    if file_path.lower().endswith(".csv"):
        df.to_csv(file_path, index=False)
    elif file_path.lower().endswith(".parquet"):
        df.to_parquet(file_path, index=False)
    else:
        raise ValueError("Unsupported output format")


def prepare_file_path(file_path):
    if file_path.lower().endswith(".csv"):
        base_name = os.path.basename(file_path).replace(".csv", ".auto.parquet")
        parquet_path = os.path.join(OUTPUT_FOLDER, base_name)
        if not os.path.exists(parquet_path):
            df = pd.read_csv(file_path, sep='\t', header=None, names=["timestamp", "value"])
            df.to_parquet(parquet_path, index=False)
        return parquet_path
    elif file_path.lower().endswith(".parquet"):
        return file_path
    else:
        raise ValueError("Only CSV or Parquet files are supported.")


def clean_data(df):
    time_col = df.columns[0]
    value_col = df.columns[1]

    df[time_col] = pd.to_datetime(df[time_col], format="%m/%d/%y %H:%M", errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')

    df = df.dropna(subset=[time_col, value_col]).drop_duplicates()

    return df


def avg_for_hour(df):
    # סינון ראשוני למקרה שה־df ריק או חסר עמודות
    if df is None or df.empty or len(df.columns) < 2:
        return pd.DataFrame(columns=['start_time', 'average', 'count'])

    try:
        df = clean_data(df)
    except Exception as e:
        print(f"⚠️ Skipping chunk due to error in clean_data: {e}")
        return pd.DataFrame(columns=['start_time', 'average', 'count'])

    time_col = df.columns[0]
    value_col = df.columns[1]

    df['start_time'] = df[time_col].dt.floor('h')

    df = df.groupby('start_time', as_index=False, sort=False).agg(
        total_sum=(value_col, 'sum'),
        count=(value_col, 'count')
    )

    df['average'] = df['total_sum'] / df['count']

    return df[['start_time', 'average', 'count']]


def process_all_chunks(file_path, output_path):
    chunks = read_file(file_path)

    print(f"🧮 Processing {len(chunks)} chunks using {cpu_count()} processes...")

    with Pool(processes=cpu_count()) as pool:
        results = pool.map(avg_for_hour, chunks)

    results = [df for df in results if not df.empty]

    if not results:
        print("❌ No valid data to process.")
        return output_path, pd.DataFrame(columns=['start_time', 'average'])

    df_all = pd.concat(results, ignore_index=True)

    df_all['sum_val'] = df_all['average'] * df_all['count']

    df_final = df_all.groupby('start_time', as_index=False, sort=False).agg({
        'sum_val': 'sum',
        'count': 'sum'
    })

    df_final['average'] = df_final['sum_val'] / df_final['count']
    save_file(df_final[['start_time', 'average']], output_path)

    return output_path, df_final


def main():
    input_path = prepare_file_path(INPUT_FILE)
    output_path = OUTPUT_FILE

    start = time.time()
    final_path, df = process_all_chunks(input_path, output_path)
    end = time.time()

    print(f"\n✅ Output saved to: {final_path}")
    print(df.head())
    print(f"\n⏱️ Duration: {end - start:.2f} seconds")


if __name__ == "__main__":
    main()
