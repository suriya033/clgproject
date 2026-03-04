# AI-Based Exam Hall Allocation System (CSP Implementation)

## 🎯 Task Overview
Implement a comprehensive AI-driven exam hall allocation system using Constraint Satisfaction Problem (CSP) logic. The system will collect Hall, Student, and Subject data, and automatically allocate seats based on strict rules.

## 🧠 Socratic Gate Approvals
- **1A**: Mix students from different subjects (zig-zag / alternating patterns) to prevent cheating.
- **2A**: Block allocation entirely if there is a capacity overflow and alert the admin.
- **3A**: Provide an interactive UI for admins to manually override or tweak the generated plan before saving it to the database.
- **Algorithm**: Constraint Satisfaction Problem (CSP) for mapping Students (Variables) to specific specific Hall and Seat coordinates (Domains) under constraints (Same Subject cannot sit adjacently, physical capacity constraint).

## 🛠️ Implementation Plan

### Phase 1: Database & Backend Logistics (`database-architect` & `backend-specialist`)
1. **Model Updates**:
   - `ExamHall` model is already partial (hallName, benches, seatsPerBench, totalSeats).
   - Require a `SeatingPlan` model to store the finalized JSON of the generated/tweaked layout.
2. **CSP Algorithm (`backend`)**:
   - Create a CSP engine in `backend/controllers/examController.js` or a separate `utils/cspAllocator.js`.
   - **Variables**: `Students` (with specific subjects).
   - **Domains**: Cartesian coordinates `(HallID, BenchIndex, SeatIndex)`.
   - **Constraints**: 
     - *Adjacency Constraint*: If Seat 1 is SubjA, Seat 2 (same bench) must NOT be SubjA.
     - *Capacity Constraint*: `Assigned Students <= Available Seats`. Return `OVERFLOW_ERROR` if breached.
 3. **API Endpoints**:
    - `POST /api/exams/allocate` -> Run CSP and return provisional seating map.
    - `POST /api/exams/save-plan` -> Save the tweaked final plan to DB.

### Phase 2: Frontend Implementation (`frontend-specialist`)
1. **Forms UI**:
   - Tab 1: **Hall Setup** (Add/Edit Halls to DB).
   - Tab 2: **Seat Allocation Generator**: Select Date/Session, Select Participating Subjects, Select Halls to Use.
2. **Interactive Plan Output**:
   - Render the returned CSP Provisional plan as a visual grid (Benches & Seats).
   - Allow Drag & Drop or simple click-to-swap mechanisms for Admins to tweak the student seating manually.
   - Save button to persist to `backend`.

### Phase 3: Testing & Debugging (`test-engineer` & `debugger`)
1. Provide mock student/subject sets.
2. Test overflow scenario.
3. Test adjacency constraints.

## 🚀 Execution Instructions
As the Orchestrator, I will now proceed to invoke the backend specialist for Phase 1, followed by the frontend specialist for Phase 2.
