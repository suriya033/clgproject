# AI Timetable Generator: Algorithmic Logic

## Overview
The "AI" in the TimeTable Generator uses a **Greedy Randomized Heuristic** algorithm. It is designed to solve the *Class Scheduling Problem*, which is a type of Constraint Satisfaction Problem (CSP).

Instead of using heavy-weight solvers (impossible to run quickly on a standard responding server without timeout), we use a constructive greedy approach with iterative refinement.

## Core Concepts

### 1. Task Pool Generation
The algorithm does not think in terms of "Subjects", but in terms of "Tasks".
- **Input**: `Subject: Math, Hours: 4`
- **Conversion**: The system creates 4 distinct "Math Tasks".
- **Result**: A flat list (pool) of all teaching hours required for the week (e.g., 35 tasks for a 35-hour week).

### 2. Stochastic Shuffling (Randomization)
Before assigning any slots, the Task Pool is shuffled randomly.
- **Why?** To ensure that if you run the generator twice for the same inputs, you get different results. This prevents "Starvation" (where the same subject always gets bad slots) and allows the user to simply "Retry" if they don't like a specific generated schedule.

## The Algorithm: Step-by-Step

The algorithm iterates through every Day (Mon-Fri) and every Time Slot (09:00 - 04:00). For each slot, it performs the following decision logic:

### Step A: Handle Fixed Constraints
- Checks if the current slot is a **Break** or **Lunch**.
- If yes, it automatically assigns it and moves to the next slot (ignoring the task pool).

### Step B: Candidate Selection (Greedy Search)
The system looks at the remaining tasks in the pool and tries to pick the *best* one for the current slot (`Day D`, `Slot S`). It uses a two-pass constraint check:

**Pass 1: Strict Mode (Ideal)**
It scans the list for a task that satisfies all **Hard Constraints**:
1.  **Consecutive Constraint**: `CurrentSubject != LastSubject`. (Don't schedule Math immediately after Math).
2.  **Daily Limit Constraint**: `DailyCount[Subject] < 2`. (Don't schedule Math more than 2 times in a single day).

*If a task is found*: It is assigned immediately.

**Pass 2: Relaxed Mode (Fallback)**
If *no* task in the pool satisfies strict rules (e.g., we have too many hours of Math left and the only way to fit them is to double up), we relax the rules.
- It looks for a task that satisfies the **Daily Limit** constraint only.
- It *ignores* the Consecutive constraint.

*If a task is found*: It is assigned.

**Pass 3: Force Assignment (Last Resort)**
If even Pass 2 fails (extremely rare, usually implies impossible inputs like "Scheduled 8 hours of Math in a 7-hour day"), it simply takes the next available task to ensure the slot is not empty.

## Data Structures Used
- **Task List (Array)**: Dynamic list of pending work.
- **Daily Limits (Map)**: `dailyLimits[Day][Subject] = Integer`. Updates in real-time as slots are filled.
- **Schedule (Object)**: Final output structure grouped by Day.

## Why this approach?
- **Speed**: O(N) complexity where N is the number of slots. It generates a full schedule in milliseconds.
- **Flexibility**: Can easily handle "Freestyle" scheduling where not every slot works perfectly, rather than failing completely like a strict CSP solver would.
