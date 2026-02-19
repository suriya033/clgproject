# AI Timetable Generator

## Overview
The **AI Timetable Generator** is a smart feature designed to automate the complex task of creating college timetables. It uses a constraint-based algorithm to assign subjects to time slots while ensuring a balanced schedule for students and staff.

## Key Features
- **Smart Scheduling**: Automatically assigns subjects to slots.
- **Constraint Management**:
  - **Single Subject Limit**: A subject cannot be scheduled more than **2 times per day**.
  - **No Consecutive Classes**: Prevents the same subject from being scheduled back-to-back (unless unavoidable).
- **Standard Timings**: Follows an 8-hour teaching day structure (09:15 AM - 04:55 PM) with fixed **Break** (10:55 AM, 03:15 PM) and **Lunch** (12:55 PM) intervals.
- **Batch Creation**: "Save & Next" workflow allows rapid creation of timetables for multiple departments.
- **Edit Capability**: Users can manually tweak individual slots after generation if needed.

## Workflow

### 1. Input Class Details
- Navigate to **Timetable Generator** from the dashboard.
- Select **Department**, **Year**, **Semester**, and **Section**.

### 2. Add Subjects & Staff
- Add subjects to the pool for that class.
- Assign a **Staff Member** to each subject.
- Specify **Hours per Week** (priority weight).
- *Note: You must add enough subjects to fill the weekly schedule.*

### 3. Generate
- Click **Next** or **Submit**.
- The AI algorithm runs on the backend (`/api/timetable/generate`), shuffling tasks and filling slots based on priority and constraints.

### 4. Review & Edit
- A preview of the Weekly Schedule is shown.
- Tap on any specific slot (e.g., *Monday 09:00*) to manually override it (e.g., change "Math" to "Free" or another subject).

### 5. Save
- **Save**: Saves the current timetable and returns you to the menu.
- **Save & Next**: Saves the current timetable and **immediately resets the form**, allowing you to start inputting data for the next department without navigating away.

## Technical Architecture

### Backend (`/backend/routes/timetable.js`)
- **Algorithm**:
  1. Creates a pool of "Tasks" based on `hoursPerWeek`.
  2. Shuffles tasks for randomness.
  3. Iterates through 5 working days (Mon-Fri) and 11 daily slots.
  4. Checks constraints (`!isConsecutive` and `dailyCount < 2`) for every slot.
  5. Backtracks/Soft-relaxes constraints if a perfect slot isn't found (Second Pass).
- **Time Structure**:
  - 09:15 - 10:05
  - 10:05 - 10:55
  - **10:55 - 11:15 (Break)**
  - 11:15 - 12:05
  - 12:05 - 12:55
  - **12:55 - 13:45 (Lunch)**
  - 13:45 - 14:30
  - 14:30 - 15:15
  - **15:15 - 15:25 (Break)**
  - 15:25 - 16:05
  - 16:05 - 16:55

### Frontend (`/frontend/src/screens/TimeTableGenerator.js`)
- **State Management**: Handles the complex list of added subjects and generated preview.
- **Interactive UI**:
  - `CustomDropdown` for selecting Dept/Staff/Subjects.
  - `Modal` for editing specific slots.
  - linear-gradient headers and card-based layout for a premium feel.

## Future Improvements
- **Staff Collision Detection**: Ensure a staff member isn't assigned to two different classes at the same time (requires global state/database check).
- **Lab Sessions**: Support for multi-hour blocks for practical labs.
