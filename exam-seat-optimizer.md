# Exam Hall Seat Arrangement Optimizer Plan

## Overview
Design and implement an Exam Hall Seat Arrangement Optimizer feature. This feature uses a Multi-Constraint Constraint Satisfaction Problem (CSP) AI Algorithm to arrange students in exam halls while satisfying various constraints.

## Project Type
WEB/BACKEND

## Success Criteria
- [ ] Backend API can accept Exam Data, existing Hall configs, and Student lists
- [ ] AI Algorithm generates a valid seating arrangement plan
- [ ] Algorithm satisfies constraints: Variable hall capacity, multiple departments, variable student count, subject dependencies, balanced distribution
- [ ] Frontend UI allows admins to input exam details, select halls, and departments
- [ ] Frontend UI displays the generated seating arrangement clearly

## Tech Stack
- Frontend: React (Mobile/Web via Expo)
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Algorithm: Custom Constraint Satisfaction Problem (CSP) implementation handling capacity, department, subject, and anti-cheat (alternating) constraints

## File Structure
```
backend/
  ├── models/
  │   ├── Exam.js (Update/Create)
  │   └── Hall.js (Update/Create)
  ├── controllers/
  │   └── examRoomController.js (Contains the CSP Algorithm)
  └── routes/
      └── examRoomRoutes.js
frontend/
  └── admin-portal/ (or relevant directory)
      └── screens/
          └── ExamSeatArrangementScreen.js
```

## Task Breakdown

### Task 1: Database Models for Exams and Halls
- **agent**: `database-architect`
- **skills**: `database-design`
- **priority**: P0
- **dependencies**: none
- **INPUT**: Schema requirements for Exam, Hall, and Student
- **OUTPUT**: Mongoose schemas in `backend/models/Exam.js` and `backend/models/Hall.js`
- **VERIFY**: Schemas successfully compile with Mongoose, no syntax errors.

### Task 2: Implement CSP Seat Allocation Algorithm (Backend)
- **agent**: `backend-specialist`
- **skills**: `nodejs-best-practices`, `clean-code`
- **priority**: P1
- **dependencies**: Task 1
- **INPUT**: Exam settings, available Halls, List of Students from participating departments
- **OUTPUT**: A robust function in `backend/controllers/examRoomController.js` that outputs an array/object mapping students to specific seats/benches in specific halls.
- **VERIFY**: The algorithm successfully runs with mock data, handling variable capacities and constraints without crashing, returning a valid mapping.

### Task 3: API Endpoint for Seat Generation
- **agent**: `backend-specialist`
- **skills**: `api-patterns`
- **priority**: P1
- **dependencies**: Task 2
- **INPUT**: Express route configuration
- **OUTPUT**: A `POST` route in `backend/routes/examRoomRoutes.js` that triggers the algorithm and returns the arrangement.
- **VERIFY**: Endpoint can be hit with Postman/cURL and returns the correct payload.

### Task 4: Admin UI for Inputting Exam Data
- **agent**: `frontend-specialist`
- **skills**: `frontend-design`, `react-best-practices`
- **priority**: P2
- **dependencies**: Task 3
- **INPUT**: UI requirements for selecting exam, departments, and halls
- **OUTPUT**: `ExamSeatArrangementScreen` component allowing user input and triggering API
- **VERIFY**: Form successfully captures data and makes the POST request to the API without UI errors.

### Task 5: Admin UI for Displaying Arrangement
- **agent**: `frontend-specialist`
- **skills**: `frontend-design`, `react-best-practices`
- **priority**: P2
- **dependencies**: Task 4
- **INPUT**: API JSON response from Task 3
- **OUTPUT**: Visual representation (tables or visual grid) of the seating arrangement in the UI.
- **VERIFY**: The UI correctly renders the varying hall capacities and student placements.

## Phase X: Verification
- [x] Lint: Run `npm run lint` or equivalent on frontend and backend
- [x] Security: Check for any exposure of student PII
- [x] Build: Ensure backend and frontend servers start without errors
- [x] Algorithm testing: Verify edge cases (e.g., more students than seats throws appropriate error managed by algorithm)

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-03-03
