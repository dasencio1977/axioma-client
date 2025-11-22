import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './InvoiceDetail.css'

const apiUrl = process.env.REACT_APP_API_URL;

// Componente interno para los Badges de Estado
const StatusBadge = ({ status }) => {
    const statusClasses = {
        'Pagada': 'bg-green-100 text-green-800',
        'Parcialmente Pagada': 'bg-yellow-100 text-yellow-800',
        'Enviada': 'bg-blue-100 text-blue-800',
        'Vencida': 'bg-red-100 text-red-800',
        'Borrador': 'bg-gray-100 text-gray-800',
        'Anulada': 'bg-gray-700 text-white',
    };
    const normalizedStatus = status.startsWith('Parcialmente') ? 'Parcialmente Pagada' : status;
    const classes = statusClasses[normalizedStatus] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`py-1 px-3 rounded-full text-xs font-medium ${classes}`}>
            {status}
        </span>
    );
};

const InvoiceDetail = () => {
    const [invoice, setInvoice] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    // --- LÓGICA DE DATOS (sin cambios) ---
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
    }, [id, apiUrl]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleDownload = async () => {
        const token = localStorage.getItem('token');
        try {
            toast.info('Generando PDF...');
            const res = await fetch(`${apiUrl}/api/invoices/${id}/pdf`, {
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
            const response = await fetch(`${apiUrl}/api/invoices/${id}/status`, {
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
    // --- FIN LÓGICA DE DATOS ---

    if (loading) return <p>Cargando factura...</p>;
    if (!invoice || !profile) return <p>Datos no encontrados.</p>;

    const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const balanceDue = parseFloat(invoice.total_amount) - totalPaid;

    // --- JSX REFACTORIZADO ---
    return (
        <div>
            {/* --- Barra de Acciones Superior --- */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                    ← Regresar
                </button>
                <button 
                    onClick={() => navigate(`/invoices/edit/${invoice.invoice_id}`)}
                    className="py-2 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                    Editar Factura
                </button>
                <button 
                    onClick={handleDownload}
                    className="py-2 px-4 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
                >
                    Descargar PDF
                </button>
                {invoice.status !== 'Pagada' && (
                    <button 
                        onClick={() => navigate(`/invoices/${id}/add-payment`)}
                        className="py-2 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                        Registrar Pago
                    </button>
                )}
            </div>

            {/* --- Contenedor de la Factura --- */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 max-w-4xl mx-auto font-sans text-gray-800">
                {/* --- Encabezado de la Factura --- */}
                <header className="flex flex-col md:flex-row justify-between items-start mb-10 pb-6 border-b">
                    {/* Información de la Factura */}
                    <div className="w-full md:w-1/2">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">FACTURA</h1>
                        <p className="text-gray-600"><strong>Factura #:</strong> {invoice.invoice_number}</p>
                        <p className="text-gray-600"><strong>Fecha de Emisión:</strong> {new Date(invoice.issue_date).toLocaleDateString()}</p>
                        <p className="text-gray-600"><strong>Fecha de Vencimiento:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                    </div>
                    {/* Información de la Empresa y Estado */}
                    <div className="w-full md:w-1/2 text-left md:text-right mt-4 md:mt-0">
                        <div className="mb-4">
                            <label htmlFor="status-select" className="text-sm font-bold text-gray-700 mr-2">Cambiar Estado:</label>
                            <select id="status-select" value={invoice.status} onChange={handleStatusChange}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="Borrador">Borrador</option>
                                <option value="Enviada">Enviada</option>
                                <option value="Vencida">Vencida</option>
                                <option value="Anulada">Anulada</option>
                                <option value="Parcialmente Pagada" disabled>Parcialmente Pagada</option>
                                <option value="Pagada" disabled>Pagada</option>
                            </select>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{profile.company_name}</h2>
                        <p className="text-gray-600">{profile.address_1}</p>
                        <p className="text-gray-600">{profile.phone}</p>
                        <p className="text-gray-600">{profile.email}</p>
                    </div>
                </header>

                {/* --- Detalles del Cliente --- */}
                <section className="mb-10">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Facturar a:</h3>
                    <p className="text-lg font-semibold text-gray-900">{invoice.client_name}</p>
                    <p className="text-gray-600">{invoice.client_address}</p>
                    <p className="text-gray-600">{invoice.client_email}</p>
                </section>

                {/* --- Tabla de Items --- */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-600 uppercase">Descripción</th>
                                <th className="p-3 text-right text-sm font-semibold text-gray-600 uppercase">Cantidad</th>
                                <th className="p-3 text-right text-sm font-semibold text-gray-600 uppercase">Precio Unitario</th>
                                <th className="p-3 text-right text-sm font-semibold text-gray-600 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.items.map(item => (
                                <tr key={item.item_id}>
                                    <td className="p-3 text-gray-700">{item.description}</td>
                                    <td className="p-3 text-gray-700 text-right">{item.quantity}</td>
                                    <td className="p-3 text-gray-700 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td className="p-3 text-gray-700 text-right">${parseFloat(item.line_total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* --- Pie de Factura: Pagos y Totales --- */}
                <footer className="flex flex-col md:flex-row justify-between items-start mt-10 pt-6 border-t-2">
                    {/* Historial de Pagos */}
                    <div className="w-full md:w-1/2 mb-6 md:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Historial de Pagos</h3>
                        {invoice.payments && invoice.payments.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                {invoice.payments.map(p => (
                                    <li key={p.payment_id}>
                                        {new Date(p.payment_date).toLocaleDateString()}: <strong>${parseFloat(p.amount_paid).toFixed(2)}</strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (<p className="text-gray-500 italic">No se han registrado pagos.</p>)}
                    </div>
                    {/* Sección de Totales */}
                    <div className="w-full md:w-auto text-left md:text-right space-y-2">
                        <p className="text-lg text-gray-700"><strong>Subtotal:</strong> ${parseFloat(invoice.subtotal).toFixed(2)}</p>
                        {/* Aquí puedes mapear los totales de impuestos */}
                        <p className="text-lg text-gray-700"><strong>Total Impuestos:</strong> ${parseFloat(invoice.total_amount - invoice.subtotal).toFixed(2)}</p>
                        <hr className="my-2"/>
                        <p className="text-2xl font-bold text-gray-900">Total: ${parseFloat(invoice.total_amount).toFixed(2)}</p>
                        <p className="text-xl font-bold text-red-600">Saldo Pendiente: ${balanceDue.toFixed(2)}</p>
                        <div className="mt-4">
                            <StatusBadge status={invoice.status} />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default InvoiceDetail;