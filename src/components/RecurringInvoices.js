import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircleIcon, RefreshCwIcon, EditIcon, Trash2Icon } from './Icons';

const apiUrl = process.env.REACT_APP_API_URL;

const RecurringInvoices = () => {
    const [recurringInvoices, setRecurringInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchRecurring = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/recurring-invoices?page=${page}&limit=10`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setRecurringInvoices(data.recurringInvoices);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            } else {
                toast.error(data.msg || 'Error al cargar facturas recurrentes');
            }
        } catch (err) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecurring();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta plantilla recurrente?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/recurring-invoices/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Plantilla eliminada');
                fetchRecurring(currentPage);
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <RefreshCwIcon className="w-8 h-8 text-purple-600" />
                    Facturas Recurrentes
                </h2>
                <Link to="/recurring-invoices/new" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <PlusCircleIcon className="w-5 h-5" />
                    Nueva Recurrente
                </Link>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-8">Cargando plantillas...</p>
            ) : recurringInvoices.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <RefreshCwIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No hay facturas recurrentes configuradas</p>
                    <Link to="/recurring-invoices/new" className="text-purple-600 hover:underline mt-2 inline-block">
                        Crear la primera
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-4 font-semibold text-gray-600">Nombre Plantilla</th>
                                    <th className="p-4 font-semibold text-gray-600">Cliente</th>
                                    <th className="p-4 font-semibold text-gray-600">Frecuencia</th>
                                    <th className="p-4 font-semibold text-gray-600">Próxima Ejecución</th>
                                    <th className="p-4 font-semibold text-gray-600">Estado</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Monto</th>
                                    <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringInvoices.map((rec) => (
                                    <tr key={rec.recurring_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{rec.template_name}</td>
                                        <td className="p-4 text-gray-700">{rec.client_name}</td>
                                        <td className="p-4 text-gray-600 capitalize">{rec.frequency}</td>
                                        <td className="p-4 text-gray-600">{new Date(rec.next_run_date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${rec.status === 'Activa' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                                {rec.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">
                                            ${parseFloat(rec.total_amount).toFixed(2)}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <Link to={`/recurring-invoices/edit/${rec.recurring_id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(rec.recurring_id)}
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
                            onClick={() => fetchRecurring(currentPage - 1)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => fetchRecurring(currentPage + 1)}
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

export default RecurringInvoices;
