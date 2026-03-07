import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DownloadCloud, Filter, Search, User, CreditCard,
    Calendar, CheckCircle, XCircle, Clock
} from 'lucide-react';

const PaymentsHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5002/api/payments/history', {
                headers: { 'x-auth-token': token }
            });
            setPayments(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payments:', err);
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (paymentId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5002/api/payments/receipt/${paymentId}`, {
                headers: { 'x-auth-token': token },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error('Error downloading receipt:', err);
            alert('Failed to download receipt');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success': return 'bg-green-100 text-green-800 border-green-200';
            case 'Failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'Refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Success': return <CheckCircle size={16} className="mr-1" />;
            case 'Failed': return <XCircle size={16} className="mr-1" />;
            default: return <Clock size={16} className="mr-1" />;
        }
    };

    const filteredPayments = payments.filter(p =>
        p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
        p.student?.name.toLowerCase().includes(search.toLowerCase()) ||
        p.student?.userId.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-gray-900 tracking-tight">Payments History</h1>
                    <p className="text-gray-500 mt-2">Manage and track student fee transactions</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search student or TXN ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm text-gray-700 font-medium transition-colors">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium transition-colors">
                        <DownloadCloud size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                                <th className="p-4 pl-6">Transaction Detail</th>
                                <th className="p-4">Student</th>
                                <th className="p-4">Fee Category</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPayments.map(payment => (
                                <tr key={payment._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{payment.transactionId || payment.razorpayOrderId}</p>
                                                <p className="text-xs text-gray-500 mt-1">{payment.method}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{payment.student?.name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">{payment.student?.userId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {payment.fee?.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900">₹{payment.amount}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-sm text-gray-600">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(payment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {payment.status === 'Success' && (
                                            <button
                                                onClick={() => handleDownloadReceipt(payment._id)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Receipt
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        No payments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsHistory;
