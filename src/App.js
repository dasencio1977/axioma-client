import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importación de Páginas y Componentes
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import ClientForm from './components/ClientForm';
import ClientStatement from './components/ClientStatement';

import Invoices from './components/Invoices';
import InvoiceForm from './components/InvoiceForm';
import InvoiceDetail from './components/InvoiceDetail';
import Vendors from './components/Vendors';
import VendorForm from './components/VendorForm';
import Bills from './components/Bills';
import BillForm from './components/BillForm';
import Expenses from './components/Expenses';
import Products from './components/Products';
import BankAccounts from './components/BankAccounts';
import BankTransactions from './components/BankTransactions';
import ChartOfAccounts from './components/ChartOfAccounts';
import JournalEntries from './components/JournalEntries';
import JournalEntryForm from './components/JournalEntryForm';
import Settings from './components/Settings';
import ProfitLossReport from './components/ProfitLossReport';
import TrialBalanceReport from './components/TrialBalanceReport';
import BalanceSheetReport from './components/BalanceSheetReport';
import CashFlowStatement from './components/CashFlowStatement';
import GeneralLedger from './components/GeneralLedger';
import AddPayment from './components/AddPayment';
import Estimates from './components/Estimates';
import EstimateForm from './components/EstimateForm';
import RecurringInvoices from './components/RecurringInvoices';
import RecurringInvoiceForm from './components/RecurringInvoiceForm';

// Componente de Ruta Privada
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
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Privadas (envueltas por el Layout) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/clients/new" element={<PrivateRoute><ClientForm /></PrivateRoute>} />
        <Route path="/clients/edit/:id" element={<PrivateRoute><ClientForm /></PrivateRoute>} />
        <Route path="/clients/statement" element={<PrivateRoute><ClientStatement /></PrivateRoute>} />


        <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
        <Route path="/invoices/new" element={<PrivateRoute><InvoiceForm /></PrivateRoute>} />
        <Route path="/invoices/edit/:id" element={<PrivateRoute><InvoiceForm /></PrivateRoute>} />
        <Route path="/invoices/:id" element={<PrivateRoute><InvoiceDetail /></PrivateRoute>} />
        <Route path="/invoices/:id/add-payment" element={<PrivateRoute><AddPayment /></PrivateRoute>} />

        <Route path="/estimates" element={<PrivateRoute><Estimates /></PrivateRoute>} />
        <Route path="/estimates/new" element={<PrivateRoute><EstimateForm /></PrivateRoute>} />
        <Route path="/estimates/edit/:id" element={<PrivateRoute><EstimateForm /></PrivateRoute>} />

        <Route path="/recurring-invoices" element={<PrivateRoute><RecurringInvoices /></PrivateRoute>} />
        <Route path="/recurring-invoices/new" element={<PrivateRoute><RecurringInvoiceForm /></PrivateRoute>} />
        <Route path="/recurring-invoices/edit/:id" element={<PrivateRoute><RecurringInvoiceForm /></PrivateRoute>} />

        <Route path="/vendors" element={<PrivateRoute><Vendors /></PrivateRoute>} />
        <Route path="/vendors/new" element={<PrivateRoute><VendorForm /></PrivateRoute>} />
        <Route path="/vendors/edit/:id" element={<PrivateRoute><VendorForm /></PrivateRoute>} />

        <Route path="/bills" element={<PrivateRoute><Bills /></PrivateRoute>} />
        <Route path="/bills/new" element={<PrivateRoute><BillForm /></PrivateRoute>} />
        <Route path="/bills/edit/:id" element={<PrivateRoute><BillForm /></PrivateRoute>} />

        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />

        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />

        <Route path="/bank-accounts" element={<PrivateRoute><BankAccounts /></PrivateRoute>} />
        <Route path="/bank-accounts/:accountId" element={<PrivateRoute><BankTransactions /></PrivateRoute>} />

        <Route path="/chart-of-accounts" element={<PrivateRoute><ChartOfAccounts /></PrivateRoute>} />
        <Route path="/journal-entries" element={<PrivateRoute><JournalEntries /></PrivateRoute>} />
        <Route path="/journal-entries/new" element={<PrivateRoute><JournalEntryForm /></PrivateRoute>} />
        <Route path="/journal-entries/edit/:id" element={<PrivateRoute><JournalEntryForm /></PrivateRoute>} />

        <Route path="/reports/profit-loss" element={<PrivateRoute><ProfitLossReport /></PrivateRoute>} />
        <Route path="/reports/trial-balance" element={<PrivateRoute><TrialBalanceReport /></PrivateRoute>} />
        <Route path="/reports/balance-sheet" element={<PrivateRoute><BalanceSheetReport /></PrivateRoute>} />
        <Route path="/reports/cash-flow" element={<PrivateRoute><CashFlowStatement /></PrivateRoute>} />
        <Route path="/reports/general-ledger" element={<PrivateRoute><GeneralLedger /></PrivateRoute>} />

        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;