// client/src/components/ProductForm.js
import React, { useState, useEffect } from 'react';
import './ProductForm.css';
import './ClientForm.css'; // Reutilizamos estilos


const ProductForm = ({ onSave, onCancel, currentProduct }) => {
    const [formData, setFormData] = useState({
        code: '', name: '', product_type: 'Ingreso', price: '', cost: '',
        account_name: '', sub_account: '', tax_account: '', tax1_name: '', tax1_applies: false, tax2_name: '', tax2_applies: false,
        tax3_name: '', tax3_applies: false, tax4_name: '', tax4_applies: false,
    });

    useEffect(() => {
        if (currentProduct) {
            setFormData(currentProduct);
        } else {
            setFormData({
                code: '', name: '', product_type: 'Ingreso', price: '', cost: '',
                account_name: '', sub_account: '', tax_account: '', tax1_name: '', tax1_applies: false, tax2_name: '', tax2_applies: false,
                tax3_name: '', tax3_applies: false, tax4_name: '', tax4_applies: false,
            });
        }
    }, [currentProduct]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="product-form-container">
            <h3>{currentProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group"><label>Código</label><input type="text" name="code" value={formData.code} onChange={onChange} /></div>
                <div className="form-group"><label>Nombre/Descripción</label><input type="text" name="name" value={formData.name} onChange={onChange} required /></div>
                <div className="form-group"><label>Tipo</label><select name="product_type" value={formData.product_type} onChange={onChange} required><option value="Ingreso">Ingreso</option><option value="Gasto">Gasto</option></select></div>
                <div className="form-group"><label>Precio de Venta</label><input type="number" name="price" value={formData.price} onChange={onChange} required /></div>
                <div className="form-group"><label>Costo</label><input type="number" name="cost" value={formData.cost} onChange={onChange} /></div>
                <div className="form-group"><label>Cuenta Contable</label><input type="text" name="account_name" value={formData.account_name} onChange={onChange} /></div>
                <div className="form-group"><label>Sub-Cuenta</label><input type="text" name="sub_account" value={formData.sub_account} onChange={onChange} /></div>
                <div className="form-group"><label>Cuenta de Impuesto</label><input type="text" name="tax_account" value={formData.tax_account} onChange={onChange} /></div>
                <h4 className="form-section-header">Configuración de Impuestos</h4>
                <div className="tax-grid">
                    {/* Impuesto 1 */}
                    <div className="form-group"><label>Nombre del Impuesto 1</label><input type="text" name="tax1_name" value={formData.tax1_name || ''} onChange={onChange} /></div>
                    <div className="form-group checkbox-group"><input type="checkbox" name="tax1_applies" checked={!!formData.tax1_applies} onChange={onChange} /><label>Aplica</label></div>
                    {/* Impuesto 2 */}
                    <div className="form-group"><label>Nombre del Impuesto 2</label><input type="text" name="tax2_name" value={formData.tax2_name || ''} onChange={onChange} /></div>
                    <div className="form-group checkbox-group"><input type="checkbox" name="tax2_applies" checked={!!formData.tax2_applies} onChange={onChange} /><label>Aplica</label></div>
                    {/* Impuesto 3 */}
                    <div className="form-group"><label>Nombre del Impuesto 3</label><input type="text" name="tax3_name" value={formData.tax3_name || ''} onChange={onChange} /></div>
                    <div className="form-group checkbox-group"><input type="checkbox" name="tax3_applies" checked={!!formData.tax3_applies} onChange={onChange} /><label>Aplica</label></div>
                    {/* Impuesto 4 */}
                    <div className="form-group"><label>Nombre del Impuesto 4</label><input type="text" name="tax4_name" value={formData.tax4_name || ''} onChange={onChange} /></div>
                    <div className="form-group checkbox-group"><input type="checkbox" name="tax4_applies" checked={!!formData.tax4_applies} onChange={onChange} /><label>Aplica</label></div>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};
export default ProductForm;