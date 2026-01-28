# Verification Plan

## Objective
Verify that the "Edit" functionality works across all implemented modules and data persists to the backend.

## 1. Notice Management
- [ ] Navigate to Notice Board.
- [ ] Tap the "Edit" (pencil) icon on a notice you created.
- [ ] Verify the modal opens with pre-filled data.
- [ ] Change the title or content.
- [ ] Tap "Update Notice".
- [ ] Verify the notice list updates with the new content (Persisted).

## 2. Fee Management
- [ ] Navigate to Fee Management.
- [ ] Tap the "Edit" icon on a fee record.
- [ ] Change the Amount or Due Date.
- [ ] Tap "Update Fee Entry".
- [ ] Verify the record reflects the changes.

## 3. Library Management
- [ ] Navigate to Library Portal -> All Books.
- [ ] Tap the "Edit" icon on a book.
- [ ] Change the Quantity or Author.
- [ ] Tap "Update Item".
- [ ] Verify the book details are updated.

## 4. Transport Management
- [ ] Navigate to Transport Portal -> Buses.
- [ ] Tap the "Edit" icon on a bus.
- [ ] Change the Route or Driver Name.
- [ ] Tap "Update Bus".
- [ ] Verify the bus details are updated.

## 5. Sports Management (Backend Integrated)
- [ ] Navigate to Sports Management.
- [ ] **Events Tab:**
    - [ ] Add a new Event (e.g., "Cricket Match").
    - [ ] Verify it appears in the list.
    - [ ] Tap "Edit" on the event.
    - [ ] Change the Venue or Time.
    - [ ] Tap "Update".
    - [ ] Verify the change persists (Refresh/Re-login to be sure).
- [ ] **Teams Tab:**
    - [ ] Add a new Team (e.g., "Cricket Team").
    - [ ] Verify it appears.
    - [ ] Tap "Edit".
    - [ ] Change the Captain.
    - [ ] Tap "Update".
    - [ ] Verify the change persists.

## 6. Hostel Management (Backend Integrated)
- [ ] Navigate to Hostel Management -> Rooms.
- [ ] Add a new Room (e.g., "201", Capacity 2).
- [ ] Verify it appears.
- [ ] Tap "Edit" on the Room.
- [ ] Change Capacity or Type.
- [ ] Tap "Update Room".
- [ ] Verify the room details update and persist.

## 7. Exam Cell - AI Timetable
- [ ] Navigate to "Exam Cell".
- [ ] Verify the "Ai Timetable" tab is active.
- [ ] Enter "Number of Classes" (e.g. 5).
- [ ] Enter "Number of Staffs" (e.g. 10).
- [ ] Tap "Generate Timetable".
- [ ] Wait for the generation (simulated delay).
- [ ] Verify a Modal appears with the generated timetable.
- [ ] Check if the timetable contains schedules for Class 1 to Class 5.

## 8. Class Management (HOD)
- [ ] Log in as HOD (or Admin).
- [ ] Navigate to "Class Management" (from Dashboard).
- [ ] Tap "+" to Add a new Class.
- [ ] Enter "Name" (e.g. CSE), "Section" (e.g. A), "Year" (e.g. 2025).
- [ ] Tap the "Select a Teacher" dropdown in "Assign Class Advisor".
- [ ] Select a teacher (staff or HOD).
- [ ] Tap "Create Class".
- [ ] Verify the class appears with the advisor name.

## 9. Subject Management (Admin)
- [ ] Log in as Admin.
- [ ] Navigate to "Subjects" from the dashboard grid.
- [ ] Tap "+" to Add a Subject.
- [ ] Enter details: Name, Code, Credits, Department.
- [ ] Tap "Create Subject".
- [ ] Verify subject is added to the list.
- [ ] Tap the "Edit" (pencil) icon on a subject.
- [ ] Change credits to 5.
- [ ] Tap "Update Subject".
- [ ] Verify change.

## 10. Transport Tracking
- [ ] **Driver Side:**
    - [ ] Log in as a Driver (use an existing Driver account or create one via Admin).
    - [ ] Ensure a bus is assigned to this driver (matches Driver Name or User ID).
    - [ ] On Dashboard, see "Assigned Vehicle".
    - [ ] Tap "Start Sharing Location".
    - [ ] Grant Location Permissions (Allow While Using App).
    - [ ] Verify status changes to "Sharing Location".
- [ ] **Admin/Transport Side:**
    - [ ] Log in as Admin or Transport Officer.
    - [ ] Navigate to Transport Portal -> Buses.
    - [ ] Find the same bus the driver is driving.
    - [ ] Tap "Track Live".
    - [ ] Verify a map modal opens.
    - [ ] Check if the bus marker is displayed at the driver's current location.
    - [ ] Verify the marker moves if the driver moves (updates every 5s).
