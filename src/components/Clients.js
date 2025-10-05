import React, { useState, useEffect } from 'react';
import ClientForm from './ClientForm';
import { toast } from 'react-toastify';
//import { useNavigate } from 'react-router-dom';
import './Clients.css';
import './Invoices.css'; // Reutilizamos estilos de botones, tabla, etc.

const apiUrl = process.env.REACT_APP_API_URL;

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    //const navigate = useNavigate();

    const fetchClients = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/clients?page=${page}`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('Error al obtener los clientes.');
            const data = await response.json();
            setClients(data.clients);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients(currentPage);
    }, [currentPage]);

    const handleSave = async (clientData) => {
        const token = localStorage.getItem('token');
        const method = editingClient ? 'PUT' : 'POST';
        const url = editingClient ? `${apiUrl}/api/clients/${editingClient.client_id}` : `${apiUrl}/api/clients`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(clientData) });
            if (!response.ok) throw new Error('Error al guardar el cliente.');
            toast.success(`Cliente ${editingClient ? 'actualizado' : 'creado'} con éxito.`);
            if (currentPage !== 1) setCurrentPage(1); else fetchClients(1);
            setShowForm(false);
            setEditingClient(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = (clientId) => {
        const performDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${apiUrl}/api/clients/${clientId}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
                toast.success('Cliente eliminado con éxito');
                fetchClients(1);
            } catch (err) {
                toast.error(err.message);
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Estás seguro de que quieres eliminar este cliente?</p>
                <button onClick={() => { performDelete(); closeToast(); }}>Sí, eliminar</button>
                <button onClick={closeToast}>Cancelar</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEdit = (client) => { setEditingClient(client); setShowForm(true); };
    const handleAddNew = () => { setEditingClient(null); setShowForm(true); };
    const handleCancel = () => { setShowForm(false); setEditingClient(null); };

    const filteredClients = clients.filter(client =>
        client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.contact_email && client.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando clientes...</p>;

    return (
        <div>
            <h2 className="page-header-with-icon">
                <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                Mis Clientes
            </h2>
            <div className="client-toolbar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!showForm &&
                    <button onClick={handleAddNew} className="btn-primary">
                        Añadir Cliente
                    </button>
                }
            </div>
            {showForm && <ClientForm onSave={handleSave} onCancel={handleCancel} currentClient={editingClient} />}
            {!showForm && (
                <>
                    <hr />
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {filteredClients.map(client => (
                                    <tr key={client.client_id}>
                                        <td>{client.client_name}</td>
                                        <td>{client.contact_email}</td>
                                        <td>{client.contact_phone}</td>
                                        <td className="actions-cell">
                                            <button className="btn-edit" onClick={() => handleEdit(client)}>Editar</button>
                                            <button className="btn-delete" onClick={() => handleDelete(client.client_id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination-container" style={{ marginTop: '20px' }}>
                        <div></div>
                        <div className="pagination-text"><span>Página {currentPage} de {totalPages}</span></div>
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

export default Clients;