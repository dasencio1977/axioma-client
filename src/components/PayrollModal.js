
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const apiUrl = process.env.REACT_APP_API_URL;

const PayrollModal = ({ employee, periodId, onClose, onPaymentSuccess }) => {
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
    const [earnings, setEarnings] = useState({}); // New state for Earnings Breakdown
    const [totalDeductions, setTotalDeductions] = useState(0);
    const [netPay, setNetPay] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false);

    // Ad-Hoc Deduction Items
    const [availableDeductions, setAvailableDeductions] = useState([]);
    const [selectedDeductionToAdd, setSelectedDeductionToAdd] = useState('');

    useEffect(() => {
        fetchBankAccounts();
        fetchPayrollItems();
        initializeAmount();
    }, [employee]);

    useEffect(() => {
        if (!isManualEdit) {
            calculateBreakdown(amount);
        } else {
            updateTotals(deductions, amount);
        }
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

    const fetchPayrollItems = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/payroll-items`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                // Filter for deductions only
                const deductionItems = data.filter(item => item.type === 'Deduction');
                setAvailableDeductions(deductionItems);
            }
        } catch (err) {
            console.error('Error fetching payroll items:', err);
        }
    };

    const initializeAmount = () => {
        // Use logic similar to calculateTotalGross but with default hours (40 or 0)
        let defaultHours = 40;
        if (employee.employment_type !== 'Salaried') defaultHours = 0;
        setHours(defaultHours); // Set state
        calculateTotalGross(defaultHours);
    };

    const handleHoursChange = (h) => {
        setHours(h);
        if (employee.employment_type === 'Salaried') {
            calculateTotalGross(h);
        }
    };

    const calculateBreakdown = (grossVal) => {
        const gross = parseFloat(grossVal) || 0;
        let breakdown = {};

        // 1. Calculate Statutory Deductions (Based on TOTAL Gross)
        if (employee.employment_type === 'Professional Services') {
            if (gross > 500) {
                const ret = (gross - 500) * 0.10;
                breakdown['Retención 10%'] = ret.toFixed(2);
            }
        } else {
            // Apply percentages from employee record
            const getVal = (pct) => (gross * ((parseFloat(pct) || 0) / 100)).toFixed(2);

            if (parseFloat(employee.state_tax_percent) > 0) breakdown['Income Tax Estatal'] = getVal(employee.state_tax_percent);
            if (parseFloat(employee.federal_tax_percent) > 0) breakdown['Income Tax Federal'] = getVal(employee.federal_tax_percent);
            if (parseFloat(employee.social_security_percent) > 0) breakdown['Seguro Social'] = getVal(employee.social_security_percent);
            if (parseFloat(employee.medicare_percent) > 0) breakdown['Medicare'] = getVal(employee.medicare_percent);
            if (parseFloat(employee.employee_401k_percent) > 0) breakdown['401k'] = getVal(employee.employee_401k_percent);
            if (parseFloat(employee.employee_state_disability_percent) > 0) breakdown['Incapacidad'] = getVal(employee.employee_state_disability_percent);

            // 401k Loan
            const loanRepay = parseFloat(employee.loan_repayment_401k_amount) || 0;
            if (loanRepay > 0) breakdown['Préstamo 401k'] = loanRepay.toFixed(2);
        }

        // 2. Calculate Dynamic Deductions (Payroll Items)
        const payrollItems = employee.payroll_items || [];
        payrollItems.forEach(item => {
            if (item.type === 'Deduction' || (item.type === 'Tax' && item.name !== 'Income Tax')) {
                let val = 0;
                const rate = parseFloat(item.rate_override) || parseFloat(item.default_rate) || 0;

                if (item.calculation_type === 'Fixed Amount') {
                    val = rate;
                } else if (item.calculation_type === 'Percentage of Gross') {
                    val = gross * (rate / 100);
                }

                if (val > 0) {
                    breakdown[item.name] = val.toFixed(2);
                }
            }
        });

        setDeductions(breakdown);
        updateTotals(breakdown, gross);
    };

    const calculateTotalGross = (baseHours) => {
        let basePay = 0;
        if (employee.employment_type === 'Salaried') {
            basePay = baseHours * (parseFloat(employee.pay_rate) || 0);
        } else {
            basePay = parseFloat(employee.pay_rate) || 0;
            if (employee.employment_type === 'Exempt') {
                const salary = parseFloat(employee.annual_salary) || 0;
                let divisor = 52;
                switch (employee.payment_frequency) {
                    case 'Weekly': divisor = 52; break;
                    case 'BiWeekly': divisor = 26; break;
                    case 'SemiMonthly': divisor = 24; break;
                    case 'Monthly': divisor = 12; break;
                }
                basePay = salary / divisor;
            }
        }

        let earningsTotal = 0;
        let earningsBreakdown = {};
        const payrollItems = employee.payroll_items || [];

        payrollItems.forEach(item => {
            if (item.type === 'Earning') {
                let val = 0;
                const rate = parseFloat(item.rate_override) || parseFloat(item.default_rate) || 0;

                if (item.calculation_type === 'Fixed Amount') {
                    val = rate;
                } else if (item.calculation_type === 'Hourly Rate') {
                    val = rate * baseHours;
                } else if (item.calculation_type === 'Percentage of Gross') {
                    val = basePay * (rate / 100);
                }

                if (val > 0) {
                    earningsTotal += val;
                    earningsBreakdown[item.name] = val.toFixed(2);
                }
            }
        });

        const total = basePay + earningsTotal;
        setEarnings(earningsBreakdown);
        setAmount(total.toFixed(2));
        setIsManualEdit(false);
        calculateBreakdown(total);
    };

    const updateTotals = (currentDeductions, grossVal) => {
        const gross = parseFloat(grossVal) || 0;
        const total = Object.values(currentDeductions).reduce((a, b) => a + (parseFloat(b) || 0), 0);
        setTotalDeductions(total);
        setNetPay(Math.max(0, gross - total));
    };

    const handleDeductionChange = (name, value) => {
        setIsManualEdit(true);
        const newDeductions = { ...deductions, [name]: value };
        setDeductions(newDeductions);
        updateTotals(newDeductions, amount);
    };

    const handleAddDeduction = () => {
        if (!selectedDeductionToAdd) return;

        const item = availableDeductions.find(i => i.item_id === parseInt(selectedDeductionToAdd));
        if (!item) return;

        // Calculate Default Amount
        const gross = parseFloat(amount) || 0;
        let val = 0;
        const rate = parseFloat(item.default_rate) || 0;

        if (item.calculation_type === 'Fixed Amount') {
            val = rate;
        } else if (item.calculation_type === 'Percentage of Gross') {
            val = gross * (rate / 100);
        }

        setIsManualEdit(true);
        const newDeductions = { ...deductions, [item.name]: val.toFixed(2) };
        setDeductions(newDeductions);
        updateTotals(newDeductions, amount);
        setSelectedDeductionToAdd(''); // Reset selection
    };

    const handleRemoveDeduction = (name) => {
        setIsManualEdit(true);
        const newDeductions = { ...deductions };
        delete newDeductions[name];
        setDeductions(newDeductions);
        updateTotals(newDeductions, amount);
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
                    period_id: periodId,
                    payment_date: date,
                    gross_amount_override: amount,
                    hours_worked: employee.employment_type === 'Salaried' ? hours : 0,
                    bank_account_id: selectedBank,
                    deduction_details: deductions
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

                        {/* Earnings Breakdown */}
                        {Object.keys(earnings).length > 0 && (
                            <div className="bg-green-50 p-4 rounded-md border border-green-200 text-sm">
                                <h4 className="font-semibold mb-2 text-green-800 border-b border-green-200 pb-1">Desglose de Ingresos Adicionales</h4>
                                <ul className="space-y-2">
                                    {Object.entries(earnings).map(([name, val]) => (
                                        <li key={name} className="flex justify-between items-center bg-white p-2 border border-green-100 rounded">
                                            <span className="text-gray-600 text-sm">{name}</span>
                                            <span className="text-green-600 font-medium">+${val}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Breakdown */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm">
                            <h4 className="font-semibold mb-2 text-gray-700 border-b pb-1">Desglose de Deducciones (Editable)</h4>

                            {/* Add Deduction */}
                            <div className="flex gap-2 mb-3">
                                <select
                                    className="flex-grow border rounded px-2 py-1 text-xs"
                                    value={selectedDeductionToAdd}
                                    onChange={(e) => setSelectedDeductionToAdd(e.target.value)}
                                >
                                    <option value="">Agregar deducción...</option>
                                    {availableDeductions.map(item => (
                                        <option key={item.item_id} value={item.item_id}>{item.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddDeduction}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                >
                                    + Add
                                </button>
                            </div>

                            {Object.entries(deductions).length === 0 ? (
                                <p className="text-gray-500 italic">No hay deducciones aplicables.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {Object.entries(deductions).map(([name, val]) => (
                                        <li key={name} className="flex justify-between items-center bg-white p-2 border rounded">
                                            <div className="flex items-center h-full">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDeduction(name)}
                                                    className="text-red-400 hover:text-red-600 mr-2"
                                                    title="Remover"
                                                >
                                                    &times;
                                                </button>
                                                <span className="text-gray-600 text-sm">{name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400 text-sm">-$</span>
                                                <input
                                                    type="number" step="0.01"
                                                    value={val}
                                                    onChange={(e) => handleDeductionChange(name, e.target.value)}
                                                    className="w-24 border rounded px-1 text-right font-medium text-red-600 focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex justify-between mt-3 pt-3 font-medium text-gray-700">
                                <span>Total Deducciones:</span>
                                <span className="text-red-600">-${totalDeductions.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between mt-2 pt-3 border-t border-gray-300 font-bold text-base">
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
