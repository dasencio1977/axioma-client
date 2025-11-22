import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Eliminamos la importación de './ClientForm.css'

const apiUrl = process.env.REACT_APP_API_URL;

const ClientForm = ({ onSave, onCancel, currentClient }) => {
    const [formData, setFormData] = useState({
        client_name: '',
        contact_email: '',
        contact_phone: '',
        address: '', // Asumimos que aún usamos un solo campo de dirección
    });

    useEffect(() => {
        if (currentClient) {
            setFormData({
                client_name: currentClient.client_name || '',
                contact_email: currentClient.contact_email || '',
                contact_phone: currentClient.contact_phone || '',
                address: currentClient.address || '',
            });
        } else {
            setFormData({ client_name: '', contact_email: '', contact_phone: '', address: '' });
        }
    }, [currentClient]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = (e) => {
        e.preventDefault();
        // Validamos que el nombre no esté vacío, por si acaso
        if (!formData.client_name) {
            toast.error("El nombre del cliente es obligatorio.");
            return;
        }
        onSave(formData);
    };

    return (
        // Contenedor del formulario: tarjeta blanca con sombra, reemplaza a .client-form-container
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                {currentClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
            </h3>
            <form onSubmit={onSubmit}>
                {/* Usamos un grid para un layout responsivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grupo de formulario */}
                    <div className="mb-4">
                        <label htmlFor="client_name" className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre del Cliente
                        </label>
                        <input
                            id="client_name"
                            type="text"
                            name="client_name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.client_name}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="contact_email" className="block text-sm font-bold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            id="contact_email"
                            type="email"
                            name="contact_email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.contact_email}
                            onChange={onChange}
                        />
                    </div>
                    <div className="mb-4 md:col-span-2">
                        <label htmlFor="contact_phone" className="block text-sm font-bold text-gray-700 mb-2">
                            Teléfono
                        </label>
                        <input
                            id="contact_phone"
                            type="text"
                            name="contact_phone"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.contact_phone}
                            onChange={onChange}
                        />
                    </div>
                    <div className="mb-4 md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">
                            Dirección
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.address}
                            onChange={onChange}
                        />
                    </div>
                </div>
                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-6">
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
                        Guardar Cliente
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;