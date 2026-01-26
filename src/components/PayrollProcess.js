import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PayrollModal from './PayrollModal';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;

const apiUrl = process.env.REACT_APP_API_URL;

const PayrollProcess = () => {
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
    const [payments, setPayments] = useState([]);

    // Payment Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [employeeToPay, setEmployeeToPay] = useState(null);

    // New Period Form
    const [newPeriodData, setNewPeriodData] = useState({
        start_date: '',
        end_date: '',
        payment_frequency: 'Weekly'
    });

    useEffect(() => {
        fetchPeriods();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedPeriod) {
            fetchPayments(selectedPeriod.period_id);
        } else {
            setPayments([]);
        }
    }, [selectedPeriod]);

    const fetchPeriods = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/payroll-periods`, { headers: { 'x-auth-token': token } });
            const data = await res.json();
            setPeriods(Array.isArray(data) ? data : []);
            // Auto select latest open if available
            const open = data.find(p => p.status === 'Open');
            if (open) setSelectedPeriod(open);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/employees`, { headers: { 'x-auth-token': token } });
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPayments = async (periodId) => {
        const token = localStorage.getItem('token');
        try {
            // Fetch all history and filter client-side for now (Optimization: Add query param later)
            const res = await fetch(`${apiUrl}/api/payroll/history`, { headers: { 'x-auth-token': token } });
            const data = await res.json();
            const periodPayments = data.filter(p => p.period_id === periodId);
            setPayments(periodPayments);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreatePeriod = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/payroll-periods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(newPeriodData)
            });
            if (res.ok) {
                toast.success('Periodo creado');
                setShowNewPeriodModal(false);
                fetchPeriods();
            } else {
                toast.error('Error al crear periodo');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePayEmployee = (emp) => {
        if (!selectedPeriod) {
            toast.warn('Seleccione un periodo primero');
            return;
        }
        setEmployeeToPay(emp);
        setShowPaymentModal(true);
    };

    const getPaymentDetails = (empId) => {
        const payment = payments.find(p => p.employee_id === empId);
        if (!payment) return null;

        let details = {};
        try {
            details = typeof payment.deduction_details === 'string'
                ? JSON.parse(payment.deduction_details)
                : payment.deduction_details || {};
        } catch (e) {
            details = {};
        }
        return { ...payment, details };
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Procesar Nómina</h2>
                <button onClick={() => setShowNewPeriodModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <PlusIcon /> Nuevo Periodo
                </button>
            </div>

            {/* Period Selector */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
                <label className="font-semibold text-gray-700">Periodo Activo:</label>
                <select
                    className="border border-gray-300 rounded px-3 py-2 min-w-[300px]"
                    value={selectedPeriod ? selectedPeriod.period_id : ''}
                    onChange={(e) => {
                        const period = periods.find(p => p.period_id === parseInt(e.target.value));
                        setSelectedPeriod(period);
                    }}
                >
                    <option value="">Seleccione un periodo...</option>
                    {periods.map(p => (
                        <option key={p.period_id} value={p.period_id}>
                            {p.payment_frequency} ({new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}) - {p.status}
                        </option>
                    ))}
                </select>
                {selectedPeriod && (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${selectedPeriod.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedPeriod.status === 'Open' ? 'ABIERTO' : 'CERRADO'}
                    </span>
                )}
            </div>

            {/* Employee List for Payment */}
            {selectedPeriod ? ( // Removed status === 'Open' check to view history too? User requirement implied editing/processing.
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-left font-semibold text-gray-600">Empleado</th>
                                <th className="p-4 text-center font-semibold text-gray-600">Horas</th>
                                <th className="p-4 text-right font-semibold text-gray-600">Bruto</th>
                                <th className="p-4 text-right font-semibold text-gray-600 text-xs">401k (Emp)</th>
                                <th className="p-4 text-right font-semibold text-gray-600 text-xs">Préstamo 401k</th>
                                <th className="p-4 text-right font-semibold text-gray-600 text-xs">Inc. Tax</th>
                                <th className="p-4 text-right font-semibold text-gray-600 text-xs">Seg. Soc.</th>
                                <th className="p-4 text-right font-semibold text-gray-600 text-xs">Medicare</th>
                                <th className="p-4 text-right font-semibold text-gray-600 text-xs">Incap.</th>
                                <th className="p-4 text-right font-semibold text-gray-600">Neto</th>
                                <th className="p-4 text-right font-semibold text-gray-600">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map(emp => {
                                const pay = getPaymentDetails(emp.employee_id);
                                const d = pay ? pay.details : {};
                                return (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50 text-sm">
                                        <td className="p-4 font-medium">{emp.first_name} {emp.last_name_paternal}</td>

                                        {/* Hours */}
                                        <td className="p-4 text-center">
                                            {pay ? (pay.hours_worked || '-') : '-'}
                                        </td>

                                        {/* Gross */}
                                        <td className="p-4 text-right text-gray-900 font-semibold">
                                            {pay ? `$${parseFloat(pay.gross_pay).toFixed(2)}` : '-'}
                                        </td>

                                        {/* Pre-Tax / Deductions */}
                                        <td className="p-4 text-right text-gray-600">{d['401k'] ? `-$${parseFloat(d['401k']).toFixed(2)}` : '-'}</td>
                                        <td className="p-4 text-right text-gray-600">{d['Préstamo 401k'] ? `-$${parseFloat(d['Préstamo 401k']).toFixed(2)}` : '-'}</td>

                                        <td className="p-4 text-right text-gray-600">
                                            {(parseFloat(d['Income Tax Estatal'] || 0) + parseFloat(d['Income Tax Federal'] || 0) + parseFloat(d['Retención 10%'] || 0)) > 0
                                                ? `-$${(parseFloat(d['Income Tax Estatal'] || 0) + parseFloat(d['Income Tax Federal'] || 0) + parseFloat(d['Retención 10%'] || 0)).toFixed(2)}`
                                                : '-'}
                                        </td>

                                        <td className="p-4 text-right text-gray-600">{d['Seguro Social'] ? `-$${parseFloat(d['Seguro Social']).toFixed(2)}` : '-'}</td>
                                        <td className="p-4 text-right text-gray-600">{d['Medicare'] ? `-$${parseFloat(d['Medicare']).toFixed(2)}` : '-'}</td>
                                        <td className="p-4 text-right text-gray-600">{d['Incapacidad'] ? `-$${parseFloat(d['Incapacidad']).toFixed(2)}` : '-'}</td>

                                        {/* Net */}
                                        <td className="p-4 text-right font-bold text-green-600">
                                            {pay ? `$${parseFloat(pay.net_pay).toFixed(2)}` : '-'}
                                        </td>

                                        {/* Action */}
                                        <td className="p-4 text-right">
                                            {pay ? (
                                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">PAGADO</span>
                                            ) : (
                                                selectedPeriod.status === 'Open' && (
                                                    <button
                                                        onClick={() => handlePayEmployee(emp)}
                                                        className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-medium"
                                                    >
                                                        Procesar
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-gray-50 p-12 text-center rounded-xl border border-dashed border-gray-300 text-gray-500">
                    {selectedPeriod ? 'Este periodo está cerrado.' : 'Seleccione o cree un periodo para comenzar.'}
                </div>
            )}

            {/* New Period Modal */}
            {showNewPeriodModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Nuevo Periodo de Nómina</h3>
                        <form onSubmit={handleCreatePeriod}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Frecuencia</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={newPeriodData.payment_frequency}
                                        onChange={e => setNewPeriodData({ ...newPeriodData, payment_frequency: e.target.value })}
                                    >
                                        <option value="Weekly">Semanal</option>
                                        <option value="BiWeekly">Bisemanal</option>
                                        <option value="SemiMonthly">Quincenal</option>
                                        <option value="Monthly">Mensual</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                                        <input type="date" required className="w-full border p-2 rounded"
                                            value={newPeriodData.start_date}
                                            onChange={e => setNewPeriodData({ ...newPeriodData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                                        <input type="date" required className="w-full border p-2 rounded"
                                            value={newPeriodData.end_date}
                                            onChange={e => setNewPeriodData({ ...newPeriodData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowNewPeriodModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Crear Periodo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reuse Existing Payroll Modal */}
            {showPaymentModal && employeeToPay && (
                <PayrollModal
                    employee={employeeToPay}
                    periodId={selectedPeriod?.period_id} // Pass period ID
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentSuccess={() => {
                        setShowPaymentModal(false);
                        if (selectedPeriod) fetchPayments(selectedPeriod.period_id);
                    }}
                />
            )}
        </div>
    );
};

export default PayrollProcess;
