import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import axiomaIcon from '../assets/axioma-icon.png';
import PaymentModal from './PaymentModal';

const apiUrl = process.env.REACT_APP_API_URL;

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

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [limit, setLimit] = useState(10);
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const fetchInvoices = async (page, currentLimit) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/invoices?page=${page}&limit=${currentLimit}`, {
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Error al obtener las facturas.');
            const data = await response.json();
            setInvoices(data.invoices);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const status = searchParams.get('status');
        if (status) setStatusFilter(status);
    }, [searchParams]);

    useEffect(() => {
        fetchInvoices(currentPage, limit);
    }, [currentPage, limit]);

    const handleDelete = (invoiceId) => {
        const performDelete = async () => {
            const token = localStorage.getItem('token');
            try {
                await fetch(`${apiUrl}/api/invoices/${invoiceId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                toast.success('Factura eliminada con éxito');
                fetchInvoices(1, limit);
            } catch (err) {
                toast.error('Error al eliminar la factura.');
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar esta factura?</p>
                <button onClick={() => { performDelete(); closeToast(); }} className="mr-2 py-1 px-3 bg-red-600 text-white rounded-md">Sí</button>
                <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">No</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleDownload = async (invoiceId, invoiceNumber) => {
        const token = localStorage.getItem('token');
        try {
            toast.info('Generando PDF...');
            const res = await fetch(`${apiUrl}/api/invoices/${invoiceId}/pdf`, {
                headers: { 'x-auth-token': token },
            });
            if (!res.ok) throw new Error('No se pudo generar el PDF.');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Factura-${invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const filteredInvoices = useMemo(() => {
        return invoices
            .filter(invoice => {
                if (statusFilter === 'Todos') return true;
                if (statusFilter === 'Pendiente') return ['Enviada', 'Vencida', 'Parcialmente Pagada'].includes(invoice.status);
                return invoice.status === statusFilter;
            })
            .filter(invoice => {
                return invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    invoice.status.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [invoices, searchTerm, statusFilter]);

    const handleFilterClick = (status) => {
        setStatusFilter(status);
        setSearchParams({ status: status });
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <p>Cargando facturas...</p>;

    return (
        <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Mis Facturas
            </h2>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex-shrink-0 bg-white rounded-lg shadow-sm p-1 flex gap-1">
                        <button onClick={() => handleFilterClick('Todos')} className={`py-1.5 px-3 rounded-md text-sm font-medium ${statusFilter === 'Todos' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Todos</button>
                        <button onClick={() => handleFilterClick('Pendiente')} className={`py-1.5 px-3 rounded-md text-sm font-medium ${statusFilter === 'Pendiente' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Pendientes</button>
                        <button onClick={() => handleFilterClick('Pagada')} className={`py-1.5 px-3 rounded-md text-sm font-medium ${statusFilter === 'Pagada' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Pagadas</button>
                        <button onClick={() => handleFilterClick('Vencida')} className={`py-1.5 px-3 rounded-md text-sm font-medium ${statusFilter === 'Vencida' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Vencidas</button>
                    </div>
                    <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Buscar por Nº, cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors w-full md:w-auto flex-shrink-0"
                    onClick={() => navigate('/invoices/new')}>
                    Crear Nueva Factura
                </button>
            </div>

            <hr className="my-6 border-gray-200" />

            {invoices.length === 0 && !loading ? (
                <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-700">No tienes facturas todavía</h3>
                    <p className="text-gray-500 mt-2 mb-4">¡Empieza creando tu primera factura ahora!</p>
                    <button onClick={() => navigate('/invoices/new')} className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700">
                        Crear Nueva Factura
                    </button>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No se encontraron facturas que coincidan con tus filtros.</p>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[768px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nº Factura</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Saldo Pendiente</th>
                                    <th className="p-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Vencimiento</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredInvoices.map((invoice) => {
                                    const balanceDue = parseFloat(invoice.total_amount) - parseFloat(invoice.amount_paid);
                                    return (
                                        <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                                            <td className="p-4 whitespace-nowrap text-gray-700 font-medium">{invoice.invoice_number}</td>
                                            <td className="p-4 whitespace-nowrap text-gray-700">{invoice.client_name}</td>
                                            <td className="p-4 whitespace-nowrap text-gray-700 text-right">${parseFloat(invoice.total_amount).toLocaleString('es-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 whitespace-nowrap text-gray-900 font-bold text-right">${balanceDue.toLocaleString('es-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 whitespace-nowrap text-center">
                                                <StatusBadge status={invoice.status} />
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-gray-700">{formatDate(invoice.due_date)}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button className="py-1 px-3 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600" onClick={() => navigate(`/invoices/${invoice.invoice_id}`)}>Ver</button>
                                                    <button className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600" onClick={() => navigate(`/invoices/edit/${invoice.invoice_id}`)}>Editar</button>
                                                    {invoice.status !== 'Pagada' && invoice.status !== 'Anulada' && (
                                                        <button
                                                            className="py-1 px-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                                            onClick={() => setSelectedInvoiceForPayment(invoice)}
                                                        >
                                                            Pagar
                                                        </button>
                                                    )}
                                                    <button className="py-1 px-3 bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-600" onClick={() => handleDownload(invoice.invoice_id, invoice.invoice_number)}>PDF</button>
                                                    <button className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700" onClick={() => handleDelete(invoice.invoice_id)}>Eliminar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                        <div>
                            <label htmlFor="limit-select" className="text-sm text-gray-700 mr-2">Items por página:</label>
                            <select id="limit-select" value={limit} onChange={handleLimitChange}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-700 font-medium">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchInvoices(currentPage - 1, limit)}
                                disabled={currentPage === 1}
                                className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => fetchInvoices(currentPage + 1, limit)}
                                disabled={currentPage >= totalPages}
                                className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selectedInvoiceForPayment && (
                <PaymentModal
                    invoice={selectedInvoiceForPayment}
                    onClose={() => setSelectedInvoiceForPayment(null)}
                    onPaymentSuccess={() => {
                        fetchInvoices(currentPage, limit);
                        setSelectedInvoiceForPayment(null);
                    }}
                />
            )}
        </div>
    );
};

export default Invoices;