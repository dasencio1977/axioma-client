import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './InvoiceForm.css' y './ClientForm.css'

const apiUrl = process.env.REACT_APP_API_URL;

const InvoiceForm = () => {
    const [invoiceData, setInvoiceData] = useState({
        client_id: '', invoice_number: '', issue_date: new Date().toISOString().slice(0, 10),
        due_date: '', status: 'Borrador',
    });
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([{ product_id: '', description: '', quantity: 1, unit_price: 0, gl_account_id: null }]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    const [subtotal, setSubtotal] = useState(0);
    const [taxDetails, setTaxDetails] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);

    // --- LÓGICA DE DATOS ---
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const [clientsRes, productsRes, profileRes] = await Promise.all([
                    fetch(`${apiUrl}/api/clients?all=true`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/products?all=true`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } })
                ]);
                const clientsData = await clientsRes.json();
                const productsData = await productsRes.json();
                const profileData = await profileRes.json();

                // FIX: Handle clientsData as array (from ?all=true) or object (paginated)
                setClients(Array.isArray(clientsData) ? clientsData : clientsData.clients || []);
                setProducts(productsData || []);
                setProfile(profileData);

                if (id) {
                    const invoiceRes = await fetch(`${apiUrl}/api/invoices/${id}`, { headers: { 'x-auth-token': token } });
                    const invoiceToEdit = await invoiceRes.json();
                    setInvoiceData({
                        client_id: invoiceToEdit.client_id, invoice_number: invoiceToEdit.invoice_number,
                        issue_date: new Date(invoiceToEdit.issue_date).toISOString().slice(0, 10),
                        due_date: new Date(invoiceToEdit.due_date).toISOString().slice(0, 10),
                        status: invoiceToEdit.status,
                    });
                    // Mapear items para asegurar que product_id (string) funcione con el select
                    setItems(invoiceToEdit.items.map(item => ({ ...item, product_id: item.product_id || '' })));
                } else {
                    const nextNumRes = await fetch(`${apiUrl}/api/invoices/next-number`, { headers: { 'x-auth-token': token } });
                    const nextNumData = await nextNumRes.json();
                    setInvoiceData(prev => ({ ...prev, invoice_number: nextNumData.nextInvoiceNumber }));
                }
            } catch (err) {
                toast.error('Error al cargar datos iniciales.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, apiUrl]);

    // Motor de cálculo de impuestos en tiempo real
    useEffect(() => {
        if (!products.length || !profile || !items.length) return;
        let currentSubtotal = 0;
        const taxMap = {};
        items.forEach(item => {
            const lineSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
            currentSubtotal += lineSubtotal;
            const product = products.find(p => p.product_id === parseInt(item.product_id));
            if (product) {
                for (let i = 1; i <= 4; i++) {
                    if (product[`tax${i}_applies`] && profile[`tax${i}_rate`] > 0) {
                        const taxName = product[`tax${i}_name`] || `Impuesto ${i}`;
                        const taxRate = parseFloat(profile[`tax${i}_rate`]);
                        const taxAmount = lineSubtotal * taxRate;
                        if (!taxMap[taxName]) taxMap[taxName] = { rate: taxRate, amount: 0 };
                        taxMap[taxName].amount += taxAmount;
                    }
                }
            }
        });
        const calculatedTaxDetails = Object.keys(taxMap).map(name => ({ name, ...taxMap[name] }));
        const totalTaxes = calculatedTaxDetails.reduce((sum, tax) => sum + tax.amount, 0);
        setSubtotal(currentSubtotal);
        setTaxDetails(calculatedTaxDetails);
        setGrandTotal(currentSubtotal + totalTaxes);
    }, [items, products, profile]);

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = [...items];
        if (name === 'product_id') {
            const product = products.find(p => p.product_id === parseInt(value));
            if (product) {
                updatedItems[index] = { ...updatedItems[index], product_id: value, description: product.name, unit_price: product.price, item_code: product.code, gl_account_id: product.gl_account_id };
            } else {
                updatedItems[index] = { product_id: '', item_code: '', description: '', quantity: 1, unit_price: 0, gl_account_id: null };
            }
        } else {
            updatedItems[index][name] = value;
        }
        setItems(updatedItems);
    };

    const addItem = () => setItems([...items, { product_id: '', item_code: '', description: '', quantity: 1, unit_price: 0, gl_account_id: null }]);
    const removeItem = (index) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
    const handleInvoiceChange = (e) => setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const finalInvoice = { ...invoiceData, items }; // El backend recalculará los totales
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/api/invoices/${id}` : `${apiUrl}/api/invoices`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(finalInvoice) });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || `Error al ${id ? 'actualizar' : 'crear'} la factura.`);
            }
            toast.success(`Factura ${id ? 'actualizada' : 'creada'} con éxito.`);
            navigate('/invoices');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando formulario...</p>;

    // --- JSX REFACTORIZADO ---
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">
                {id ? 'Editar Factura' : 'Crear Nueva Factura'}
            </h2>
            <form onSubmit={handleSubmit}>
                {/* --- Datos Generales --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <label htmlFor="client_id" className="block text-sm font-bold text-gray-700 mb-2">Cliente</label>
                        <select id="client_id" name="client_id" value={invoiceData.client_id} onChange={handleInvoiceChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Selecciona un Cliente</option>
                            {clients.map(client => (
                                <option key={client.client_id} value={client.client_id}>{client.client_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="invoice_number" className="block text-sm font-bold text-gray-700 mb-2">Nº Factura</label>
                        <input id="invoice_number" type="text" name="invoice_number" value={invoiceData.invoice_number} onChange={handleInvoiceChange} readOnly required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                        <select id="status" name="status" value={invoiceData.status} onChange={handleInvoiceChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Borrador">Borrador</option>
                            <option value="Enviada">Enviada</option>
                            <option value="Vencida">Vencida</option>
                            <option value="Anulada">Anulada</option>
                            <option value="Pagada">Pagada</option>
                            <option value="Parcial">Parcialmente Pagada</option>
                        </select>
                    </div>
                    <div className="md:col-span-2"></div>
                    <div>
                        <label htmlFor="issue_date" className="block text-sm font-bold text-gray-700 mb-2">Fecha de Emisión</label>
                        <input id="issue_date" type="date" name="issue_date" value={invoiceData.issue_date} onChange={handleInvoiceChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="due_date" className="block text-sm font-bold text-gray-700 mb-2">Fecha de Vencimiento</label>
                        <input id="due_date" type="date" name="due_date" value={invoiceData.due_date} onChange={handleInvoiceChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                {/* --- Items --- */}
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Items</h3>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[700px]">
                        {/* Encabezado de Items */}
                        <div className="grid grid-cols-[1.5fr,4fr,1fr,1.5fr,1.5fr,auto] gap-4 pb-2 border-b-2 border-gray-300 mb-2">
                            <div className="font-bold text-gray-600 text-sm">Item</div>
                            <div className="font-bold text-gray-600 text-sm">Descripción</div>
                            <div className="font-bold text-gray-600 text-sm">Cantidad</div>
                            <div className="font-bold text-gray-600 text-sm">Precio Unit.</div>
                            <div className="font-bold text-gray-600 text-sm text-right">Total Línea</div>
                            <div className="w-10"></div>
                        </div>
                        {/* Filas de Items */}
                        {items.map((item, index) => {
                            const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                            return (
                                <div key={index} className="grid grid-cols-[1.5fr,4fr,1fr,1.5fr,1.5fr,auto] gap-4 items-center mb-2 pb-2 border-b border-gray-100">
                                    <select name="product_id" value={item.product_id} onChange={(e) => handleItemChange(index, e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Seleccionar...</option>
                                        {products.filter(p => p.product_type === 'Ingreso' || p.product_type === 'Inventario').map(p => (
                                            <option key={p.product_id} value={p.product_id}>{p.code || p.name}</option>
                                        ))}
                                    </select>
                                    <input type="text" name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} placeholder="Descripción" required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} min="0" step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    <div className="text-right font-medium text-gray-700">${lineTotal.toFixed(2)}</div>
                                    <div className="flex items-center justify-end">
                                        <button type="button" onClick={() => removeItem(index)} title="Eliminar Item"
                                            className="text-red-500 hover:text-red-700 text-xl p-1">
                                            🗑️
                                        </button>
                                        {index === items.length - 1 && (
                                            <button type="button" onClick={addItem} title="Añadir Item"
                                                className="w-8 h-8 rounded-full bg-green-500 text-white text-2xl flex items-center justify-center ml-1 hover:bg-green-600">
                                                +
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Totales --- */}
                <div className="mt-8 flex justify-end">
                    <div className="w-full max-w-sm space-y-2 text-gray-700">
                        <div className="flex justify-between">
                            <span className="font-semibold">Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {taxDetails.map(tax => (
                            <div key={tax.name} className="flex justify-between">
                                <span className="pl-4">{tax.name} ({(tax.rate * 100).toFixed(2)}%):</span>
                                <span>${tax.amount.toFixed(2)}</span>
                            </div>
                        ))}
                        <hr className="my-2" />
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                            <span>Total General:</span>
                            <span>${grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* --- Botones de Acción --- */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors" onClick={() => navigate('/invoices')}>
                        Cancelar
                    </button>
                    <button type="submit" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        Guardar Factura
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;