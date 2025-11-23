import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiomaIcon from '../assets/axioma-icon.png';

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
        default_accounts_payable: '', default_cost_of_goods_sold: '',
        default_cash_account: '',
        tax1_name: '', tax1_rate: '', tax1_account_id: '',
        tax2_name: '', tax2_rate: '', tax2_account_id: '',
        tax3_name: '', tax3_rate: '', tax3_account_id: '',
        tax4_name: '', tax4_rate: '', tax4_account_id: ''
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
    }, [apiUrl]);

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
                if (typeof profileData[key] !== 'boolean' && (profileData[key] === null || profileData[key] === '')) {
                    profileData[key] = null;
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

    const FormInput = ({ label, name, value, ...props }) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <input id={name} name={name} value={value || ''} onChange={onChange} {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
        </div>
    );

    const FormSelect = ({ label, name, value, children }) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <select id={name} name={name} value={value || ''} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {children}
            </select>
        </div>
    );

    const SectionHeader = ({ title }) => (
        <h3 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-gray-700 mt-6 border-b pb-2 mb-2">{title}</h3>
    );

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8 max-w-6xl mx-auto">
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-6">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Configuración de la Empresa
            </h2>

            <div className="flex border-b-2 border-gray-200 mb-6">
                <button type="button" onClick={() => setActiveTab('general')}
                    className={`py-3 px-6 text-gray-500 font-medium hover:text-gray-800 focus:outline-none transition-colors ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>
                    Información General
                </button>
                <button type="button" onClick={() => setActiveTab('fiscal')}
                    className={`py-3 px-6 text-gray-500 font-medium hover:text-gray-800 focus:outline-none transition-colors ${activeTab === 'fiscal' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>
                    Fiscal y Contable
                </button>
                <button type="button" onClick={() => setActiveTab('accounts')}
                    className={`py-3 px-6 text-gray-500 font-medium hover:text-gray-800 focus:outline-none transition-colors ${activeTab === 'accounts' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>
                    Cuentas Vinculadas
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="tab-content">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <SectionHeader title="Información General" />
                            <FormInput label="Nombre de la Empresa" name="company_name" value={profile.company_name} type="text" />
                            <FormInput label="Email de Contacto" name="email" value={profile.email} type="email" />
                            <FormInput label="Teléfono" name="phone" value={profile.phone} type="text" />

                            <SectionHeader title="Dirección Física" />
                            <FormInput label="Línea 1" name="address_1" value={profile.address_1} type="text" />
                            <FormInput label="Línea 2" name="address_2" value={profile.address_2} type="text" />
                            <FormInput label="Línea 3" name="address_3" value={profile.address_3} type="text" />
                            <FormInput label="Ciudad / Pueblo" name="city" value={profile.city} type="text" />
                            <FormInput label="Estado / Provincia" name="state" value={profile.state} type="text" />
                            <FormInput label="País" name="country" value={profile.country} type="text" />
                            <FormInput label="Código Postal" name="zip_code" value={profile.zip_code} type="text" />

                            <SectionHeader title="Dirección Postal" />
                            <div className="md:col-span-3 flex items-center gap-2 mb-4">
                                <input type="checkbox" id="sameAsPhysical" name="is_postal_same_as_physical" checked={!!profile.is_postal_same_as_physical} onChange={onChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <label htmlFor="sameAsPhysical" className="text-sm font-medium text-gray-700">La dirección postal es la misma que la física</label>
                            </div>
                            <FormInput label="Línea 1" name="postal_address_1" value={profile.postal_address_1} type="text" disabled={profile.is_postal_same_as_physical} />
                            <FormInput label="Línea 2" name="postal_address_2" value={profile.postal_address_2} type="text" disabled={profile.is_postal_same_as_physical} />
                            <FormInput label="Línea 3" name="postal_address_3" value={profile.postal_address_3} type="text" disabled={profile.is_postal_same_as_physical} />
                            <FormInput label="Ciudad / Pueblo" name="postal_city" value={profile.postal_city} type="text" disabled={profile.is_postal_same_as_physical} />
                            <FormInput label="Estado / Provincia" name="postal_state" value={profile.postal_state} type="text" disabled={profile.is_postal_same_as_physical} />
                            <FormInput label="País" name="postal_country" value={profile.postal_country} type="text" disabled={profile.is_postal_same_as_physical} />
                            <FormInput label="Código Postal" name="postal_zip_code" value={profile.postal_zip_code} type="text" disabled={profile.is_postal_same_as_physical} />
                        </div>
                    )}

                    {activeTab === 'fiscal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <SectionHeader title="Información Fiscal y Legal" />
                            <FormInput label="EIN" name="ein" value={profile.ein} type="text" />
                            <FormInput label="ID de Corporación" name="corporation_id" value={profile.corporation_id} type="text" />
                            <FormInput label="Merchant ID" name="merchant_id" value={profile.merchant_id} type="text" />
                            <FormInput label="Fecha de Incorporación" name="incorporation_date" value={profile.incorporation_date} type="date" />

                            <SectionHeader title="Configuración Contable" />
                            <FormInput label="Comienzo del Año Fiscal" name="fiscal_year_start" value={profile.fiscal_year_start} type="date" />
                            <FormInput label="Moneda Base" name="base_currency" value={profile.base_currency} type="text" />

                            <SectionHeader title="Configuración de Impuestos" />
                            <p className="md:col-span-3 text-sm text-gray-500 -mt-4 mb-4">Define los impuestos globales. Asigna un nombre, una tasa (ej: 0.18 para 18%) y la cuenta de pasivo donde se registrará.</p>

                            {/* Tax 1 */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="md:col-span-3 font-semibold text-gray-700">Impuesto 1</h4>
                                <FormInput label="Nombre" name="tax1_name" value={profile.tax1_name} type="text" placeholder="Ej: ITBIS" />
                                <FormInput label="Tasa (Decimal)" name="tax1_rate" value={profile.tax1_rate} type="number" step="0.0001" placeholder="0.18" />
                                <FormSelect label="Cuenta de Pasivo" name="tax1_account_id" value={profile.tax1_account_id}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Pasivo').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                                </FormSelect>
                            </div>

                            {/* Tax 2 */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="md:col-span-3 font-semibold text-gray-700">Impuesto 2</h4>
                                <FormInput label="Nombre" name="tax2_name" value={profile.tax2_name} type="text" placeholder="Ej: ISR" />
                                <FormInput label="Tasa (Decimal)" name="tax2_rate" value={profile.tax2_rate} type="number" step="0.0001" placeholder="0.10" />
                                <FormSelect label="Cuenta de Pasivo" name="tax2_account_id" value={profile.tax2_account_id}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Pasivo').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                                </FormSelect>
                            </div>

                            {/* Tax 3 */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="md:col-span-3 font-semibold text-gray-700">Impuesto 3</h4>
                                <FormInput label="Nombre" name="tax3_name" value={profile.tax3_name} type="text" />
                                <FormInput label="Tasa (Decimal)" name="tax3_rate" value={profile.tax3_rate} type="number" step="0.0001" />
                                <FormSelect label="Cuenta de Pasivo" name="tax3_account_id" value={profile.tax3_account_id}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Pasivo').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                                </FormSelect>
                            </div>

                            {/* Tax 4 */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="md:col-span-3 font-semibold text-gray-700">Impuesto 4</h4>
                                <FormInput label="Nombre" name="tax4_name" value={profile.tax4_name} type="text" />
                                <FormInput label="Tasa (Decimal)" name="tax4_rate" value={profile.tax4_rate} type="number" step="0.0001" />
                                <FormSelect label="Cuenta de Pasivo" name="tax4_account_id" value={profile.tax4_account_id}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.account_type === 'Pasivo').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                                </FormSelect>
                            </div>
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <SectionHeader title="Cuentas Vinculadas por Defecto" />
                            <FormSelect label="Cuentas por Cobrar (Activo)" name="default_accounts_receivable" value={profile.default_accounts_receivable}>
                                <option value="">Seleccionar...</option>
                                {accounts.filter(a => a.account_type === 'Activo').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                            </FormSelect>
                            <FormSelect label="Ingresos por Ventas (Ingreso)" name="default_sales_income" value={profile.default_sales_income}>
                                <option value="">Seleccionar...</option>
                                {accounts.filter(a => a.account_type === 'Ingreso').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                            </FormSelect>
                            <FormSelect label="Cuentas por Pagar (Pasivo)" name="default_accounts_payable" value={profile.default_accounts_payable}>
                                <option value="">Seleccionar...</option>
                                {accounts.filter(a => a.account_type === 'Pasivo').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                            </FormSelect>
                            <FormSelect label="Costo de Bienes Vendidos (Gasto)" name="default_cost_of_goods_sold" value={profile.default_cost_of_goods_sold}>
                                <option value="">Seleccionar...</option>
                                {accounts.filter(a => a.account_type === 'Gasto').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                            </FormSelect>
                            <FormSelect label="Cuenta de Efectivo/Banco (Activo)" name="default_cash_account" value={profile.default_cash_account}>
                                <option value="">Seleccionar...</option>
                                {accounts.filter(a => a.account_type === 'Activo').map(acc => (<option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>))}
                            </FormSelect>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button type="submit" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;