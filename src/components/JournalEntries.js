// client/src/components/JournalEntries.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Invoices.css'; // Reutilizamos estilos

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
            <h2 className="page-header-with-icon">
                <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                Diario General - Asientos Contables</h2>
            <div className="invoice-toolbar">
                <p>Registra transacciones contables manuales.</p>
                <button onClick={() => navigate('/journal-entries/new')} className="btn-primary">
                    Añadir Asiento
                </button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry) => (
                            <tr key={entry.entry_id}>
                                <td>{formatDate(entry.entry_date)}</td>
                                <td>{entry.description}</td>
                                <td className="actions-cell">
                                    <button className="btn-view" onClick={() => navigate(`/journal-entries/${entry.entry_id}`)}>Ver</button>
                                    <button className="btn-edit" onClick={() => navigate(`/journal-entries/edit/${entry.entry_id}`)}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-container">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Anterior</button>
                <span className="pagination-text"> Página {currentPage} de {totalPages} </span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Siguiente</button>
            </div>
        </div>
    );
};

export default JournalEntries;