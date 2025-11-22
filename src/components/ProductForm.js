import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Eliminamos la importación de './ProductForm.css' y './ClientForm.css'
import axiomaIcon from '../assets/axioma-icon.png'; // Importamos el ícono

const apiUrl = process.env.REACT_APP_API_URL;

const ProductForm = ({ onSave, onCancel, currentProduct }) => {
    const [formData, setFormData] = useState({
        code: '', name: '', product_type: 'Ingreso', price: '', cost: '',
        gl_account_id: '', is_sales_item: true, is_purchase_item: false, is_service_item: false,
        tax1_name: '', tax1_applies: false, tax2_name: '', tax2_applies: false,
        tax3_name: '', tax3_applies: false, tax4_name: '', tax4_applies: false,
    });
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        // Cargar el plan de cuentas para el dropdown
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => setAccounts(data))
            .catch(err => toast.error("Error al cargar el plan de cuentas."));

        if (currentProduct) {
            // Aseguramos que los booleanos tengan valor
            setFormData({
                code: currentProduct.code || '',
                name: currentProduct.name || '',
                product_type: currentProduct.product_type || 'Ingreso',
                price: currentProduct.price || '',
                cost: currentProduct.cost || '',
                gl_account_id: currentProduct.gl_account_id || '',
                is_sales_item: !!currentProduct.is_sales_item,
                is_purchase_item: !!currentProduct.is_purchase_item,
                is_service_item: !!currentProduct.is_service_item,
                tax1_name: currentProduct.tax1_name || '', tax1_applies: !!currentProduct.tax1_applies,
                tax2_name: currentProduct.tax2_name || '', tax2_applies: !!currentProduct.tax2_applies,
                tax3_name: currentProduct.tax3_name || '', tax3_applies: !!currentProduct.tax3_applies,
                tax4_name: currentProduct.tax4_name || '', tax4_applies: !!currentProduct.tax4_applies,
            });
        } else {
            // Resetear a valores por defecto
            setFormData({
                code: '', name: '', product_type: 'Ingreso', price: '', cost: '',
                gl_account_id: '', is_sales_item: true, is_purchase_item: false, is_service_item: false,
                tax1_name: '', tax1_applies: false, tax2_name: '', tax2_applies: false,
                tax3_name: '', tax3_applies: false, tax4_name: '', tax4_applies: false,
            });
        }
    }, [currentProduct]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };

    // --- Componentes internos de Formulario ---
    const FormInput = ({ label, name, value, ...props }) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <input id={name} name={name} value={value || ''} onChange={onChange} {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
    const FormCheckbox = ({ label, name, checked }) => (
        <div className="flex items-center gap-2">
            <input type="checkbox" id={name} name={name} checked={!!checked} onChange={onChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
        </div>
    );
    const SectionHeader = ({ title }) => (
        <h3 className="md:col-span-2 lg:col-span-3 text-lg font-semibold text-gray-700 mt-6 border-b pb-2 mb-2">{title}</h3>
    );
    // --- Fin de Componentes internos ---

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h3 className="flex items-center gap-3 text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-7 h-7 object-contain" />
                {currentProduct ? 'Editar Producto/Servicio' : 'Nuevo Producto/Servicio'}
            </h3>
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <SectionHeader title="Información Principal" />
                    <FormInput label="Código" name="code" value={formData.code} type="text" />
                    <FormInput label="Nombre/Descripción" name="name" value={formData.name} type="text" required />
                    <FormSelect label="Tipo de Item" name="product_type" value={formData.product_type}>
                        <option value="Ingreso">Servicio/Ingreso</option>
                        <option value="Inventario">Producto de Inventario</option>
                        <option value="Gasto">Gasto/Compra</option>
                    </FormSelect>
                    <FormInput label="Precio de Venta" name="price" value={formData.price} type="number" step="0.01" required />
                    <FormInput label="Costo" name="cost" value={formData.cost} type="number" step="0.01" />
                    <FormSelect label="Cuenta Contable Principal" name="gl_account_id" value={formData.gl_account_id}>
                        <option value="">Selecciona una cuenta...</option>
                        {accounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_number} - {acc.account_name}</option>)}
                    </FormSelect>

                    <SectionHeader title="Aplicabilidad" />
                    <FormCheckbox label="Usado en Ventas (Aparece en Facturas)" name="is_sales_item" checked={formData.is_sales_item} />
                    <FormCheckbox label="Usado en Compras (Aparece en Facturas por Pagar)" name="is_purchase_item" checked={formData.is_purchase_item} />
                    <FormCheckbox label="Es un Servicio (No inventariable)" name="is_service_item" checked={formData.is_service_item} />

                    <SectionHeader title="Configuración de Impuestos" />
                    {/* Impuesto 1 */}
                    <FormInput label="Nombre del Impuesto 1" name="tax1_name" value={formData.tax1_name} type="text" />
                    <FormCheckbox label="Aplica Impuesto 1" name="tax1_applies" checked={formData.tax1_applies} />
                    <div></div> {/* Relleno de grid */}
                    {/* Impuesto 2 */}
                    <FormInput label="Nombre del Impuesto 2" name="tax2_name" value={formData.tax2_name} type="text" />
                    <FormCheckbox label="Aplica Impuesto 2" name="tax2_applies" checked={formData.tax2_applies} />
                    <div></div>
                    {/* Impuesto 3 */}
                    <FormInput label="Nombre del Impuesto 3" name="tax3_name" value={formData.tax3_name} type="text" />
                    <FormCheckbox label="Aplica Impuesto 3" name="tax3_applies" checked={formData.tax3_applies} />
                    <div></div>
                    {/* Impuesto 4 */}
                    <FormInput label="Nombre del Impuesto 4" name="tax4_name" value={formData.tax4_name} type="text" />
                    <FormCheckbox label="Aplica Impuesto 4" name="tax4_applies" checked={formData.tax4_applies} />
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button type="submit" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};
export default ProductForm;