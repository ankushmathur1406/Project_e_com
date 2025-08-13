import pandas as pd
from datetime import datetime, timedelta
import openpyxl

# Load workbook and sheet
file_path = "ame_check.xlsx"
events_df = pd.read_excel(file_path, sheet_name="Events4")

# Define shift windows
shift_windows = {
    "M": (datetime.strptime("06:30", "%H:%M").time(), datetime.strptime("14:30", "%H:%M").time()),
    "A": (datetime.strptime("14:00", "%H:%M").time(), datetime.strptime("22:00", "%H:%M").time()),
    "G": (datetime.strptime("10:00", "%H:%M").time(), datetime.strptime("18:00", "%H:%M").time()),
    "N": (datetime.strptime("21:30", "%H:%M").time(), datetime.strptime("07:30", "%H:%M").time())  # Overnight
}

# Dictionary to hold shift-wise event overlaps
date_shift_dict = {}

for _, row in events_df.iterrows():
    try:
        event_date = pd.to_datetime(row["F"]).date()
        st_time = pd.to_datetime(row["D"]).time()
        dt_time = pd.to_datetime(row["I"]).time()
    except:
        continue

    start_dt = datetime.combine(event_date, st_time) - timedelta(minutes=15)
    end_dt = datetime.combine(event_date, dt_time) + timedelta(minutes=15)
    if end_dt < start_dt:
        end_dt += timedelta(days=1)

    duration_hours = (end_dt - start_dt).total_seconds() / 3600
    if duration_hours > 3.5:
        end_dt = start_dt + timedelta(hours=3.5)

    for shift_code, (s_time, e_time) in shift_windows.items():
        shift_start = datetime.combine(event_date, s_time)
        shift_end = datetime.combine(event_date, e_time)
        if shift_code == "N":
            shift_end += timedelta(days=1)

        if end_dt > shift_start and start_dt < shift_end:
            overlap_start = max(start_dt, shift_start)
            overlap_end = min(end_dt, shift_end)

            date_key = event_date.strftime("%Y-%m-%d")
            if date_key not in date_shift_dict:
                date_shift_dict[date_key] = {}
            if shift_code not in date_shift_dict[date_key]:
                date_shift_dict[date_key][shift_code] = []

            date_shift_dict[date_key][shift_code].append((overlap_start, overlap_end))

# Compute max concurrent events per shift
summary_rows = []

for date_key, shifts in date_shift_dict.items():
    for shift_code, intervals in shifts.items():
        time_points = []
        for start, end in intervals:
            time_points.append((start, 1))  # Start of event
            time_points.append((end, -1))  # End of event

        # Sort time points
        time_points.sort(key=lambda x: x[0])

        cur = 0
        max_concurrent = 0
        for _, delta in time_points:
            cur += delta
            max_concurrent = max(max_concurrent, cur)

        summary_rows.append({
            "Date": datetime.strptime(date_key, "%Y-%m-%d").strftime("%d-%b-%Y"),
            "Shift": shift_code,
            "Max Concurrent Events (Min Employees Needed)": max_concurrent
        })

# Create summary DataFrame
summary_df = pd.DataFrame(summary_rows)

# Write to Excel
with pd.ExcelWriter(file_path, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
    summary_df.to_excel(writer, sheet_name="Shift Summary", index=False)

print("✅ Minimum employee requirement calculated and written to 'Shift Summary' sheet.")



