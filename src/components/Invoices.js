import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Invoices.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [limit, setLimit] = useState(10);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const status = searchParams.get('status');
        if (status) {
            setStatusFilter(status);
        }
    }, [searchParams]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
        fetchInvoices(currentPage, limit);
    }, [currentPage, limit]);

    const handleDelete = (invoiceId) => {
        const performDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${apiUrl}/api/invoices/${invoiceId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                toast.success('Factura eliminada con éxito');
                fetchInvoices();
            } catch (err) {
                toast.error('Error al eliminar la factura.');
            }
        };

        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar esta factura?</p>
                <button onClick={() => { performDelete(); closeToast(); }}>Sí</button>
                <button onClick={closeToast}>No</button>
            </div>
        );

        toast.warn(<ConfirmationToast />, {
            closeOnClick: false,
            autoClose: false,
        });

    }; const handleDownload = async (invoiceId, invoiceNumber) => {
        const token = localStorage.getItem('token');
        try {
            toast.info('Generando PDF...');
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/invoices/${invoiceId}/pdf`, {
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
        setSearchParams({ status: status }); // Actualizamos la URL
    };
    const statusFilteredInvoices = useMemo(() => {
        return filteredInvoices.filter(invoice => {
            if (statusFilter === 'Todos') return true;
            if (statusFilter === 'Pendiente') return ['Enviada', 'Vencida', 'Parcialmente Pagada'].includes(invoice.status);
            return invoice.status === statusFilter;
        });
    }, [filteredInvoices, statusFilter]);

    const getStatusClass = (status) => {
        const normalizedStatus = status.startsWith('Parcialmente') ? 'Parcialmente' : status;
        return `status-${normalizedStatus}`;
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
        setCurrentPage(1);
    };

    if (loading) return <p>Cargando facturas...</p>;

    return (
        <div>
            <h2 className="page-header-with-icon">
                <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                <h2>Facturas</h2>
            </h2>

            <div className="invoice-toolbar">
                {/* 1. Nuevo contenedor para filtros y búsqueda */}
                <div className="filters-and-search">
                    <div className="invoice-filters">
                        <button onClick={() => setStatusFilter('Todos')} className={statusFilter === 'Todos' ? 'active' : ''}>Todos</button>
                        <button onClick={() => setStatusFilter('Pendiente')} className={statusFilter === 'Pendiente' ? 'active' : ''}>Pendientes</button>
                        <button onClick={() => setStatusFilter('Pagada')} className={statusFilter === 'Pagada' ? 'active' : ''}>Pagadas</button>
                        <button onClick={() => handleFilterClick('Vencida')} className={statusFilter === 'Vencida' ? 'active' : ''}>Vencidas</button>
                        <button onClick={() => setStatusFilter('Borrador')} className={statusFilter === 'Borrador' ? 'active' : ''}>Borrador</button>

                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        /></div>
                </div>

                {/* Botón de Crear se mantiene a la derecha */}
                <button
                    className="btn-primary"
                    onClick={() => navigate('/invoices/new')}>
                    Crear Nueva Factura
                </button>
            </div>

            <hr />

            {/* --- ESTE ES EL BLOQUE CORREGIDO --- */}
            {invoices.length === 0 && !loading ? (
                <div className="empty-state">
                    <h3>No tienes facturas todavía</h3>
                    <p>¡Empieza creando tu primera factura ahora!</p>
                    <button onClick={() => navigate('/invoices/new')} className="btn-primary">Crear Nueva Factura</button>
                </div>
            ) : statusFilteredInvoices.length === 0 ? (
                <p>No se encontraron facturas que coincidan con tus filtros.</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nº Factura</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Vencimiento</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statusFilteredInvoices.map((invoice) => (
                                    <tr key={invoice.invoice_id}>
                                        <td>{invoice.invoice_number}</td>
                                        <td>{invoice.client_name}</td>
                                        <td>${parseFloat(invoice.total_amount).toLocaleString('es-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td><span className={`status-badge ${getStatusClass(invoice.status)}`}>{invoice.status}</span></td>
                                        <td>{formatDate(invoice.due_date)}</td>
                                        <td className="actions-cell">
                                            <button className="btn-view" onClick={() => navigate(`/invoices/${invoice.invoice_id}`)}>Ver</button>
                                            <button className="btn-edit" onClick={() => navigate(`/invoices/edit/${invoice.invoice_id}`)}>Editar</button>
                                            <button className="btn-pdf" onClick={() => handleDownload(invoice.invoice_id, invoice.invoice_number)}>PDF</button>
                                            <button className="btn-delete" onClick={() => handleDelete(invoice.invoice_id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination-container">
                        <div>
                            <label htmlFor="limit-select">Items por página: </label>
                            <select id="limit-select" className="items-per-page-select" value={limit} onChange={handleLimitChange}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div className="pagination-text">
                            <span>Página {currentPage} de {totalPages}</span>
                        </div>
                        <div>
                            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Anterior</button>
                            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Siguiente</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Invoices;