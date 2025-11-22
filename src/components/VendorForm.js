import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './ClientForm.css' y './VendorForm.css'

const apiUrl = process.env.REACT_APP_API_URL;

const VendorForm = ({ onSave, onCancel, currentVendor }) => {
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
    const navigate = useNavigate(); // 'navigate' se usa en los botones de acción
    const { id } = useParams();

    // Cargar datos para editar
    useEffect(() => {
        if (id && currentVendor) {
            setFormData(currentVendor);
        } else if (!id) {
            // Limpiar formulario para "nuevo"
            setFormData({
                name: '', email: '', phone: '', ein: '', corporation_id: '', merchant_id: '',
                contact_first_name: '', contact_middle_initial: '', contact_last_name: '', contact_phone: '',
                physical_address_1: '', physical_address_2: '', physical_address_3: '',
                physical_city: '', physical_state: '', physical_country: '', physical_zip_code: '',
                is_postal_same_as_physical: false,
                postal_address_1: '', postal_address_2: '', postal_address_3: '',
                postal_city: '', postal_state: '', postal_country: '', postal_zip_code: ''
            });
        }
    }, [id, currentVendor]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newState = { ...prev, [name]: val };
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (loading) return <p>Cargando suplidor...</p>;

    return (
        // Contenedor del formulario: tarjeta blanca con sombra
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                {id ? 'Editar Suplidor' : 'Nuevo Suplidor'}
            </h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* --- Información Principal --- */}
                    <h4 className="md:col-span-3 text-lg font-semibold text-gray-700 mt-4 border-b pb-2 mb-2">Información Principal</h4>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Suplidor</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Principal</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono Principal</label>
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* --- Identificadores --- */}
                    <h4 className="md:col-span-3 text-lg font-semibold text-gray-700 mt-4 border-b pb-2 mb-2">Identificadores</h4>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">EIN</label>
                        <input type="text" name="ein" value={formData.ein || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Corporation ID</label>
                        <input type="text" name="corporation_id" value={formData.corporation_id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Merchant ID</label>
                        <input type="text" name="merchant_id" value={formData.merchant_id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* --- Persona de Contacto --- */}
                    <h4 className="md:col-span-3 text-lg font-semibold text-gray-700 mt-4 border-b pb-2 mb-2">Persona de Contacto</h4>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                        <input type="text" name="contact_first_name" value={formData.contact_first_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Inicial</label>
                        <input type="text" name="contact_middle_initial" value={formData.contact_middle_initial || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Apellido</label>
                        <input type="text" name="contact_last_name" value={formData.contact_last_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono del Contacto</label>
                        <input type="text" name="contact_phone" value={formData.contact_phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* --- Dirección Física --- */}
                    <h4 className="md:col-span-3 text-lg font-semibold text-gray-700 mt-4 border-b pb-2 mb-2">Dirección Física</h4>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Línea 1</label>
                        <input type="text" name="physical_address_1" value={formData.physical_address_1 || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Línea 2</label>
                        <input type="text" name="physical_address_2" value={formData.physical_address_2 || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Línea 3</label>
                        <input type="text" name="physical_address_3" value={formData.physical_address_3 || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ciudad</label>
                        <input type="text" name="physical_city" value={formData.physical_city || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Estado/Provincia</label>
                        <input type="text" name="physical_state" value={formData.physical_state || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">País</label>
                        <input type="text" name="physical_country" value={formData.physical_country || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Código Postal</label>
                        <input type="text" name="physical_zip_code" value={formData.physical_zip_code || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* --- Dirección Postal --- */}
                    <h4 className="md:col-span-3 text-lg font-semibold text-gray-700 mt-4 border-b pb-2 mb-2">Dirección Postal</h4>
                    <div className="md:col-span-3 flex items-center gap-2 mb-4">
                        <input type="checkbox" id="sameAsPhysical" name="is_postal_same_as_physical" checked={!!formData.is_postal_same_as_physical} onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="sameAsPhysical" className="text-sm font-medium text-gray-700">La dirección postal es la misma que la física</label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Línea 1</label>
                        <input type="text" name="postal_address_1" value={formData.postal_address_1 || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Línea 2</label>
                        <input type="text" name="postal_address_2" value={formData.postal_address_2 || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Línea 3</label>
                        <input type="text" name="postal_address_3" value={formData.postal_address_3 || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ciudad</label>
                        <input type="text" name="postal_city" value={formData.postal_city || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Estado/Provincia</label>
                        <input type="text" name="postal_state" value={formData.postal_state || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">País</label>
                        <input type="text" name="postal_country" value={formData.postal_country || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Código Postal</label>
                        <input type="text" name="postal_zip_code" value={formData.postal_zip_code || ''} onChange={handleChange} disabled={formData.is_postal_same_as_physical}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                    </div>
                </div>
                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button
                        type="button"
                        className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Guardar Suplidor
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VendorForm;