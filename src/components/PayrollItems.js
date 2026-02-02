import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const PayrollItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'Earning', // Earning, Deduction, Contribution, Tax
        calculation_type: 'Fixed Amount', // Fixed Amount, Hourly Rate, Percentage
        default_rate: 0,
        expense_account_id: '',
        liability_account_id: ''
    });

    const [accounts, setAccounts] = useState([]); // For dropdowns

    const fetchItems = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/payroll-items`, {
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Error al obtener los items de nómina.');
            const data = await response.json();
            setItems(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccounts = async () => {
        const token = localStorage.getItem('token');
        try {
            // Assuming we have an endpoint for accounts, filtering if possible or just getting all
            const response = await fetch(`${apiUrl}/api/accounts?all=true`, {
                headers: { 'x-auth-token': token },
            });
            if (response.ok) {
                const data = await response.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error("Error fetching accounts", error);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchAccounts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem
            ? `${apiUrl}/api/payroll-items/${editingItem.item_id}`
            : `${apiUrl}/api/payroll-items`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Error al guardar el item.');

            toast.success('Item guardado con éxito');
            setShowForm(false);
            setEditingItem(null);
            setFormData({
                name: '',
                type: 'Earning',
                calculation_type: 'Fixed Amount',
                default_rate: 0,
                expense_account_id: '',
                liability_account_id: ''
            });
            fetchItems();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            type: item.type,
            calculation_type: item.calculation_type,
            default_rate: item.default_rate,
            expense_account_id: item.expense_account_id || '',
            liability_account_id: item.liability_account_id || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de archivar este item?')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/payroll-items/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Error al eliminar el item.');
            toast.success('Item archivado');
            fetchItems();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="p-6">
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Catálogo de Nómina
            </h2>

            <div className="mb-6">
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({
                            name: '',
                            type: 'Earning',
                            calculation_type: 'Fixed Amount',
                            default_rate: 0,
                            expense_account_id: '',
                            liability_account_id: ''
                        });
                        setShowForm(true);
                    }}
                    className="py-2 px-5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    + Nuevo Item
                </button>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4">{editingItem ? 'Editar Item' : 'Nuevo Item'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="Earning">Ingreso (Earning)</option>
                                        <option value="Deduction">Deducción</option>
                                        <option value="Contribution">Contribución Patronal</option>
                                        <option value="Tax">Impuesto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cálculo</label>
                                    <select
                                        name="calculation_type"
                                        value={formData.calculation_type}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="Fixed Amount">Monto Fijo ($)</option>
                                        <option value="Hourly Rate">Tarifa por Hora</option>
                                        <option value="Percentage of Gross">Porcentaje del Bruto (%)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Valor Por Defecto</label>
                                <input
                                    type="number"
                                    name="default_rate"
                                    step="0.0001"
                                    value={formData.default_rate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>

                            {/* Show Account selectors based on Type */}
                            {(formData.type === 'Earning' || formData.type === 'Contribution') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cuenta de Gasto (Expense)</label>
                                    <select
                                        name="expense_account_id"
                                        value={formData.expense_account_id}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="">Seleccionar Cuenta...</option>
                                        {accounts.filter(a => a.account_type === 'Expense').map(acc => (
                                            <option key={acc.account_id} value={acc.account_id}>
                                                {acc.account_name} ({acc.account_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(formData.type === 'Deduction' || formData.type === 'Tax' || formData.type === 'Contribution') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cuenta de Pasivo (Liability)</label>
                                    <select
                                        name="liability_account_id"
                                        value={formData.liability_account_id}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="">Seleccionar Cuenta...</option>
                                        {accounts.filter(a => a.account_type === 'Liability').map(acc => (
                                            <option key={acc.account_id} value={acc.account_id}>
                                                {acc.account_name} ({acc.account_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Nombre</th>
                            <th className="p-4 font-semibold text-gray-600">Tipo</th>
                            <th className="p-4 font-semibold text-gray-600">Cálculo</th>
                            <th className="p-4 font-semibold text-gray-600">Valor Default</th>
                            <th className="p-4 font-semibold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Cargando...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No hay items registrados.</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.item_id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{item.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${item.type === 'Earning' ? 'bg-green-100 text-green-800' :
                                                item.type === 'Deduction' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="p-4">{item.calculation_type}</td>
                                    <td className="p-4">{item.default_rate}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                                        <button onClick={() => handleDelete(item.item_id)} className="text-red-600 hover:text-red-900">Archivar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollItems;
