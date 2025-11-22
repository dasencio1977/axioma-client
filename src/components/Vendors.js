import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import VendorForm from './VendorForm';
// Eliminamos la importación de './Invoices.css' y './Vendors.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(''); // Estado para la búsqueda

    const fetchVendors = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            // Añadimos el término de búsqueda a la API (si tienes la lógica en el backend)
            // Por ahora, filtraremos en el frontend
            const response = await fetch(`${apiUrl}/api/vendors?page=${page}`, {
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Error al obtener los suplidores.');
            const data = await response.json();
            setVendors(data.vendors);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors(currentPage);
    }, [currentPage]);

    const handleSave = async (vendorData) => {
        const token = localStorage.getItem('token');
        const method = editingVendor ? 'PUT' : 'POST';
        const url = editingVendor
            ? `${apiUrl}/api/vendors/${editingVendor.vendor_id}`
            : `${apiUrl}/api/vendors`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(vendorData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error al guardar el suplidor.');
            }
            toast.success(`Suplidor ${editingVendor ? 'actualizado' : 'creado'} con éxito.`);
            fetchVendors(1);
            setShowForm(false);
            setEditingVendor(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = (vendorId) => {
        const performDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${apiUrl}/api/vendors/${vendorId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                toast.success('Suplidor eliminado con éxito');
                fetchVendors(1);
            } catch (err) {
                toast.error('Error al eliminar el suplidor.');
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar este suplidor?</p>
                <button onClick={() => { performDelete(); closeToast(); }} className="mr-2 py-1 px-3 bg-red-600 text-white rounded-md">Sí</button>
                <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">No</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingVendor(null); // Asegurarse de que no hay datos de edición
        setShowForm(true);
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando suplidores...</p>;

    return (
        <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Suplidores
            </h2>
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
                        Añadir Suplidor
                    </button>
                }
            </div>

            {showForm && <VendorForm onSave={handleSave} onCancel={() => setShowForm(false)} currentVendor={editingVendor} />}

            {!showForm && (
                <>
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700">{vendor.name}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{vendor.email || '--'}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{vendor.phone || '--'}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600" onClick={() => handleEdit(vendor)}>Editar</button>
                                                <button className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700" onClick={() => handleDelete(vendor.vendor_id)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                        <div className="text-sm text-gray-700 font-medium">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div>
                            <button onClick={() => fetchVendors(currentPage - 1)} disabled={currentPage === 1} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Anterior</button>
                            <button onClick={() => fetchVendors(currentPage + 1)} disabled={currentPage >= totalPages} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed ml-2">Siguiente</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Vendors;