import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './InvoiceForm.css' y './BillForm.css'

const apiUrl = process.env.REACT_APP_API_URL;

const BillForm = () => {
    const [billData, setBillData] = useState({
        vendor_id: '',
        bill_number: '',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        status: 'Pendiente',
    });
    const [items, setItems] = useState([{ product_id: '', description: '', quantity: 1, unit_price: 0, gl_account_id: null }]);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const [vendorsRes, productsRes] = await Promise.all([
                fetch(`${apiUrl}/api/vendors?all=true`, { headers: { 'x-auth-token': token } }),
                fetch(`${apiUrl}/api/products?all=true`, { headers: { 'x-auth-token': token } })
            ]);
            const vendorsData = await vendorsRes.json();
            const productsData = await productsRes.json();
            setVendors(vendorsData);
            setProducts(productsData);

            if (id) {
                const billRes = await fetch(`${apiUrl}/api/bills/${id}`, { headers: { 'x-auth-token': token } });
                const billToEdit = await billRes.json();
                setBillData({
                    vendor_id: billToEdit.vendor_id || '',
                    bill_number: billToEdit.bill_number,
                    issue_date: new Date(billToEdit.issue_date).toISOString().slice(0, 10),
                    due_date: new Date(billToEdit.due_date).toISOString().slice(0, 10),
                    status: billToEdit.status,
                });
                const loadedItems = await Promise.all(billToEdit.items.map(async item => {
                    const prod = productsData.find(p => p.product_id === item.product_id);
                    return { ...item, product_id: item.product_id || '', gl_account_id: prod ? prod.gl_account_id : null };
                }));
                setItems(loadedItems);
            }
        } catch (err) {
            toast.error('Error al cargar datos iniciales.');
        } finally {
            setLoading(false);
        }
    }, [id, apiUrl]); // Agregamos apiUrl a las dependencias

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        const total = items.reduce((sum, item) => (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0) + sum, 0);
        setTotalAmount(total);
    }, [items]);

    const handleChange = (e) => setBillData({ ...billData, [e.target.name]: e.target.value });

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = [...items];
        if (name === 'product_id') {
            const product = products.find(p => p.product_id === parseInt(value));
            if (product) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    product_id: value,
                    description: product.name,
                    unit_price: product.cost || product.price || 0,
                    gl_account_id: product.gl_account_id
                };
            } else {
                updatedItems[index] = { product_id: '', description: '', quantity: 1, unit_price: 0, gl_account_id: null };
            }
        } else {
            updatedItems[index][name] = value;
        }
        setItems(updatedItems);
    };

    const addItem = () => setItems([...items, { product_id: '', description: '', quantity: 1, unit_price: 0, gl_account_id: null }]);
    const removeItem = (index) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        for (const item of items) {
            if (!item.gl_account_id) {
                toast.error(`El item "${item.description}" no tiene una cuenta de gasto vinculada. Edite el producto en "Productos y Servicios" y asígnele una cuenta contable.`);
                return;
            }
        }

        const token = localStorage.getItem('token');
        const finalBill = { ...billData, total_amount: totalAmount, items };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/api/bills/${id}` : `${apiUrl}/api/bills`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(finalBill) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error al guardar la factura por pagar.');
            toast.success(`Factura por pagar ${id ? 'actualizada' : 'creada'} con éxito.`);
            navigate('/bills');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando formulario...</p>;

    // --- JSX REFACTORIZADO ---
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">
                {id ? 'Editar Factura por Pagar' : 'Nueva Factura por Pagar'}
            </h2>
            <form onSubmit={handleSubmit}>
                {/* --- Datos Generales --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <label htmlFor="vendor_id" className="block text-sm font-bold text-gray-700 mb-2">Suplidor</label>
                        <select id="vendor_id" name="vendor_id" value={billData.vendor_id || ''} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Selecciona un Suplidor</option>
                            {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="bill_number" className="block text-sm font-bold text-gray-700 mb-2">Nº de Factura del Suplidor</label>
                        <input id="bill_number" type="text" name="bill_number" value={billData.bill_number || ''} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="issue_date" className="block text-sm font-bold text-gray-700 mb-2">Fecha de Emisión</label>
                        <input id="issue_date" type="date" name="issue_date" value={billData.issue_date} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="due_date" className="block text-sm font-bold text-gray-700 mb-2">Fecha de Vencimiento</label>
                        <input id="due_date" type="date" name="due_date" value={billData.due_date} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                        <select id="status" name="status" value={billData.status} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Pendiente">Pendiente</option>
                            <option value="Pagada">Pagada</option>
                            <option value="Vencida">Vencida</option>
                            <option value="Anulada">Anulada</option>
                        </select>
                    </div>
                </div>

                {/* --- Items --- */}
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Items</h3>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[700px]">
                        <div className="grid grid-cols-[2fr,4fr,1fr,1.5fr,1.5fr,auto] gap-4 pb-2 border-b-2 border-gray-300 mb-2">
                            <div className="font-bold text-gray-600 text-sm">Item</div>
                            <div className="font-bold text-gray-600 text-sm">Descripción</div>
                            <div className="font-bold text-gray-600 text-sm">Cantidad</div>
                            <div className="font-bold text-gray-600 text-sm">Costo Unit.</div>
                            <div className="font-bold text-gray-600 text-sm text-right">Total Línea</div>
                            <div className="w-10"></div>
                        </div>
                        {items.map((item, index) => {
                            const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                            return (
                                <div key={index} className="grid grid-cols-[2fr,4fr,1fr,1.5fr,1.5fr,auto] gap-4 items-center mb-2 pb-2 border-b border-gray-100">
                                    <select name="product_id" value={item.product_id} onChange={(e) => handleItemChange(index, e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Seleccionar...</option>
                                        {products.filter(p => p.product_type === 'Gasto' || p.product_type === 'Inventario').map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                                    </select>
                                    <input type="text" name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} required
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
                    <div className="w-full max-w-xs space-y-2 text-gray-700">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                            <span>Total a Pagar:</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* --- Botones de Acción --- */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors" onClick={() => navigate('/bills')}>
                        Cancelar
                    </button>
                    <button type="submit" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BillForm;