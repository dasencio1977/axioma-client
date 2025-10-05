// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Invoices from './components/Invoices';
import InvoiceForm from './components/InvoiceForm';
import InvoiceDetail from './components/InvoiceDetail';
import AddPayment from './components/AddPayment';
import Expenses from './components/Expenses';
import Layout from './components/Layout';
import Settings from './components/Settings';
import ProfitLossReport from './components/ProfitLossReport'; // <-- AÑADE
import TrialBalanceReport from './components/TrialBalanceReport'; // <-- AÑADE
import BalanceSheetReport from './components/BalanceSheetReport';
import Products from './components/Products';
import Vendors from './components/Vendors';
import VendorForm from './components/VendorForm';
import Bills from './components/Bills';
import BillForm from './components/BillForm';
import ChartOfAccounts from './components/ChartOfAccounts';
import JournalEntries from './components/JournalEntries';
import JournalEntryForm from './components/JournalEntryForm';
import JournalEntryDetail from './components/JournalEntryDetail';
import CashFlowStatement from './components/CashFlowStatement';
import GeneralLedger from './components/GeneralLedger';
import BankAccounts from './components/BankAccounts';
import BankTransactions from './components/BankTransactions';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="App">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Ruta Protegida */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <Clients />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={<PrivateRoute><Invoices /></PrivateRoute>}
          />
          <Route
            path="/invoices/new"
            element={<PrivateRoute><InvoiceForm /></PrivateRoute>}
          />
          <Route
            path="/invoices/edit/:id"
            element={<PrivateRoute><InvoiceForm /></PrivateRoute>}
          />
          <Route path="/invoices/:id/add-payment"
            element={<PrivateRoute><AddPayment /></PrivateRoute>}
          />

          <Route
            path="/invoices/:id" // <-- Ruta dinámica para ver detalles
            element={<PrivateRoute><InvoiceDetail /></PrivateRoute>}
          />
          <Route
            path="/expenses"
            element={<PrivateRoute><Expenses /></PrivateRoute>}
          />
          <Route path="/reports/profit-loss" element={<PrivateRoute><ProfitLossReport /></PrivateRoute>} />
          <Route path="/reports/trial-balance" element={<PrivateRoute><TrialBalanceReport /></PrivateRoute>} />
          <Route path="/reports/balance-sheet" element={<PrivateRoute><BalanceSheetReport /></PrivateRoute>} />
          <Route path="/reports/cash-flow" element={<PrivateRoute><CashFlowStatement /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/vendors" element={<PrivateRoute><Vendors /></PrivateRoute>} />
          <Route path="/vendors/new" element={<PrivateRoute><VendorForm /></PrivateRoute>} />
          <Route path="/vendors/edit/:id" element={<PrivateRoute><VendorForm /></PrivateRoute>} />
          <Route path="/bills" element={<PrivateRoute><Bills /></PrivateRoute>} />
          <Route path="/bills/new" element={<PrivateRoute><BillForm /></PrivateRoute>} />
          <Route path="/bills/edit/:id" element={<PrivateRoute><BillForm /></PrivateRoute>} />
          <Route path="/chart-of-accounts" element={<PrivateRoute><ChartOfAccounts /></PrivateRoute>} />
          <Route path="/journal-entries" element={<PrivateRoute><JournalEntries /></PrivateRoute>} />
          <Route path="/journal-entries/new" element={<PrivateRoute><JournalEntryForm /></PrivateRoute>} />
          <Route path="/journal-entries/:id" element={<PrivateRoute><JournalEntryDetail /></PrivateRoute>} />
          <Route path="/journal-entries/edit/:id" element={<PrivateRoute><JournalEntryForm /></PrivateRoute>} />
          <Route path="/reports/general-ledger" element={<PrivateRoute><GeneralLedger /></PrivateRoute>} />
          <Route path="/bank-accounts" element={<PrivateRoute><BankAccounts /></PrivateRoute>} />
          <Route path="/bank-accounts/:accountId" element={<PrivateRoute><BankTransactions /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          {/* <Route path="/bank-accounts/:accountId" element={<PrivateRoute><BankTransactions /></PrivateRoute>} /> */}
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;