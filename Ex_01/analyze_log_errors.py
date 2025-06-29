import os
from collections import Counter
from concurrent.futures import ProcessPoolExecutor
import pandas as pd
import heapq

# ---------------------
# הגדרות כלליות
# ---------------------

OUTPUT_FOLDER = "EX01_OUTPUT"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

LOG_FILE_PATH = "logs.txt"  # אם גם קובץ הלוג נמצא בתקייה – ניתן לעדכן בהמשך
CHUNK_SIZE = 100_000
OUTPUT_FILE = os.path.join(OUTPUT_FOLDER, "top_errors.csv")
TOP_N = 7


# ---------------------
# פונקציות עזר
# ---------------------

def extract_error_code(line):
    """Extract error code from a line."""
    if "Error:" in line:
        return line.split("Error:")[1].strip()
    return "UNKNOWN"


def split_file_to_chunks(file_path, chunk_size=CHUNK_SIZE, output_folder=os.path.join(OUTPUT_FOLDER, "log_chunks")):
    """Split a large log file into smaller chunk files stored in a folder."""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    chunk_files = []
    with open(file_path, 'r', encoding='utf-8') as f:
        chunk = []
        chunk_index = 0
        for i, line in enumerate(f):
            chunk.append(line)
            if (i + 1) % chunk_size == 0:
                chunk_file = os.path.join(output_folder, f"chunk_{chunk_index}.txt")
                with open(chunk_file, 'w', encoding='utf-8') as cf:
                    cf.writelines(chunk)
                chunk_files.append(chunk_file)
                chunk = []
                chunk_index += 1
        if chunk:
            chunk_file = os.path.join(output_folder, f"chunk_{chunk_index}.txt")
            with open(chunk_file, 'w', encoding='utf-8') as cf:
                cf.writelines(chunk)
            chunk_files.append(chunk_file)

    return chunk_files


def count_errors_in_chunk(chunk_file):
    """Count error codes in a single chunk file."""
    counter = Counter()
    with open(chunk_file, 'r', encoding='utf-8') as f:
        for line in f:
            code = extract_error_code(line)
            counter[code] += 1
    return counter


def merge_counters(counters):
    """Merge a list of Counter objects into a single one."""
    total = Counter()
    for counter in counters:
        total.update(counter)
    return total


def get_top_n(counter, n=TOP_N):
    """Get top N most common error codes."""
    return heapq.nlargest(n, counter.items(), key=lambda x: x[1])


def save_to_csv(top_errors, output_file=OUTPUT_FILE):
    """Save the top errors to a CSV file."""
    df = pd.DataFrame(top_errors, columns=["Error Code", "Count"])
    df.to_csv(output_file, index=False)


# ---------------------
# main
# ---------------------

def main():
    chunk_files = split_file_to_chunks(LOG_FILE_PATH)

    with ProcessPoolExecutor() as executor:
        counters = list(executor.map(count_errors_in_chunk, chunk_files))

    total_counts = merge_counters(counters)
    top_errors = get_top_n(total_counts, TOP_N)
    save_to_csv(top_errors)

    return top_errors


if __name__ == "__main__":
    top_errors_result = main()
    print("Top errors:")
    for code, count in top_errors_result:
        print(f"{code}: {count}")
