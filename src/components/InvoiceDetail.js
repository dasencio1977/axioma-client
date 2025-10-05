import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './InvoiceDetail.css';

const apiUrl = process.env.REACT_APP_API_URL;

const InvoiceDetail = () => {
    const [invoice, setInvoice] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const [invoiceRes, profileRes] = await Promise.all([
                fetch(`${apiUrl}/api/invoices/${id}`, { headers: { 'x-auth-token': token } }),
                fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } })
            ]);
            if (!invoiceRes.ok || !profileRes.ok) throw new Error('No se pudieron cargar los detalles.');
            const invoiceData = await invoiceRes.json();
            const profileData = await profileRes.json();
            setInvoice(invoiceData);
            setProfile(profileData);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleDownload = async () => {
        const token = localStorage.getItem('token');
        try {
            toast.info('Generando PDF...');
            const res = await fetch(`http://localhost:5000/api/invoices/${id}/pdf`, {
                headers: { 'x-auth-token': token },
            });
            if (!res.ok) throw new Error('No se pudo generar el PDF.');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Factura-${invoice.invoice_number}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error('Error al actualizar el estado.');
            toast.success('Estado de la factura actualizado.');
            setInvoice({ ...invoice, status: newStatus });
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando factura...</p>;
    if (!invoice || !profile) return <p>Datos no encontrados.</p>;

    const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const balanceDue = parseFloat(invoice.total_amount) - totalPaid;

    return (
        <div>
            <div className="invoice-detail-actions" style={{ marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)}>← Regresar</button>
                <button onClick={() => navigate(`/invoices/edit/${invoice.invoice_id}`)}>Editar Factura</button>
                <button onClick={handleDownload}>Descargar PDF</button>
                {invoice.status !== 'Pagada' && (
                    <button onClick={() => navigate(`/invoices/${id}/add-payment`)}>Registrar Pago</button>
                )}
            </div>

            <div className="invoice-box">
                <div className="company-details">
                    <h2>{profile.company_name}</h2>
                    <p>{profile.address}</p>
                    <p>{profile.phone}</p>
                    <p>{profile.email}</p>

                </div>
                <div className="invoice-header-right">
                    <div className="status-selector" style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <label htmlFor="status-select" style={{ fontWeight: 'bold' }}>Cambiar Estado: </label>
                        <select id="status-select" value={invoice.status} onChange={handleStatusChange}>
                            <option value="Borrador">Borrador</option>
                            <option value="Enviada">Enviada</option>
                            <option value="Vencida">Vencida</option>
                            <option value="Anulada">Anulada</option>
                            <option value="Parcialmente Pagada" disabled>Parcialmente Pagada</option>
                            <option value="Pagada" disabled>Pagada</option>
                        </select>
                    </div>

                </div>
                <header className="invoice-header">

                    <div className="invoice-header-number">
                        <h1>FACTURA</h1>
                        <p><strong>Factura #:</strong> {invoice.invoice_number}</p>
                        <p><strong>Fecha de Emisión:</strong> {new Date(invoice.issue_date).toLocaleDateString()}</p>
                        <p><strong>Fecha de Vencimiento:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="client-details">
                        <h3>Facturar a:</h3>
                        <p><strong>{invoice.client_name}</strong></p>
                        <p>{invoice.client_address}</p>
                        <p>{invoice.client_email}</p>
                        <p>{invoice.client_phone}</p>
                    </div>

                </header>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map(item => (
                            <tr key={item.item_id}>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                                <td>${parseFloat(item.line_total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <footer className="invoice-footer">
                    <div className="payment-history">
                        <h3>Historial de Pagos</h3>
                        {invoice.payments && invoice.payments.length > 0 ? (
                            <ul>
                                {invoice.payments.map(p => (
                                    <li key={p.payment_id}>
                                        {new Date(p.payment_date).toLocaleDateString()}: <strong>${parseFloat(p.amount_paid).toFixed(2)}</strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (<p>No se han registrado pagos.</p>)}
                    </div>
                    <div className="total-section">
                        <p>Subtotal: ${parseFloat(invoice.total_amount).toFixed(2)}</p>
                        <p>Total Pagado: ${totalPaid.toFixed(2)}</p>
                        <p><strong>Saldo Pendiente: ${balanceDue.toFixed(2)}</strong></p>
                        <p className="status">Estado: {invoice.status}</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default InvoiceDetail;