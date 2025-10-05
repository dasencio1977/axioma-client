import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './InvoiceForm.css';

// const sampleProducts = [
//     { id: 1, code: 'DSN-WEB', description: 'Diseño de Sitio Web', price: 1500.00 },
//     { id: 2, code: 'DEV-FE', description: 'Desarrollo Frontend (por hora)', price: 75.00 },
//     { id: 3, code: 'DEV-BE', description: 'Desarrollo Backend (por hora)', price: 85.00 },
//     { id: 4, code: 'CONSULT', description: 'Consultoría Estratégica', price: 120.00 },
//     { id: 5, code: 'MNT-WEB', description: 'Mantenimiento Web Mensual', price: 250.00 },
// ];

const apiUrl = process.env.REACT_APP_API_URL;

const InvoiceForm = () => {
    const [invoiceData, setInvoiceData] = useState({
        client_id: '',
        invoice_number: '',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        status: 'Borrador',
    });
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([{ productId: '', description: '', quantity: 1, unit_price: 0 }]);
    const [clients, setClients] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                // 3. Hacemos todas las peticiones necesarias en paralelo
                const [clientsRes, productsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/clients?all=true`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/products?all=true`, { headers: { 'x-auth-token': token } })
                ]);

                const clientsData = await clientsRes.json();
                const productsData = await productsRes.json();
                setClients(clientsData.clients || []);
                setProducts(productsData || []); // La API de productos devuelve un array directamente

                if (id) {
                    const invoiceRes = await fetch(`${apiUrl}/api/invoices/${id}`, { headers: { 'x-auth-token': token } });
                    const invoiceToEdit = await invoiceRes.json();
                    setInvoiceData({
                        client_id: invoiceToEdit.client_id,
                        invoice_number: invoiceToEdit.invoice_number,
                        issue_date: new Date(invoiceToEdit.issue_date).toISOString().slice(0, 10),
                        due_date: new Date(invoiceToEdit.due_date).toISOString().slice(0, 10),
                        status: invoiceToEdit.status,
                    });
                    setItems(invoiceToEdit.items);
                }
            } catch (err) {
                toast.error('Error al cargar los datos iniciales.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id]);

    useEffect(() => {
        const total = items.reduce((sum, item) => (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0) + sum, 0);
        setTotalAmount(total);
    }, [items]);

    const handleInvoiceChange = (e) => {
        setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
    };

    // 4. Actualizamos handleItemChange para que use la lista 'products' del estado
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = [...items];

        if (name === 'product_id') {
            const product = products.find(p => p.product_id === parseInt(value));
            if (product) {
                updatedItems[index] = { ...updatedItems[index], product_id: value, description: product.name, unit_price: product.price, item_code: product.code };
            } else {
                updatedItems[index] = { product_id: '', item_code: '', description: '', quantity: 1, unit_price: 0 };
            }
        } else {
            updatedItems[index][name] = value;
        }
        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([...items, { productId: '', item_code: '', description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const finalInvoice = { ...invoiceData, total_amount: totalAmount, items: items.map(({ productId, ...rest }) => rest) };
        console.log("Submitting invoice:", finalInvoice);
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/api/invoices/${id}` : `${apiUrl}/api/invoices`;
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(finalInvoice),
            });
            if (!response.ok) throw new Error(`Error al ${id ? 'actualizar' : 'crear'} la factura.`);
            toast.success(`Factura ${id ? 'actualizada' : 'creada'} con éxito.`);
            navigate('/invoices');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando formulario...</p>;

    return (
        <div className="invoice-form-container">
            <h2>{id ? 'Editar Factura' : 'Crear Nueva Factura'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="client_id">Cliente</label>
                        <select id="client_id" name="client_id" value={invoiceData.client_id} onChange={handleInvoiceChange} required>
                            <option value="">Selecciona un Cliente</option>
                            {clients.map(client => (
                                <option key={client.client_id} value={client.client_id}>{client.client_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="invoice_number">Nº Factura</label>
                        <input id="invoice_number" type="text" name="invoice_number" value={invoiceData.invoice_number} onChange={handleInvoiceChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="issue_date">Fecha de Emisión</label>
                        <input id="issue_date" type="date" name="issue_date" value={invoiceData.issue_date} onChange={handleInvoiceChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="due_date">Fecha de Vencimiento</label>
                        <input id="due_date" type="date" name="due_date" value={invoiceData.due_date} onChange={handleInvoiceChange} required />
                    </div>
                </div>
                <h3>Items</h3>
                <div className="items-grid-container">
                    <div className="items-grid-header">
                        <div>Item</div>
                        <div>Descripción</div>
                        <div>Cantidad</div>
                        <div>Precio Unit.</div>
                        <div style={{ textAlign: 'right' }}>Total Línea</div>
                        <div>

                        </div>
                    </div>
                    {items.map((item, index) => {
                        const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                        return (
                            <div key={index} className="items-grid-row">
                                {/* 5. El SELECT ahora se llena con los productos de la API */}
                                <select name="product_id" value={item.product_id} onChange={(e) => handleItemChange(index, e)}>
                                    <option value="">Seleccionar...</option>
                                    {products.map(p => (
                                        <option key={p.product_id} value={p.product_id}>{p.code || p.name}</option>
                                    ))}
                                </select>
                                <input type="text" name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} placeholder="Descripción" required />
                                <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} placeholder="Cantidad" min="1" />
                                <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} placeholder="Precio" min="0" step="0.01" />
                                <div className="line-total">${lineTotal.toFixed(2)}</div>
                                <div className="item-actions">
                                    <button type="button" className="btn-remove-item" onClick={() => removeItem(index)} title="Eliminar Item">🗑️</button>
                                    {index === items.length - 1 && (
                                        <button type="button" onClick={addItem} className="btn-add-item" title="Añadir Item">+</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="totals-section">
                    <h3>Total General: ${totalAmount.toFixed(2)}</h3>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/invoices')}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Factura</button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;