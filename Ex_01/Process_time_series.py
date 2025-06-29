import pandas as pd
from collections import defaultdict
from datetime import datetime
import os

OUTPUT_FOLDER = "EX02_1_OUTPUT"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

INPUT_FILE = "time_series.csv"
LOG_FILE = os.path.join(OUTPUT_FOLDER, "parsing_log.txt")
OUTPUT_FILE = os.path.join(OUTPUT_FOLDER, "hourly_averages.txt")

def validate_and_process_chunk(chunk, seen_timestamps, log_writer, log_counters):
    chunk.columns = chunk.columns.str.strip()

    if 'timestamp' not in chunk.columns or 'value' not in chunk.columns:
        log_writer.write("❌ Missing required columns: must contain both 'timestamp' and 'value'\n")
        return pd.DataFrame()

    hourly_data = []

    for idx, row in chunk.iterrows():
        raw_timestamp = str(row['timestamp']).strip()
        raw_value = str(row['value']).strip()

        # בדיקת timestamp ריק או שגוי
        if raw_timestamp.lower() in ['', 'nan', 'none']:
            log_writer.write(f"⚠️ Row {idx+1}: Missing timestamp field (empty or NaN)\n")
            log_counters["format_error_count"] += 1
            continue

        try:
            timestamp = datetime.strptime(raw_timestamp, "%m/%d/%y %H:%M")
        except Exception:
            log_writer.write(f"🧾 Row {idx+1}: Invalid timestamp format: '{raw_timestamp}' (expected MM/DD/YY HH:MM)\n")
            log_counters["format_error_count"] += 1
            continue

        # בדיקת כפילות
        if timestamp in seen_timestamps:
            log_writer.write(f"⚠️ Row {idx+1}: Duplicate timestamp found: {timestamp.strftime('%m/%d/%y %H:%M')}\n")
            log_counters["duplicate_count"] += 1
            continue
        seen_timestamps.add(timestamp)

        # בדיקת value
        if raw_value == "":
            log_writer.write(f"⚪️ Row {idx+1}: Empty value (no value at all) at {raw_timestamp}\n")
            log_counters["value_errors"]["empty"] += 1
            continue
        elif raw_value.lower() in ['nan', 'none', 'not_a_number', 'non']:
            key = raw_value.lower()
            emoji_map = {
                'nan': "❌",
                'none': "⛔️",
                'non': "🔸",
                'not_a_number': "🚫"
            }
            emoji = emoji_map.get(key, "🔍")
            log_writer.write(f"{emoji} Row {idx+1}: Value is '{raw_value}' at {raw_timestamp}\n")
            log_counters["value_errors"][key] += 1
            continue

        # נסיון להמיר למספר
        try:
            value = float(raw_value)
        except Exception:
            log_writer.write(f"❗️ Row {idx+1}: Unknown numeric format: '{raw_value}' at {raw_timestamp}\n")
            log_counters["value_errors"]["unknown_format"] += 1
            continue

        # הכל תקין – נכניס לשימוש
        rounded_hour = timestamp.replace(minute=0, second=0, microsecond=0)
        hourly_data.append((rounded_hour, value))
        log_counters["valid_lines"] += 1

    return pd.DataFrame(hourly_data, columns=["hour", "value"])


def compute_hourly_averages(all_dataframes):
    if not all_dataframes:
        return pd.DataFrame()
    df = pd.concat(all_dataframes)
    return df.groupby("hour")["value"].mean().reset_index()


def write_averages_to_file(averages_df, output_file):
    with open(output_file, "w", encoding="utf-8") as out:
        out.write("Start Time\tAverage Value\n")
        for _, row in averages_df.iterrows():
            out.write(f"{row['hour'].strftime('%Y-%m-%d %H:%M:%S')}\t{row['value']:.1f}\n")


def main():
    seen_timestamps = set()
    all_data = []

    log_counters = {
        "total_lines": 0,
        "valid_lines": 0,
        "duplicate_count": 0,
        "format_error_count": 0,
        "value_errors": defaultdict(int)
    }

    with open(LOG_FILE, "w", encoding="utf-8") as log_writer:
        for chunk in pd.read_csv(INPUT_FILE, sep="\t", chunksize=10000, dtype=str, keep_default_na=False, na_values=[]):
            log_counters["total_lines"] += len(chunk)
            hourly_data_df = validate_and_process_chunk(chunk, seen_timestamps, log_writer, log_counters)
            if not hourly_data_df.empty:
                all_data.append(hourly_data_df)

        log_writer.write("\n📊 Summary:\n")
        log_writer.write(f"📄 Total lines: {log_counters['total_lines']}\n")
        log_writer.write(f"✅ Valid lines: {log_counters['valid_lines']}\n")
        log_writer.write(f"♻️ Duplicate count: {log_counters['duplicate_count']}\n")
        log_writer.write(f"🧾 Format error count (timestamps): {log_counters['format_error_count']}\n")

        if log_counters["value_errors"]:
            log_writer.write("\n🔍 Value errors:\n")
            emoji_map = {
                'empty': "⚪️",
                'nan': "❌",
                'not_a_number': "🚫",
                'none': "⛔️",
                'non': "🔸",
                'unknown_format': "❗️"
            }
            for error_type, count in log_counters["value_errors"].items():
                emoji = emoji_map.get(error_type, "🔹")
                log_writer.write(f"{emoji} {error_type}: {count}\n")

    # שמירת ממוצעים
    averages = compute_hourly_averages(all_data)
    write_averages_to_file(averages, OUTPUT_FILE)


if __name__ == "__main__":
    main()
