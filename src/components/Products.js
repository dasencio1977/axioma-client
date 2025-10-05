// client/src/components/Products.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProductForm from './ProductForm';
import './Invoices.css'; // Reutilizamos muchos estilos

const apiUrl = process.env.REACT_APP_API_URL;

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProducts = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/products?page=${page}`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('Error al obtener los productos.');
            const data = await response.json();
            setProducts(data.products);
            setTotalPages(data.totalPages);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(currentPage); }, [currentPage]);

    const handleSave = async (productData) => {
        const cleanData = {
            ...productData,
            price: parseFloat(productData.price) || 0,
            cost: parseFloat(productData.cost) || 0,
        };

        const token = localStorage.getItem('token');
        const method = editingProduct ? 'PUT' : 'POST';

        // LA CORRECCIÓN: Añadimos la URL completa del backend también para la creación.
        const url = editingProduct
            ? `${apiUrl}/api/products/${editingProduct.product_id}`
            : `${apiUrl}/api/products`; // <-- Aquí estaba el error

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(cleanData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error al guardar el producto.');
            }

            toast.success('Producto guardado.');
            fetchProducts(1);
            setShowForm(false);
            setEditingProduct(null);
        } catch (err) {
            toast.error(err.message);
        }
    };
    const handleDelete = (productId) => {
        const performDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${apiUrl}/api/products/${productId}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
                toast.success('Producto eliminado.');
                fetchProducts(1);
            } catch (err) {
                toast.error(err.message);
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar este producto?</p>
                <button onClick={() => { performDelete(); closeToast(); }}>Sí</button>
                <button onClick={closeToast}>No</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEdit = (product) => { setEditingProduct(product); setShowForm(true); };

    if (loading) return <p>Cargando...</p>;

    return (
        <div><h2 className="page-header-with-icon">
            <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
            <h2>Productos y Servicios</h2>
        </h2>

            <div className="invoice-toolbar">
                <p>Gestiona tu catálogo de items para facturación y gastos.</p>
                {!showForm && <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="btn-primary">Añadir Producto</button>}
            </div>
            {showForm && <ProductForm onSave={handleSave} onCancel={() => setShowForm(false)} currentProduct={editingProduct} />}
            {!showForm && (
                <>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Costo</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.product_id}>
                                        <td>{product.code}</td>
                                        <td>{product.name}</td>
                                        <td>{product.product_type}</td>
                                        <td>${parseFloat(product.price).toFixed(2)}</td>
                                        <td>${parseFloat(product.cost).toFixed(2)}</td>
                                        <td className="actions-cell">
                                            <button className="btn-edit" onClick={() => handleEdit(product)}>Editar</button>
                                            <button className="btn-delete" onClick={() => handleDelete(product.product_id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination-container">
                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Anterior</button>
                        <span> Página {currentPage} de {totalPages} </span>
                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Siguiente</button>
                    </div>
                </>
            )}
        </div>
    );
};
export default Products;