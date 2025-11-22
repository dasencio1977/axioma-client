import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './Invoices.css' y './Bills.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

// Componente interno para los Badges de Estado
const StatusBadge = ({ status }) => {
    const statusClasses = {
        'Pagada': 'bg-green-100 text-green-800',
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'Vencida': 'bg-red-100 text-red-800',
        'Anulada': 'bg-gray-700 text-white',
    };
    const classes = statusClasses[status] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`py-1 px-3 rounded-full text-xs font-medium ${classes}`}>
            {status}
        </span>
    );
};

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
                    fetchBills(currentPage - 1);
                } else {
                    fetchBills(currentPage);
                }
            } catch (err) {
                toast.error(err.message);
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <p>Cargando facturas por pagar...</p>;

    return (
        <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Facturas por Pagar
            </h2>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Gestiona las facturas de tus suplidores.</p>
                <button onClick={() => navigate('/bills/new')} className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                    Añadir Factura
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nº Factura</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Suplidor</th>
                            <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                            <th className="p-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Vencimiento</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bills.map((bill) => (
                            <tr key={bill.bill_id} className="hover:bg-gray-50">
                                <td className="p-4 whitespace-nowrap text-gray-700">{bill.bill_number}</td>
                                <td className="p-4 whitespace-nowrap text-gray-700">{bill.vendor_name || '--'}</td>
                                <td className="p-4 whitespace-nowrap text-gray-700 text-right">${parseFloat(bill.total_amount).toFixed(2)}</td>
                                <td className="p-4 whitespace-nowrap text-center">
                                    <StatusBadge status={bill.status} />
                                </td>
                                <td className="p-4 whitespace-nowrap text-gray-700">{formatDate(bill.due_date)}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <button className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600" onClick={() => navigate(`/bills/edit/${bill.bill_id}`)}>Editar</button>
                                        <button className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700" onClick={() => handleDelete(bill.bill_id)}>Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                <div></div> {/* Div vacío para empujar */}
                <div className="text-sm text-gray-700 font-medium">
                    <span> Página {currentPage} de {totalPages} </span>
                </div>
                <div>
                    <button onClick={() => fetchBills(currentPage - 1)} disabled={currentPage === 1} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Anterior</button>
                    <button onClick={() => fetchBills(currentPage + 1)} disabled={currentPage >= totalPages} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed ml-2">Siguiente</button>

                </div>
            </div>
        </div>
    );
};

export default Bills;