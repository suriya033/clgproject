# Payment Integration System - Implementation Blueprint

## Strategy & Decisions
- **Gateway**: Razorpay (supports UPI, Netbanking, Cards) as MVP.
- **Verification Strategy**: Hybrid. Main source of truth is frontend verification pass-through + active Razorpay order verification. We will also implement a webhooks endpoint as a fallback.
- **Notifications & Receipts**: `pdfkit` for in-memory PDF generation, `nodemailer` for email delivery.

## Phase 1: Backend Infrastructure Development 
### 1. Dependencies Setup
- Install: `razorpay`, `pdfkit`, `nodemailer`, `crypto` (built-in).
### 2. Database Models
- Create `Payment.js` model:
  - `student`, `fee`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `amount`, `status` (Created, Success, Failed, Refunded), `method`.
### 3. Payment Gateway Controller & Routes (`paymentController.js`, `routes/paymentRoutes.js`)
- `POST /create-order`: Initializes Razorpay SDK to create an order mapped to a specific internal `feeId`.
- `POST /verify-payment`: Validates the `razorpaySignature`. On success, updates `Payment` and `Fee` status to 'Paid'. Automatically triggers PDF Receipt generator & Email.
- `POST /webhook`: Webhook endpoint for Razorpay to update status if the browser closes prematurely.
- `GET /receipt/:paymentId`: Generates and streams PDF Receipt to the client.
- `GET /history`: Fetch payment history for students / admins.
- `POST /refund`: Admin route to issue refund via Razorpay `payments.refund`.

## Phase 2: Frontend Implementation (Student App)
### 1. Fee Dashboard Route
- Fetch all assigned fees for the student.
- Display cards with details (Amount, Type, Due Date, Status).
### 2. Payment Flow Integration
- Clicking `Pay Now` calls `/create-order`.
- Loads `https://checkout.razorpay.com/v1/checkout.js`.
- Upon successful capture, calls `/verify-payment` and displays Success UI with a "Download Receipt" button linking to `/receipt/:paymentId`.

## Phase 3: Admin Portal Implementation
### 1. Payment Management Screen
- Fetch `/history`.
- Data table displaying all transactions with search (student, transaction ID), and filters (date, status, department).
- Action buttons: "Download Receipt", "Manual Verify" (sync with Razorpay if pending), "Initiate Refund".

## Execution Order
1. Backend Setup & API logic.
2. PDF Receipt Generation Logic.
3. React Admin Portal - Payment UI.
4. React Frontend (Student) - Payment UI & Razorpay Checkout.
