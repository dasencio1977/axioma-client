import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Eliminamos la importación de './ClientForm.css' y './Settings.css'

const apiUrl = process.env.REACT_APP_API_URL;

const ReconciliationModal = ({ transaction, onClose, onCategorize, onMatch, onDeposit }) => {
    const isIncome = parseFloat(transaction.amount) > 0;
    const [activeTab, setActiveTab] = useState(isIncome ? 'match' : 'categorize'); // Pestaña por defecto

    // Estados para Gasto (categorize)
    const [description, setDescription] = useState(transaction.description);
    const [expenseAccounts, setExpenseAccounts] = useState([]);
    const [selectedExpenseAccount, setSelectedExpenseAccount] = useState('');

    // Estados para Ingreso (match)
    const [unmatchedPayments, setUnmatchedPayments] = useState([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState('');

    // Estados para Ingreso (categorize as deposit)
    const [incomeAccounts, setIncomeAccounts] = useState([]);
    const [selectedCreditAccount, setSelectedCreditAccount] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (isIncome) {
            // Cargar pagos no conciliados para la pestaña 'match'
            fetch(`${apiUrl}/api/reconciliation/unmatched-payments`, { headers: { 'x-auth-token': token } })
                .then(res => res.json())
                .then(data => setUnmatchedPayments(data))
                .catch(err => toast.error("Error al cargar pagos no conciliados."));

            // Cargar cuentas de Ingreso/Pasivo/Patrimonio para la pestaña 'categorize'
            fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
                .then(res => res.json())
                .then(data => setIncomeAccounts(data.filter(acc => ['Ingreso', 'Pasivo', 'Patrimonio'].includes(acc.account_type))))
                .catch(err => toast.error("Error al cargar cuentas de ingreso."));
        } else {
            // Cargar cuentas de Gasto
            fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
                .then(res => res.json())
                .then(data => setExpenseAccounts(data.filter(acc => acc.account_type === 'Gasto')))
                .catch(err => toast.error("Error al cargar cuentas de gasto."));
        }
    }, [isIncome, apiUrl]);

    // --- MANEJADORES DE GUARDADO ---
    const handleCategorize = () => {
        if (!selectedExpenseAccount) return toast.warn('Selecciona una categoría.');
        const account = expenseAccounts.find(acc => acc.account_id === parseInt(selectedExpenseAccount));
        onCategorize({ category: account.account_name, description });
    };

    const handleMatch = () => {
        if (!selectedPaymentId) return toast.warn('Selecciona un pago para vincular.');
        onMatch({ bankTransactionId: transaction.transaction_id, paymentId: selectedPaymentId });
    };

    const handleDeposit = () => {
        if (!selectedCreditAccount) return toast.warn('Selecciona una cuenta para acreditar.');
        onDeposit({ bankTransactionId: transaction.transaction_id, creditAccountId: selectedCreditAccount, description });
    };

    // --- Componentes Internos de Formulario (para consistencia) ---
    const FormInput = ({ label, name, value, ...props }) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <input id={name} name={name} value={value || ''} {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
    );
    const FormSelect = ({ label, name, value, children, ...props }) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <select id={name} name={name} value={value || ''} {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {children}
            </select>
        </div>
    );
    // --- Fin Componentes Internos ---

    return (
        // Overlay del Modal
        <div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            {/* Contenido del Modal */}
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg"
                onClick={e => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
            >
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Conciliar Transacción</h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p><strong>Fecha:</strong> {new Date(transaction.transaction_date).toLocaleDateString()}</p>
                    <p><strong>Descripción del Banco:</strong> {transaction.description}</p>
                </div>

                {isIncome ? (
                    // --- VISTA PARA INGRESOS (CON PESTAÑAS) ---
                    <div>
                        <p className="text-lg font-medium mb-4">
                            <strong>Monto Recibido:</strong>
                            <span className="text-green-600 ml-2">${parseFloat(transaction.amount).toFixed(2)}</span>
                        </p>
                        {/* Pestañas */}
                        <div className="flex border-b border-gray-200 mb-4">
                            <button type="button" onClick={() => setActiveTab('match')}
                                className={`py-3 px-4 text-sm font-medium focus:outline-none ${activeTab === 'match' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                                Vincular Pago de Cliente
                            </button>
                            <button type="button" onClick={() => setActiveTab('categorize')}
                                className={`py-3 px-4 text-sm font-medium focus:outline-none ${activeTab === 'categorize' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                                Categorizar Otro Ingreso
                            </button>
                        </div>
                        {/* Contenido de Pestañas */}
                        {activeTab === 'match' ? (
                            <div>
                                <FormSelect label="Vincular con Pago de Cliente" name="paymentId" value={selectedPaymentId} onChange={(e) => setSelectedPaymentId(e.target.value)}>
                                    <option value="">Selecciona un pago...</option>
                                    {unmatchedPayments.map(p => (
                                        <option key={p.payment_id} value={p.payment_id}>
                                            ${p.amount_paid} - {p.client_name} (Factura #{p.invoice_number})
                                        </option>
                                    ))}
                                </FormSelect>
                                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                                    <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={onClose}>Cancelar</button>
                                    <button type="button" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700" onClick={handleMatch}>Vincular y Conciliar</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <FormInput label="Descripción para el Asiento" name="description" value={description} onChange={(e) => setDescription(e.target.value)} type="text" />
                                <FormSelect label="Acreditar a la cuenta (Ingreso, Pasivo, Patrimonio)" name="creditAccountId" value={selectedCreditAccount} onChange={(e) => setSelectedCreditAccount(e.target.value)}>
                                    <option value="">Selecciona cuenta...</option>
                                    {incomeAccounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>)}
                                </FormSelect>
                                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                                    <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={onClose}>Cancelar</button>
                                    <button type="button" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700" onClick={handleDeposit}>Guardar y Conciliar</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // --- VISTA PARA GASTOS (SIMPLE) ---
                    <div>
                        <p className="text-lg font-medium mb-4">
                            <strong>Monto Pagado:</strong>
                            <span className="text-red-600 ml-2">(${Math.abs(parseFloat(transaction.amount)).toFixed(2)})</span>
                        </p>
                        <FormInput label="Descripción para el Gasto" name="description" value={description} onChange={(e) => setDescription(e.target.value)} type="text" />
                        <FormSelect label="Categorizar como Gasto en:" name="expenseAccount" value={selectedExpenseAccount} onChange={(e) => setSelectedExpenseAccount(e.target.value)}>
                            <option value="">Selecciona una cuenta de gasto...</option>
                            {expenseAccounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>)}
                        </FormSelect>
                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                            <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={onClose}>Cancelar</button>
                            <button type="button" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700" onClick={handleCategorize}>Guardar y Conciliar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ReconciliationModal;