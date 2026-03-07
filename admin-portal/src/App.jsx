import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import QuestionPapers from './pages/QuestionPapers';
import LoginPage from './pages/LoginPage';
import { Toaster } from 'react-hot-toast';
import './index.css';

import Subjects from './pages/Subjects';
import Transport from './pages/Transport';
import ExamHallAllocation from './pages/ExamHallAllocation';
import AdminAssist from './components/AdminAssist';
import PaymentsHistory from './pages/PaymentsHistory';
import FeeManagement from './pages/FeeManagement';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/*" element={
          <PrivateRoute>
            <div className="dashboard-layout">
              <Sidebar />
              <div className="main-content">
                <Topbar />
                <div className="page-container">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/papers" element={<QuestionPapers />} />
                    <Route path="/colleges" element={<Subjects />} />
                    <Route path="/exam-halls" element={<ExamHallAllocation />} />
                    <Route path="/transport" element={<Transport />} />
                    <Route path="/payments" element={<PaymentsHistory />} />
                    <Route path="/fees" element={<FeeManagement />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </div>
              <AdminAssist />
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
