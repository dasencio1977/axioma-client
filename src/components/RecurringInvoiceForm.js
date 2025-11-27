import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircleIcon, Trash2Icon, ArrowLeftIcon } from './Icons';

const apiUrl = process.env.REACT_APP_API_URL;

const RecurringInvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        client_id: '',
        template_name: '',
        frequency: 'mensual',
        next_run_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'Activa',
        items: []
    });

    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const [clientsRes, productsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/clients?all=true`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/products`, { headers: { 'x-auth-token': token } })
                ]);

                const clientsData = await clientsRes.json();
                const productsData = await productsRes.json();

                setClients(clientsData.clients || clientsData || []);
                setProducts(productsData.products || productsData || []);

                if (isEdit) {
                    const recRes = await fetch(`${apiUrl}/api/recurring-invoices/${id}`, { headers: { 'x-auth-token': token } });
                    if (!recRes.ok) throw new Error('Plantilla no encontrada');
                    const recData = await recRes.json();

                    setFormData({
                        ...recData,
                        next_run_date: recData.next_run_date.split('T')[0],
                        end_date: recData.end_date ? recData.end_date.split('T')[0] : '',
                        items: recData.items.map(item => ({
                            ...item,
                            product_id: item.product_id.toString()
                        }))
                    });
                }
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEdit]);

    const handleClientChange = (e) => {
        setFormData({ ...formData, client_id: e.target.value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'product_id') {
            const product = products.find(p => p.product_id.toString() === value);
            if (product) {
                newItems[index].description = product.description;
                newItems[index].unit_price = product.unit_price;
                newItems[index].item_code = product.item_code;
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', description: '', quantity: 1, unit_price: 0, item_code: '' }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = isEdit ? `${apiUrl}/api/recurring-invoices/${id}` : `${apiUrl}/api/recurring-invoices`;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(isEdit ? 'Plantilla actualizada' : 'Plantilla creada');
                navigate('/recurring-invoices');
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error('Error al guardar');
        }
    };

    if (loading) return <p className="text-center p-8">Cargando...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/recurring-invoices')} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Editar Recurrente' : 'Nueva Recurrente'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Plantilla</label>
                        <input
                            type="text"
                            value={formData.template_name}
                            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Ej: Mantenimiento Mensual"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                        <select
                            value={formData.client_id}
                            onChange={handleClientChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        >
                            <option value="">Seleccione un cliente</option>
                            {clients.map(client => (
                                <option key={client.client_id} value={client.client_id}>{client.client_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                        <select
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="semanal">Semanal</option>
                            <option value="quincenal">Quincenal</option>
                            <option value="mensual">Mensual</option>
                            <option value="anual">Anual</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Ejecución</label>
                        <input
                            type="date"
                            value={formData.next_run_date}
                            onChange={(e) => setFormData({ ...formData, next_run_date: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Opcional)</label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="Activa">Activa</option>
                            <option value="Pausada">Pausada</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Items de la Factura</h3>
                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                    <select
                                        value={item.product_id}
                                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        required
                                    >
                                        <option value="">Seleccionar Producto</option>
                                        {products.map(p => (
                                            <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-[2] min-w-[200px]">
                                    <input
                                        type="text"
                                        value={item.description || ''}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Descripción"
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Cant."
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Precio"
                                        required
                                    />
                                </div>
                                <div className="w-32 pt-2 text-right font-medium text-gray-700">
                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                >
                                    <Trash2Icon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Agregar Item
                    </button>
                </div>

                <div className="border-t border-gray-200 pt-6 flex justify-end items-center gap-6">
                    <div className="text-xl font-bold text-gray-900">
                        Total: ${calculateTotal().toFixed(2)}
                    </div>
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md"
                    >
                        Guardar Plantilla
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecurringInvoiceForm;
