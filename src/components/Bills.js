import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Invoices.css';
import './Bills.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const fetchBills = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/bills?page=${page}`, {
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Error al obtener las facturas por pagar.');
            const data = await response.json();
            setBills(data.bills);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills(currentPage);
    }, [currentPage]);

    // --- FUNCIÓN handleDelete CORREGIDA ---
    const handleDelete = (billId) => {
        const performDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${apiUrl}/api/bills/${billId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                toast.success('Factura por pagar eliminada.');
                if (bills.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchBills(currentPage);
                }
            } catch (err) {
                toast.error(err.message);
            }
        };

        // Lógica de confirmación con toast restaurada
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar esta factura?</p>
                <button onClick={() => { performDelete(); closeToast(); }}>Sí, eliminar</button>
                <button onClick={closeToast}>Cancelar</button>
            </div>
        );

        toast.warn(<ConfirmationToast />, {
            closeOnClick: false,
            autoClose: false,
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusClass = (status) => `status-${status}`;

    if (loading) return <p>Cargando facturas por pagar...</p>;

    return (
        <div>
            <h2 className="page-header-with-icon">
                <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                Facturas por Pagar</h2>
            <div className="bills-toolbar">
                <p>Gestiona las facturas de tus suplidores.</p>
                <button onClick={() => navigate('/bills/new')} className="btn-primary">Añadir Factura</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nº Factura</th>
                            <th>Suplidor</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Vencimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill) => (
                            <tr key={bill.bill_id}>
                                <td>{bill.bill_number}</td>
                                <td>{bill.vendor_name || '--'}</td>
                                <td>${parseFloat(bill.total_amount).toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(bill.status)}`}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td>{formatDate(bill.due_date)}</td>
                                <td className="actions-cell">
                                    <button className="btn-edit" onClick={() => navigate(`/bills/edit/${bill.bill_id}`)}>Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(bill.bill_id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-container" style={{ marginTop: '20px' }}>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Anterior</button>
                <span className="pagination-text"> Página {currentPage} de {totalPages} </span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Siguiente</button>
            </div>
        </div>
    );
};

export default Bills;