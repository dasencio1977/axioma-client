import React, { useState, useEffect } from 'react';
import ClientForm from './ClientForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Eliminamos la importación de './Clients.css' y './Invoices.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate(); // 'navigate' está definido pero no se usa, lo quitamos si no se usa

    // --- LÓGICA DE DATOS (sin cambios) ---
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
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error al guardar el cliente.');
            }
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
            const token = localStorage.getItem('token');
            try {
                await fetch(`${apiUrl}/api/clients/${clientId}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
                toast.success('Cliente eliminado con éxito');
                fetchClients(1);
            } catch (err) {
                toast.error('Error al eliminar el cliente.');
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Estás seguro de que quieres eliminar este cliente?</p>
                <button onClick={() => { performDelete(); closeToast(); }} className="mr-2 py-1 px-3 bg-red-600 text-white rounded-md">Sí, eliminar</button>
                <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
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
            {/* --- Encabezado --- */}
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Mis Clientes
            </h2>

            {/* --- Barra de Herramientas (Toolbar) --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!showForm &&
                    <button
                        onClick={handleAddNew}
                        className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors w-full md:w-auto"
                    >
                        Añadir Cliente
                    </button>
                }
            </div>

            {/* --- Formulario (se muestra condicionalmente) --- */}
            {showForm && <ClientForm onSave={handleSave} onCancel={handleCancel} currentClient={editingClient} />}

            {/* --- Lista y Paginación (se muestran condicionalmente) --- */}
            {!showForm && (
                <>
                    {/* --- Contenedor de la Tabla --- */}
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            {/* Encabezado de la tabla */}
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredClients.map(client => (
                                    <tr key={client.client_id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700">{client.client_name}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{client.contact_email}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{client.contact_phone}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            {/* Botones de Acción */}
                                            <div className="flex gap-2">
                                                <button
                                                    className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
                                                    onClick={() => handleEdit(client)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                                                    onClick={() => handleDelete(client.client_id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Controles de Paginación --- */}
                    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                        <div className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchClients(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => fetchClients(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Clients;