import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Invoices.css'; // Reutilizamos estilos de tabla, botones y paginación
import './Vendors.css';   // Estilos específicos del toolbar

const apiUrl = process.env.REACT_APP_API_URL;

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const fetchVendors = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
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

    const handleDelete = (vendorId) => {
        const performDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${apiUrl}/api/vendors/${vendorId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                if (!response.ok) throw new Error('Error al eliminar el suplidor.');
                toast.success('Suplidor eliminado con éxito.');
                fetchVendors(1); // Volver a la primera página
            } catch (err) {
                toast.error(err.message);
            }
        };

        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar este suplidor?</p>
                <button onClick={() => { performDelete(); closeToast(); }}>Sí, eliminar</button>
                <button onClick={closeToast}>Cancelar</button>
            </div>
        );

        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    if (loading) return <p>Cargando suplidores...</p>;

    return (
        <div><h2 className="page-header-with-icon">
            <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
            <h2>Suplidores</h2>
        </h2>

            <div className="vendor-toolbar">
                <p>Gestiona tus proveedores y suplidores.</p>
                <button onClick={() => navigate('/vendors/new')} className="btn-primary">Añadir Suplidor</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((vendor) => (
                            <tr key={vendor.vendor_id}>
                                <td>{vendor.name}</td>
                                <td>{vendor.email}</td>
                                <td>{vendor.phone}</td>
                                <td className="actions-cell">
                                    <button className="btn-edit" onClick={() => navigate(`/vendors/edit/${vendor.vendor_id}`)}>Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(vendor.vendor_id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-container" style={{ marginTop: '20px' }}>
                <div></div> {/* Div vacío para empujar los controles al centro y derecha */}
                <div className="pagination-text">
                    <span>Página {currentPage} de {totalPages}</span>
                </div>
                <div>
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Anterior</button>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Siguiente</button>
                </div>
            </div>
        </div>
    );
};

export default Vendors;