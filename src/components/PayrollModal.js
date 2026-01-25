import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const apiUrl = process.env.REACT_APP_API_URL;

const PayrollModal = ({ employee, onClose, onPaymentSuccess }) => {
    // Logic: If Salaried -> Input Hours. If Exempt -> Input Amount (Defaulted to Fixed Period). If Pro -> Input Amount (Defaulted to rate).

    // Initial State Deduction
    const [hours, setHours] = useState(40); // Default 40 for salaried
    const [amount, setAmount] = useState(''); // Gross Amount
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBank, setSelectedBank] = useState('');
    const [loading, setLoading] = useState(false);

    // Breakdown
    const [deductions, setDeductions] = useState({});
    const [totalDeductions, setTotalDeductions] = useState(0);
    const [netPay, setNetPay] = useState(0);

    useEffect(() => {
        fetchBankAccounts();
        initializeAmount();
    }, [employee]);

    useEffect(() => {
        calculateBreakdown(amount);
    }, [amount]);

    const fetchBankAccounts = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/bank-accounts`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setBankAccounts(data);
            if (data.length > 0) setSelectedBank(data[0].account_id);
        } catch (err) {
            console.error(err);
        }
    };

    const initializeAmount = () => {
        let initAmount = 0;
        if (employee.employment_type === 'Salaried') {
            // Default 40 hours * rate
            initAmount = 40 * (parseFloat(employee.pay_rate) || 0);
        } else if (employee.employment_type === 'Exempt') {
            // Fixed Rate for period
            initAmount = parseFloat(employee.pay_rate) || 0;
        } else {
            // Pro Services
            initAmount = parseFloat(employee.pay_rate) || 0;
        }
        setAmount(initAmount.toFixed(2));
    };

    const handleHoursChange = (h) => {
        setHours(h);
        if (employee.employment_type === 'Salaried') {
            const newAmount = h * (parseFloat(employee.pay_rate) || 0);
            setAmount(newAmount.toFixed(2));
        }
    };

    const calculateBreakdown = (grossVal) => {
        const gross = parseFloat(grossVal) || 0;
        let breakdown = {};
        let total = 0;

        if (employee.employment_type === 'Professional Services') {
            if (gross > 500) {
                const ret = (gross - 500) * 0.10;
                breakdown['Retención 10%'] = ret;
                total += ret;
            }
        } else {
            // Apply percentages from employee record
            const getVal = (pct) => gross * ((parseFloat(pct) || 0) / 100);

            const stateTax = getVal(employee.state_tax_percent);
            if (stateTax > 0) breakdown['Income Tax Estatal'] = stateTax;

            const fedTax = getVal(employee.federal_tax_percent);
            if (fedTax > 0) breakdown['Income Tax Federal'] = fedTax;

            const ss = getVal(employee.social_security_percent);
            if (ss > 0) breakdown['Seguro Social'] = ss;

            const med = getVal(employee.medicare_percent);
            if (med > 0) breakdown['Medicare'] = med;

            const ae401k = getVal(employee.employee_401k_percent);
            if (ae401k > 0) breakdown['401k'] = ae401k;

            const disability = getVal(employee.employee_state_disability_percent);
            if (disability > 0) breakdown['Incapacidad'] = disability;

            // Sum all
            total = Object.values(breakdown).reduce((a, b) => a + b, 0);
        }

        setDeductions(breakdown);
        setTotalDeductions(total);
        setNetPay(Math.max(0, gross - total));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/payroll/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    employee_id: employee.employee_id,
                    payment_date: date,
                    gross_amount_override: amount,
                    hours_worked: employee.employment_type === 'Salaried' ? hours : 0,
                    bank_account_id: selectedBank,
                })
            });

            if (res.ok) {
                toast.success('Pago de nómina procesado con éxito');
                onPaymentSuccess();
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.msg || 'Error al procesar pago');
            }
        } catch (err) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="bg-gray-800 px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold text-white">Procesar Nómina</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow">
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Empleado</p>
                        <p className="font-bold text-gray-800 text-lg">{employee.first_name} {employee.last_name_paternal}</p>
                        <p className="text-xs text-gray-500 font-semibold uppercase">{employee.employment_type}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago</label>
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Banco</label>
                                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
                                    <option value="">Seleccione...</option>
                                    {bankAccounts.map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>{acc.account_name} (${parseFloat(acc.current_balance).toFixed(2)})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {employee.employment_type === 'Salaried' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Horas Trabajadas</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" step="0.5" value={hours} onChange={(e) => handleHoursChange(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                                    <span className="text-gray-500 text-sm">x ${employee.pay_rate}/hr</span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Bruto ($)</label>
                            <input
                                type="number" step="0.01" value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg font-semibold text-lg ${employee.employment_type === 'Salaried' ? 'bg-gray-100' : 'bg-white'}`}
                                readOnly={employee.employment_type === 'Salaried'}
                            />
                        </div>

                        {/* Breakdown */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm">
                            <h4 className="font-semibold mb-2 text-gray-700 border-b pb-1">Desglose de Deducciones</h4>
                            {Object.entries(deductions).length === 0 ? (
                                <p className="text-gray-500 italic">No hay deducciones aplicables.</p>
                            ) : (
                                <ul className="space-y-1">
                                    {Object.entries(deductions).map(([name, val]) => (
                                        <li key={name} className="flex justify-between">
                                            <span className="text-gray-600">{name}</span>
                                            <span className="text-red-500 font-medium">-${val.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex justify-between mt-3 pt-3 border-t border-gray-300 font-bold text-base">
                                <span>Pago Neto:</span>
                                <span className="text-green-600">${netPay.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" disabled={loading || !selectedBank} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50">
                            {loading ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayrollModal;
