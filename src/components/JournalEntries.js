import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './Invoices.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const JournalEntries = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const fetchEntries = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/journal-entries?page=${page}`, {
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Error al obtener los asientos contables.');
            const data = await response.json();
            setEntries(data.entries);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries(currentPage);
    }, [currentPage]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <p>Cargando asientos contables...</p>;

    return (
        <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Diario General - Asientos Contables
            </h2>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Registra transacciones contables manuales.</p>
                <button onClick={() => navigate('/journal-entries/new')}
                    className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                    Añadir Asiento
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {entries.map((entry) => (
                            <tr key={entry.entry_id} className="hover:bg-gray-50">
                                <td className="p-4 whitespace-nowrap text-gray-700">{formatDate(entry.entry_date)}</td>
                                <td className="p-4 whitespace-nowrap text-gray-700">{entry.description}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <button
                                            className="py-1 px-3 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                                            onClick={() => navigate(`/journal-entries/${entry.entry_id}`)}>
                                            Ver
                                        </button>
                                        <button
                                            className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600"
                                            onClick={() => navigate(`/journal-entries/edit/${entry.entry_id}`)}>
                                            Editar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                <div></div>
                <div className="text-sm text-gray-700 font-medium">
                    <span> Página {currentPage} de {totalPages} </span>
                </div>
                <div>
                    <button onClick={() => fetchEntries(currentPage - 1)} disabled={currentPage === 1} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Anterior</button>
                    <button onClick={() => fetchEntries(currentPage + 1)} disabled={currentPage >= totalPages} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed ml-2">Siguiente</button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntries;