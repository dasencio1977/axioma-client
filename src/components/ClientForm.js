// client/src/components/ClientForm.js

import React, { useState, useEffect } from 'react';
import './ClientForm.css';

const ClientForm = ({ onSave, onCancel, currentClient }) => {
    const [formData, setFormData] = useState({
        client_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
    });

    // useEffect se usa para llenar el formulario cuando editamos un cliente
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
    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="client-form-container">
            <h3>{currentClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="client_name">Nombre del Cliente</label>
                    <input id="client_name" type="text" name="client_name" value={formData.client_name} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="contact_email">Email</label>
                    <input id="contact_email" type="email" name="contact_email" value={formData.contact_email} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="contact_phone">Teléfono</label>
                    <input id="contact_phone" type="text" name="contact_phone" value={formData.contact_phone} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Dirección</label>
                    <textarea id="address" name="address" value={formData.address} onChange={onChange} />
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Cliente</button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;