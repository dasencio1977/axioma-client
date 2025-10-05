// client/src/components/BillForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './InvoiceForm.css'; // Reutilizamos muchos estilos del formulario de facturas
import './BillForm.css';

const apiUrl = process.env.REACT_APP_API_URL;

const BillForm = () => {
    const [billData, setBillData] = useState({
        vendor_id: '',
        bill_number: '',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        status: 'Pendiente',
    });
    const [items, setItems] = useState([{ product_id: '', description: '', quantity: 1, unit_price: 0 }]);
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
                setItems(billToEdit.items);
            }
        } catch (err) {
            toast.error('Error al cargar datos iniciales.');
        } finally {
            setLoading(false);
        }
    }, [id]);

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
                updatedItems[index] = { ...updatedItems[index], product_id: value, description: product.name, unit_price: product.cost };
            } else {
                updatedItems[index] = { product_id: '', description: '', quantity: 1, unit_price: 0 };
            }
        } else {
            updatedItems[index][name] = value;
        }
        setItems(updatedItems);
    };

    const addItem = () => setItems([...items, { product_id: '', description: '', quantity: 1, unit_price: 0 }]);
    const removeItem = (index) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const finalBill = { ...billData, total_amount: totalAmount, items };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/api/bills/${id}` : `${apiUrl}/api/bills`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(finalBill) });
            if (!response.ok) throw new Error('Error al guardar la factura por pagar.');
            toast.success(`Factura por pagar ${id ? 'actualizada' : 'creada'} con éxito.`);
            navigate('/bills');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando formulario...</p>;

    return (
        <div className="invoice-form-container">
            <h2>{id ? 'Editar Factura por Pagar' : 'Nueva Factura por Pagar'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Suplidor</label>
                        <select name="vendor_id" value={billData.vendor_id} onChange={handleChange}>
                            <option value="">Selecciona un Suplidor</option>
                            {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label>Nº de Factura del Suplidor</label><input type="text" name="bill_number" value={billData.bill_number} onChange={handleChange} /></div>
                    <div className="form-group"><label>Fecha de Emisión</label><input type="date" name="issue_date" value={billData.issue_date} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Fecha de Vencimiento</label><input type="date" name="due_date" value={billData.due_date} onChange={handleChange} required /></div>
                </div>

                <h3>Items</h3>
                <div className="items-grid-container">
                    <div className="items-grid-header"><div>Item</div><div>Descripción</div><div>Cantidad</div><div>Costo Unit.</div><div style={{ textAlign: 'right' }}>Total</div><div></div></div>
                    {items.map((item, index) => {
                        const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                        return (
                            <div key={index} className="items-grid-row">
                                <select name="product_id" value={item.product_id} onChange={(e) => handleItemChange(index, e)}>
                                    <option value="">Seleccionar...</option>
                                    {products.filter(p => p.product_type === 'Gasto').map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                                </select>
                                <input type="text" name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} required />
                                <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} min="1" />
                                <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} min="0" step="0.01" />
                                <div className="line-total">${lineTotal.toFixed(2)}</div>
                                <div className="item-actions">
                                    <button type="button" className="btn-remove-item" onClick={() => removeItem(index)}>🗑️</button>
                                    {index === items.length - 1 && <button type="button" onClick={addItem} className="btn-add-item">+</button>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="totals-section"><h3>Total a Pagar: ${totalAmount.toFixed(2)}</h3></div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/bills')}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default BillForm;