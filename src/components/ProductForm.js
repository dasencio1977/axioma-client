// client/src/components/ProductForm.js
import React, { useState, useEffect } from 'react';
import './ProductForm.css';
import './ClientForm.css'; // Reutilizamos estilos


const ProductForm = ({ onSave, onCancel, currentProduct }) => {
    const [formData, setFormData] = useState({
        code: '', name: '', product_type: 'Ingreso', price: '', cost: '',
        account_name: '', sub_account: '', tax_account: ''
    });

    useEffect(() => {
        if (currentProduct) {
            setFormData(currentProduct);
        } else {
            setFormData({
                code: '', name: '', product_type: 'Ingreso', price: '', cost: '',
                account_name: '', sub_account: '', tax_account: ''
            });
        }
    }, [currentProduct]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
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
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};
export default ProductForm;