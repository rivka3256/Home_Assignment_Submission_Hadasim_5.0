# Explanation of the Code:
# This code simulates processing a real-time data stream and calculates hourly averages dynamically and efficiently.
#
# Data Stream Simulation
# The function data_stream() simulates a continuous data stream. Every second, it generates a timestamp of the current time and a random numerical value between 0 and 100. This simulates receiving real-time data points.
#
# Updating Hourly Data
# The function update_hourly_averages(hourly_sums, hourly_counts, timestamp, value) updates two dictionaries:
#
# hourly_sums: keeps the cumulative sum of values for each hour.
#
# hourly_counts: keeps track of the number of values received for each hour.
# When a new data point arrives, it rounds down the timestamp to the start of the hour (e.g., 14:00:00) and updates the sum and count for that hour.
#
# Saving and Printing Hourly Averages
# The function save_hourly_averages_to_file() saves the current average value for each hour to a text file. It writes all the hourly averages so far. It uses the sums and counts dictionaries to calculate averages by dividing sum by count.
# It also prints the hourly averages on the console, so you can see live updates.
#
# Main Loop
# The main() function initializes the sum and count dictionaries, then iterates over the simulated data stream. For every new data point, it updates the running totals and averages. Every 10 data points (about every 10 seconds), it writes the current hourly averages to the file.
#

import os
import time
from collections import defaultdict
from datetime import datetime

# יצירת תיקיית הפלט אם לא קיימת
OUTPUT_FOLDER = "EX02_3_OUTPUT"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# קובץ הפלט עם הנתיב החדש
OUTPUT_FILE = os.path.join(OUTPUT_FOLDER, "hourly_averages_by_stream.txt")

def data_stream():
    """
    זרם נתונים מדומה: כל שנייה מחזיר טיימסטמפ וערך אקראי.
    """
    import random
    while True:
        timestamp = datetime.now()
        value = random.uniform(0, 100)
        yield timestamp, value
        time.sleep(1)

def update_hourly_averages(hourly_sums, hourly_counts, timestamp, value):
    """
    מעדכן סכומים ומונים עבור השעה של הטיימסטמפ הנתון.
    """
    hour_start = timestamp.replace(minute=0, second=0, microsecond=0)
    hourly_sums[hour_start] += value
    hourly_counts[hour_start] += 1

def print_and_save_hourly_averages(hourly_sums, hourly_counts, filename=OUTPUT_FILE):
    """
    מדפיס ומעדכן לקובץ את הממוצעים הנוכחיים לכל שעה.
    """
    print("\n--- ממוצעים שעתיים עד עכשיו ---")
    with open(filename, "w", encoding="utf-8") as f:
        f.write("Start Time\tAverage Value\n")
        for hour in sorted(hourly_sums):
            avg = hourly_sums[hour] / hourly_counts[hour]
            line = f"{hour.strftime('%Y-%m-%d %H:%M:%S')}\t{avg:.2f}\n"
            print(line.strip())
            f.write(line)

def save_hourly_averages_to_file(hourly_sums, hourly_counts, filename=OUTPUT_FILE):
    """
    שומר את הממוצעים הנוכחיים לקובץ (במצב append).
    """
    with open(filename, "a", encoding="utf-8") as f:
        f.write("\n--- ממוצעים שעתיים עד עכשיו ---\n")
        for hour in sorted(hourly_sums):
            avg = hourly_sums[hour] / hourly_counts[hour]
            f.write(f"{hour.strftime('%Y-%m-%d %H:%M:%S')} -> ממוצע: {avg:.2f}\n")

def main():
    hourly_sums = defaultdict(float)
    hourly_counts = defaultdict(int)

    stream = data_stream()

    for i, (timestamp, value) in enumerate(stream):
        print(f"נתון חדש: {timestamp.strftime('%Y-%m-%d %H:%M:%S')} ערך: {value:.2f}")
        update_hourly_averages(hourly_sums, hourly_counts, timestamp, value)

        # כל 10 נקודות שומר לקובץ
        if i > 0 and i % 10 == 0:
            save_hourly_averages_to_file(hourly_sums, hourly_counts)

if __name__ == "__main__":
    main()
