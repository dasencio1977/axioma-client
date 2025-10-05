// client/src/components/VendorForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ClientForm.css'; // Reutilizamos estilos de grupo de formulario
import './VendorForm.css'; // Estilos específicos para la rejilla

const apiUrl = process.env.REACT_APP_API_URL;

const VendorForm = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', ein: '', corporation_id: '', merchant_id: '',
        contact_first_name: '', contact_middle_initial: '', contact_last_name: '', contact_phone: '',
        physical_address_1: '', physical_address_2: '', physical_address_3: '',
        physical_city: '', physical_state: '', physical_country: '', physical_zip_code: '',
        is_postal_same_as_physical: false,
        postal_address_1: '', postal_address_2: '', postal_address_3: '',
        postal_city: '', postal_state: '', postal_country: '', postal_zip_code: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const fetchVendor = useCallback(async () => {
        if (id) {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiUrl}/api/vendors/${id}`, { // Nota: Necesitaremos crear este endpoint
                    headers: { 'x-auth-token': token },
                });
                if (!response.ok) throw new Error('No se pudo cargar el suplidor.');
                const data = await response.json();
                setFormData(data);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
    }, [id]);

    useEffect(() => {
        fetchVendor();
    }, [fetchVendor]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newState = { ...prev, [name]: val };
            // Lógica para el checkbox de la dirección
            if (name === 'is_postal_same_as_physical' && checked) {
                return {
                    ...newState,
                    postal_address_1: newState.physical_address_1, postal_address_2: newState.physical_address_2,
                    postal_address_3: newState.physical_address_3, postal_city: newState.physical_city,
                    postal_state: newState.physical_state, postal_country: newState.physical_country,
                    postal_zip_code: newState.physical_zip_code,
                };
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/api/vendors/${id}` : `${apiUrl}/api/vendors`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Error al guardar el suplidor.');
            toast.success(`Suplidor ${id ? 'actualizado' : 'creado'} con éxito.`);
            navigate('/vendors');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando suplidor...</p>;

    return (
        <div className="client-form-container">
            <h3>{id ? 'Editar Suplidor' : 'Nuevo Suplidor'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="vendor-form-grid">
                    <h4 className="form-section-header">Información Principal</h4>
                    <div className="form-group"><label>Nombre del Suplidor</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Email Principal</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Teléfono Principal</label><input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>

                    <h4 className="form-section-header">Identificadores</h4>
                    <div className="form-group"><label>EIN</label><input type="text" name="ein" value={formData.ein || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Corporation ID</label><input type="text" name="corporation_id" value={formData.corporation_id || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Merchant ID</label><input type="text" name="merchant_id" value={formData.merchant_id || ''} onChange={handleChange} /></div>

                    <h4 className="form-section-header">Persona de Contacto</h4>
                    <div className="form-group"><label>Nombre</label><input type="text" name="contact_first_name" value={formData.contact_first_name || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Inicial</label><input type="text" name="contact_middle_initial" value={formData.contact_middle_initial || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Apellido</label><input type="text" name="contact_last_name" value={formData.contact_last_name || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Teléfono del Contacto</label><input type="text" name="contact_phone" value={formData.contact_phone || ''} onChange={handleChange} /></div>

                    <h4 className="form-section-header">Dirección Física</h4>
                    <div className="form-group"><label>Línea 1</label><input type="text" name="physical_address_1" value={formData.physical_address_1 || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Línea 2</label><input type="text" name="physical_address_2" value={formData.physical_address_2 || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Ciudad</label><input type="text" name="physical_city" value={formData.physical_city || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Estado/Provincia</label><input type="text" name="physical_state" value={formData.physical_state || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>País</label><input type="text" name="physical_country" value={formData.physical_country || ''} onChange={handleChange} /></div>
                    <div className="form-group"><label>Código Postal</label><input type="text" name="physical_zip_code" value={formData.physical_zip_code || ''} onChange={handleChange} /></div>


                    <h4 className="form-section-header">Dirección Postal</h4>
                    <div className="form-group checkbox-group" style={{ gridColumn: '1 / -1' }}>
                        <input type="checkbox" id="sameAsPhysical" name="is_postal_same_as_physical" checked={!!formData.is_postal_same_as_physical} onChange={handleChange} />
                        <label htmlFor="sameAsPhysical">La dirección postal es la misma que la física</label>
                    </div>

                    <div className="form-group"><label>Línea 1</label><input type="text" name="postal_address_1" value={formData.postal_address_1 || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical} /></div>
                    <div className="form-group"><label>Línea 2</label><input type="text" name="postal_address_2" value={formData.postal_address_2 || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical} /></div>
                    <div className="form-group"><label>Ciudad</label><input type="text" name="postal_city" value={formData.postal_city || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical} /></div>
                    <div className="form-group"><label>Estado/Provincia</label><input type="text" name="postal_state" value={formData.postal_state || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical} /></div>
                    <div className="form-group"><label>País</label><input type="text" name="postal_country" value={formData.postal_country || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical} /></div>
                    <div className="form-group"><label>Código Postal</label><input type="text" name="postal_zip_code" value={formData.postal_zip_code || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical} /></div>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/vendors')}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Suplidor</button>
                </div>
            </form>
        </div>
    );
};
export default VendorForm;