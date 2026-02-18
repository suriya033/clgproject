# AI Algorithms in Timetable Generator

This document provides a detailed technical explanation of the Artificial Intelligence and Algorithmic logic used in the **Automated Timetable Generator** system.

## 1. Core Algorithm: Randomized Heuristic Constraint Satisfaction

The core engine of the timetable generator is built upon a **Randomized Heuristic Constraint Satisfaction Algorithm**. 

Timetable scheduling is mathematically classified as an **NP-Hard** problem (non-deterministic polynomial-time hardness), specifically a variation of the *Job-Shop Scheduling Problem*. Instead of using brute-force (which would take infinite time) or pure randomness (which creates conflicts), we use a smart, rule-based approach combined with randomization to find an optimal solution efficiently.

### Algorithm Purpose
The primary purpose of this algorithm is to:
1.  **Automate Scheduling**: Remove the manual error-prone process of assigning classes.
2.  **Resolve Conflicts**: Ensure no staff member overlaps and no room is double-booked.
3.  **Optimize Distribution**: Spread subjects evenly across the week to ensure a balanced academic load for students.

---

## 2. How the Algorithm Works (Step-by-Step)

The generation process works in two distinct phases to maximize success rates.

### Phase 0: Data Preprocessing & Decomposition
Before placing any subjects, the algorithm breaks down the "User Request" into discrete **Tasks**.
- **Input**: A list of subjects, their required hours per week, and assigned staff.
- **Decomposition**:
    - *Practical Subjects* are converted into large "Blocks" (e.g., a 3-hour continuous block).
    - *Theory Subjects* are converted into single 1-hour "Units".
- **Global Constraints**: A 3D matrix is initialized to track `GlobalStaffBusy[Day][Slot]` to ensure a staff member is never assigned two different classes at the same time across the entire college.

### Phase 1: Strategic Allocation (The "Big Rock" Heuristic)
The algorithm places the most difficult items first. In scheduling, "Practical/Lab" sessions are the hardest to fit because they require continuous blocks of time (e.g., 3 hours straight).
1.  **Shuffle**: The order of classes is randomized to prevent bias.
2.  **Scan**: For each practical subject, the algorithm scans the week for "Free Windows" that are large enough.
3.  **Heuristic Optimization**: It prefers **Afternoon Slots** for labs (a common academic preference) but will use mornings if afternoons are full.
4.  **Placement**: If a valid window is found (Room is free + Staff is free), the block is locked in.

### Phase 2: Intelligent Distribution (The "Water Filling" Heuristic)
Once the large blocks (Practical labs) are set, the algorithm fills the remaining gaps with Theory classes.
1.  **Priority Queue**: Subjects are dynamically sorted based on **Remaining Hours**. A subject that still needs 4 hours placed is given higher priority than one that needs only 1 hour. This prevents the "last slot" problem where a heavy subject has no space left.
2.  **Conflict Checking**: For every slot, the AI checks:
    - Is the staff member free? (Checks `GlobalStaffBusy`)
    - Has this subject already been taught too much today? (Daily Limit Constraint, e.g., max 2 per day).
    - Is the previous period the same subject? (Avoids boredom, ensures variety).
3.  **Backtracking/Skipping**: If a valid subject cannot be found for a specific slot (due to all valid staff being busy elsewhere), the slot is marked as "Free" rather than creating an invalid schedule.

---

## 3. Key Heuristics & Intelligence

The "Intelligence" of the system lies in its heuristics (rules of thumb that guide the search):

1.  **Most Constrained Variable First**: We schedule Practicals before Theory. This is a classic AI strategy: solve the hardest constraints when the schedule is empty and flexible.
2.  **Least Constraining Value**: When choosing a slot for a practical, we try to pick one that leaves the "best" gaps for theory classes (e.g., specific afternoon blocks).
3.  **Load Balancing**: The algorithm tracks `dailyLimits` to ensure students don't have the same subject 4 times in one day.
4.  **Stochastic Search (Randomization)**: By shuffling the input arrays at the start of every generation cycle, the specific permutation of constraints changes. This allows the user to simply click "Generate" again if they don't like the first outcome, effectively exploring different valid "branches" of the solution tree.

## 4. Technical Summary
| Component | Implementation Detail |
| :--- | :--- |
| **Problem Type** | Constraint Satisfaction Problem (CSP) |
| **Search Method** | Greedy Search with Heuristics |
| **Constraint 1** | **Hard Constraint**: Double-booking staff is strictly forbidden. |
| **Constraint 2** | **Hard Constraint**: Fixed breaks (Lunch/Tea) are evaluating first. |
| **Constraint 3** | **Soft Constraint**: Avoid consecutive periods of the same subject. |
| **Constraint 4** | **Soft Constraint**: Spread subjects evenly across the week. |

This approach ensures that the generated timetable is not just "valid" (no errors) but also "human-friendly" (balanced and logical).

---

## 5. Tools and Technology Stack

The project relies on a modern, full-stack JavaScript architecture (MERN Stack + Mobile) to ensure scalability, performance, and cross-platform compatibility.

### Frontend (Mobile & Web)
*   **React Native (via Expo)**: The core framework for building the user interface. It allows us to write code once and run it natively on both Android and iOS, as well as on the Web. Expo is used for its managed workflow, simplifying build and deployment.
*   **React Navigation**: Handles the complex navigation implementation, including Stack and Drawer navigators, ensuring smooth transitions between screens.
*   **Axios**: A promise-based HTTP client used to communicate with the Backend APIs. It handles request/response interception and error handling efficiently.
*   **UI Components**:
    *   **Expo Linear Gradient**: Used extensively for the premium, aesthetic UI design (e.g., maroon gradients).
    *   **Lucide React Native**: Provides a consistent, clean set of vector icons.
*   **Device Features**:
    *   **Expo Location & Maps**: For transport tracking features.
    *   **Expo Image/Document Picker**: For uploading profile pictures and assignments.

### Backend (Server & Database)
*   **Node.js**: The runtime environment that allows JavaScript to run on the server side. It is non-blocking and event-driven, making it ideal for handling multiple concurrent requests (like timetable generation).
*   **Express.js**: A minimal and flexible web application framework for Node.js. It organizes the API routes, middleware, and request handling logic.
*   **MongoDB & Mongoose**:
    *   **MongoDB**: A NoSQL database that stores data in flexible, JSON-like documents. This is crucial for our complex, nested data structures like Timetables (which have varying slots, days, and subjects).
    *   **Mongoose**: An Object Data Modeling (ODM) library that provides a schema-based solution to model the application data, ensuring data integrity (e.g., verifying a Student belongs to a valid Department).
*   **Security**:
    *   **JSON Web Tokens (JWT)**: Used for stateless authentication. When a user logs in, they receive a token which they must present for subsequent requests (e.g., generating a timetable).
    *   **Bcrypt.js**: Used to salt and hash user passwords before storing them in the database, ensuring security even if the database is compromised.
*   **Utilities**:
    *   **Multer**: Middleware for handling `multipart/form-data`, primarily used for uploading files.
    *   **Nodemon**: A development tool that automatically restarts the server when file changes are detected.

---

## 6. Software Requirements

To run this project locally or deploy it, the following software and environment configurations are required:

### Prerequisites
1.  **Node.js**: Version 18.x or higher (LTS recommended).
2.  **npm (Node Package Manager)**: Usually comes with Node.js.
3.  **MongoDB**: A running instance. You can use:
    *   **MongoDB Atlas** (Cloud - Recommended).
    *   **MongoDB Community Server** (Local installation).
4.  **Expo Go App**: Installed on your physical Android/iOS device for testing.
5.  **Git**: For cloning the repository.

### Setup Instructions (Summary)
1.  **Backend Setup**:
    *   Navigate to `/backend`.
    *   Run `npm install` to install dependencies.
    *   Create a `.env` file with `MONGO_URI` and `JWT_SECRET`.
    *   Start with `npm run dev`.
2.  **Frontend Setup**:
    *   Navigate to `/frontend`.
    *   Run `npm install`.
    *   Update `src/api/api.js` with your machine's local IP address.
    *   Start with `npx expo start`.

---

## 7. Project Modules

The application is modularized to handle various aspects of college administration comprehensively.

### 1. User & Role Management
*   **Authentication**: Secure Login/Logout for Admins, Staff, and Students.
*   **Profile Management**: View and edit personal details.
*   **Role-Based Access Control (RBAC)**: Ensures students cannot access Admin features (like generating timetables).

### 2. Academic Administration
*   **Department & Course Management**: Creating and managing the hierarchy of streams and degrees.
*   **Class & Subject Management**: Defining specific classes (e.g., "CSE 3rd Year A") and the subjects they study.
*   **Timetable Generator (The Core AI Module)**:
    *   Automated conflict-free schedule generation.
    *   Manual adjustment capability (Drag-and-drop or slot editing).
    *   Viewers for Students and Staff.

### 3. Student Lifecycle
*   **Attendance**:
    *   **Marking**: Staff marks attendance for specific periods.
    *   **Stats**: Automatic calculation of attendance percentages.
*   **Marks/CIA**: Recording and viewing internal assessment scores.
*   **Leave Management**:
    *   Students apply for leave.
    *   Digital approval workflow for Class Advisors/HODs.
    *   **Bulk Leave**: Handling mass leave events (e.g., festivals).

### 4. Campus Services
*   **Transport Management**:
    *   Bus Route management.
    *   Driver assignment.
    *   Student bus pass allocation.
*   **Hostel Management**:
    *   Room availability and allocation.
    *   Warden dashboards.
*   **Library Management**:
    *   Book cataloging (ISBN, Title, Author).
    *   Issue/Return workflow with due date tracking.
*   **Sports Management**:
    *   Event creation and scheduling.
    *   Team registration.

### 5. Communication & Support
*   **Digital Notice Board**: Admins/HODs broadcast announcements to specific target groups (e.g., "All Staff", "CSE Dept").
*   **Grievance Redressal**: A confidential Complaint Management System for students to report issues.

