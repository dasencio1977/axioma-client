import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircleIcon, FileTextIcon, EditIcon, Trash2Icon, RefreshCwIcon } from './Icons';

const apiUrl = process.env.REACT_APP_API_URL;

const Estimates = () => {
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchEstimates = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/estimates?page=${page}&limit=10`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setEstimates(data.estimates);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            } else {
                toast.error(data.msg || 'Error al cargar estimados');
            }
        } catch (err) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEstimates();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este estimado?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/estimates/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Estimado eliminado');
                fetchEstimates(currentPage);
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    const handleConvertToInvoice = async (id) => {
        if (!window.confirm('¿Convertir este estimado en una factura borrador?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/estimates/${id}/convert`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Estimado convertido a factura exitosamente');
                // Opcional: Redirigir a la factura creada
                // window.location.href = `/invoices/edit/${data.invoice_id}`;
                fetchEstimates(currentPage);
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error('Error al convertir');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <FileTextIcon className="w-8 h-8 text-blue-600" />
                    Estimados (Cotizaciones)
                </h2>
                <Link to="/estimates/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <PlusCircleIcon className="w-5 h-5" />
                    Nuevo Estimado
                </Link>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-8">Cargando estimados...</p>
            ) : estimates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No hay estimados registrados</p>
                    <Link to="/estimates/new" className="text-blue-600 hover:underline mt-2 inline-block">
                        Crear el primero
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-4 font-semibold text-gray-600">Número</th>
                                    <th className="p-4 font-semibold text-gray-600">Cliente</th>
                                    <th className="p-4 font-semibold text-gray-600">Fecha Expiración</th>
                                    <th className="p-4 font-semibold text-gray-600">Estado</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Total</th>
                                    <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estimates.map((est) => (
                                    <tr key={est.estimate_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{est.estimate_number}</td>
                                        <td className="p-4 text-gray-700">{est.client_name}</td>
                                        <td className="p-4 text-gray-600">{new Date(est.expiry_date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${est.status === 'Aceptado' ? 'bg-green-100 text-green-800' :
                                                    est.status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                                        est.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {est.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">
                                            ${parseFloat(est.total_amount).toFixed(2)}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <Link to={`/estimates/edit/${est.estimate_id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleConvertToInvoice(est.estimate_id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                title="Convertir a Factura"
                                            >
                                                <RefreshCwIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(est.estimate_id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2Icon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => fetchEstimates(currentPage - 1)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => fetchEstimates(currentPage + 1)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Estimates;
