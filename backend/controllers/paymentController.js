const Razorpay = require('razorpay');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Payment = require('../models/Payment');
const Fee = require('../models/Fee');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere', // Fallback for dev
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere'
});

const generateReceiptPDF = async (payment, res) => {
    try {
        const student = await User.findById(payment.student);
        const fee = await Fee.findById(payment.fee);

        const doc = new PDFDocument({ margin: 50 });

        let filename = `Receipt-${payment.transactionId}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('UNIVERSITY MANAGEMENT SYSTEM', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text('Digital Fee Receipt', { align: 'center' });
        doc.moveDown(2);

        // Student Info
        doc.fontSize(12).text(`Student Name: ${student.name}`);
        doc.text(`Register Number: ${student.userId}`);
        doc.text(`Department & Seminar: ${student.department} - Sem ${student.semester}`);
        doc.moveDown(1);

        // Payment Info
        doc.text(`Transaction ID: ${payment.transactionId}`);
        doc.text(`Razorpay ID: ${payment.razorpayPaymentId || payment.razorpayOrderId}`);
        doc.text(`Date of Payment: ${new Date(payment.updatedAt).toLocaleDateString()}`);
        doc.moveDown(1);

        // Fee Details
        doc.rect(50, doc.y, 500, 20).fill('#f0f0f0').stroke();
        doc.fillColor('black').text('Fee Details', 60, doc.y - 15);

        doc.moveDown(1);
        doc.text(`Fee Type: ${fee.type} Fee`);
        doc.text(`Amount Paid: Rs. ${payment.amount}`);
        doc.text('Payment Status: SUCCESS', { fill: 'green' });

        doc.moveDown(3);
        doc.text('This is a computer-generated receipt and requires no signature.', { align: 'center', fontSize: 10, color: 'gray' });

        doc.end();
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating receipt' });
        }
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { feeId } = req.body;
        const studentId = req.user.id;

        const fee = await Fee.findById(feeId);
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        if (fee.status === 'Paid') return res.status(400).json({ message: 'Fee already paid' });

        const options = {
            amount: fee.amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${feeId}`
        };

        const order = await razorpay.orders.create(options);

        // Create initial Payment record
        const payment = new Payment({
            student: studentId,
            fee: feeId,
            amount: fee.amount,
            razorpayOrderId: order.id,
            status: 'Created'
        });
        await payment.save();

        res.json({
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere'
        });
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feeId } = req.body;

        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update Payment
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (!payment) return res.status(404).json({ message: 'Payment record not found' });

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.transactionId = `TXN-${Math.floor(Date.now() / 1000)}`;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'Success';
        payment.paymentDate = new Date();
        // Assuming method is captured from webhook or frontend later, but default to filled
        await payment.save();

        // Update Fee
        await Fee.findByIdAndUpdate(feeId, {
            status: 'Paid',
            paidDate: new Date(),
            transactionId: payment.transactionId
        });

        // Trigger Notification async
        sendPaymentEmail(payment.student, feeId);

        res.json({ message: 'Payment successful', paymentId: payment._id });
    } catch (err) {
        console.error('Error verifying payment:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendPaymentEmail = async (studentId, feeId) => {
    try {
        const student = await User.findById(studentId);
        const fee = await Fee.findById(feeId);
        if (!student || !student.email) return;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'collegeadmin@example.com',
                pass: process.env.EMAIL_PASS || 'password'
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'University Fee Payment Confirmation',
            text: `Dear ${student.name},\n\nYour payment of Rs. ${fee.amount} for ${fee.type} Fee has been successfully received.\n\nTransaction ID: ${fee.transactionId}\n\nThank you,\nUniversity Admin.`
        });
        console.log('Payment notification sent to', student.email);
    } catch (err) {
        console.error('Email sending failed:', err);
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const query = req.user.role === 'Student' ? { student: req.user.id, status: 'Success' } : {};

        let payments = await Payment.find(query)
            .populate('fee', 'type amount')
            .populate('student', 'name userId department')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.downloadReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId);

        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        if (req.user.role === 'Student' && payment.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await generateReceiptPDF(payment, res);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.webhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'YourWebhookSecret';
        const signature = req.headers['x-razorpay-signature'];

        const expectedSignature = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature === signature) {
            const event = req.body.event;
            if (event === 'payment.captured' || event === 'payment.authorized') {
                const razorpay_order_id = req.body.payload.payment.entity.order_id;
                const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
                if (payment && payment.status !== 'Success') {
                    payment.status = 'Success';
                    payment.razorpayPaymentId = req.body.payload.payment.entity.id;
                    await payment.save();

                    await Fee.findByIdAndUpdate(payment.fee, {
                        status: 'Paid',
                        paidDate: new Date()
                    });
                }
            }
            res.status(200).json({ status: 'ok' });
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (err) {
        console.error('Webhook Error', err);
        res.status(500).json({ message: 'Webhook error' });
    }
};

exports.renderCheckout = async (req, res) => {
    try {
        const feeId = req.query.feeId;
        const token = req.query.token;

        res.send(`
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc; margin: 0; }
                    .loader { border: 4px solid #f3f3f3; border-top: 4px solid #800000; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </head>
            <body>
                <div class="loader" id="loader"></div>
                <script>
                    async function initPayment() {
                        try {
                            const res = await fetch('/api/payments/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'x-auth-token': '${token}' },
                                body: JSON.stringify({ feeId: '${feeId}' })
                            });
                            const data = await res.json();
                            if(data.message === 'Fee already paid') {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'already_paid' }));
                                return;
                            }
                            
                            var options = {
                                "key": data.razorpayKeyId,
                                "amount": data.amount,
                                "currency": data.currency,
                                "name": "University Fees",
                                "description": "Fee Payment",
                                "order_id": data.orderId,
                                "handler": async function (response){
                                    document.getElementById('loader').style.display = 'block';
                                    const verifyRes = await fetch('/api/payments/verify', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'x-auth-token': '${token}' },
                                        body: JSON.stringify({
                                            razorpay_order_id: response.razorpay_order_id,
                                            razorpay_payment_id: response.razorpay_payment_id,
                                            razorpay_signature: response.razorpay_signature,
                                            feeId: '${feeId}'
                                        })
                                    });
                                    const verifyData = await verifyRes.json();
                                    window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', data: verifyData }));
                                },
                                "modal": {
                                    "ondismiss": function(){
                                        window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'dismissed' }));
                                    }
                                }
                            };
                            var rzp1 = new Razorpay(options);
                            document.getElementById('loader').style.display = 'none';
                            rzp1.open();
                        } catch (e) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'error', error: e.message }));
                        }
                    }
                    initPayment();
                </script>
            </body>
        </html>
        `);
    } catch (err) {
        res.status(500).send('Error loading checkout');
    }
};
