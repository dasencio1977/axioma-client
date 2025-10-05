import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ClientForm.css'; // Reutilizamos estilos de form-group
import './Settings.css';   // Estilos específicos de la página y pestañas

const apiUrl = process.env.REACT_APP_API_URL;

const Settings = () => {
    const [profile, setProfile] = useState({
        company_name: '', email: '', phone: '', ein: '', corporation_id: '',
        merchant_id: '', address_1: '', address_2: '', address_3: '',
        city: '', state: '', country: '', zip_code: '',
        is_postal_same_as_physical: false,
        postal_address_1: '', postal_address_2: '', postal_address_3: '',
        postal_city: '', postal_state: '', postal_country: '', postal_zip_code: '',
        fiscal_year_start: '', base_currency: 'USD', incorporation_date: '',
        default_accounts_receivable: '', default_sales_income: '',
        default_accounts_payable: '', default_cost_of_goods_sold: ''
    });
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const [profileRes, accountsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
                ]);
                if (!profileRes.ok || !accountsRes.ok) throw new Error('Error al cargar datos de configuración.');

                const profileData = await profileRes.json();
                const accountsData = await accountsRes.json();

                profileData.fiscal_year_start = profileData.fiscal_year_start ? new Date(profileData.fiscal_year_start).toISOString().slice(0, 10) : '';
                profileData.incorporation_date = profileData.incorporation_date ? new Date(profileData.incorporation_date).toISOString().slice(0, 10) : '';

                setProfile(prev => ({ ...prev, ...profileData }));
                setAccounts(accountsData);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setProfile(prev => {
            const newState = { ...prev, [name]: val };
            if (name === 'is_postal_same_as_physical' && checked) {
                return {
                    ...newState,
                    postal_address_1: newState.address_1, postal_address_2: newState.address_2, postal_address_3: newState.address_3,
                    postal_city: newState.city, postal_state: newState.state, postal_country: newState.country, postal_zip_code: newState.zip_code,
                };
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const profileData = { ...profile };
            Object.keys(profileData).forEach(key => {
                if (profileData[key] === null || profileData[key] === '') {
                    delete profileData[key];
                }
            });
            const response = await fetch(`${apiUrl}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(profileData),
            });
            if (!response.ok) throw new Error('Error al guardar el perfil.');
            toast.success('¡Perfil guardado con éxito!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando configuración...</p>;

    return (
        <div className="settings-form-container">
            <h2>Configuración de la Empresa</h2>

            <div className="settings-tabs">
                <button type="button" className={`tab-button ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>Información General</button>
                <button type="button" className={`tab-button ${activeTab === 'fiscal' ? 'active' : ''}`} onClick={() => setActiveTab('fiscal')}>Fiscal y Contable</button>
                <button type="button" className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Cuentas Vinculadas</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="tab-content">
                    {activeTab === 'general' && (
                        <div className="settings-grid">
                            <h3 className="form-section-header">Información General</h3>
                            <div className="form-group"><label>Nombre de la Empresa</label><input type="text" name="company_name" value={profile.company_name || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Email de Contacto</label><input type="email" name="email" value={profile.email || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Teléfono</label><input type="text" name="phone" value={profile.phone || ''} onChange={onChange} /></div>

                            <h3 className="form-section-header">Dirección Física</h3>
                            <div className="form-group"><label>Línea 1</label><input type="text" name="address_1" value={profile.address_1 || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Línea 2</label><input type="text" name="address_2" value={profile.address_2 || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Línea 3</label><input type="text" name="address_3" value={profile.address_3 || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Ciudad / Pueblo</label><input type="text" name="city" value={profile.city || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Estado / Provincia</label><input type="text" name="state" value={profile.state || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Código Postal</label><input type="text" name="zip_code" value={profile.zip_code || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>País</label><input type="text" name="country" value={profile.country || ''} onChange={onChange} /></div>

                            <h3 className="form-section-header">Dirección Postal</h3>
                            <div className="form-group checkbox-group" style={{ gridColumn: '1 / -1' }}>
                                <input type="checkbox" id="sameAsPhysical" name="is_postal_same_as_physical" checked={!!profile.is_postal_same_as_physical} onChange={onChange} />
                                <label htmlFor="sameAsPhysical">La dirección postal es la misma que la física</label>
                            </div>
                            <div className="form-group"><label>Línea 1</label><input type="text" name="postal_address_1" value={profile.postal_address_1 || ''} onChange={onChange} disabled={profile.is_postal_same_as_physical} /></div>
                            <div className="form-group"><label>Línea 2</label><input type="text" name="postal_address_2" value={profile.postal_address_2 || ''} onChange={onChange} disabled={profile.is_postal_same_as_physical} /></div>
                            <div className="form-group"><label>Línea 3</label><input type="text" name="postal_address_3" value={profile.postal_address_3 || ''} onChange={onChange} disabled={profile.is_postal_same_as_physical} /></div>
                            <div className="form-group"><label>Ciudad / Pueblo</label><input type="text" name="postal_city" value={profile.postal_city || ''} onChange={onChange} disabled={profile.is_postal_same_as_physical} /></div>
                            <div className="form-group"><label>Estado / Provincia</label><input type="text" name="postal_state" value={profile.postal_state || ''} onChange={onChange} disabled={profile.is_postal_same_as_physical} /></div>
                            <div className="form-group"><label>Código Postal</label><input type="text" name="postal_zip_code" value={profile.postal_zip_code || ''} onChange={onChange} disabled={profile.is_postal_same_as_physical} /></div>
                            <div className="form-group"><label>País</label><input type="text" name="postal_country" value={profile.postal_country || ''} onChange={onChange} disabled={profile.is_postal_same_as_physical} /></div>
                        </div>
                    )}

                    {activeTab === 'fiscal' && (
                        <div className="settings-grid">
                            <h3 className="form-section-header">Información Fiscal y Legal</h3>
                            <div className="form-group"><label>EIN</label><input type="text" name="ein" value={profile.ein || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>ID de Corporación</label><input type="text" name="corporation_id" value={profile.corporation_id || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Merchant ID</label><input type="text" name="merchant_id" value={profile.merchant_id || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Fecha de Incorporación</label><input type="date" name="incorporation_date" value={profile.incorporation_date || ''} onChange={onChange} /></div>

                            <h3 className="form-section-header">Configuración Contable</h3>
                            <div className="form-group"><label>Comienzo del Año Fiscal</label><input type="date" name="fiscal_year_start" value={profile.fiscal_year_start || ''} onChange={onChange} /></div>
                            <div className="form-group"><label>Moneda Base</label><input type="text" name="base_currency" value={profile.base_currency || 'USD'} onChange={onChange} /></div>
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className="settings-grid">
                            <h3 className="form-section-header">Cuentas Vinculadas por Defecto</h3>
                            <div className="form-group">
                                <label>Cuentas por Cobrar (Activo)</label>
                                <select name="default_accounts_receivable" value={profile.default_accounts_receivable || ''} onChange={onChange}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Activo').map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ingresos por Ventas (Ingreso)</label>
                                <select name="default_sales_income" value={profile.default_sales_income || ''} onChange={onChange}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Ingreso').map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cuentas por Pagar (Pasivo)</label>
                                <select name="default_accounts_payable" value={profile.default_accounts_payable || ''} onChange={onChange}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Pasivo').map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Costo de Bienes Vendidos (Gasto)</label>
                                <select name="default_cost_of_goods_sold" value={profile.default_cost_of_goods_sold || ''} onChange={onChange}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Gasto').map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">Guardar Cambios</button>
                </div>
            </form>
        </div>
    );
};

export default Settings;