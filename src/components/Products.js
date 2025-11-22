import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProductForm from './ProductForm';
// Eliminamos la importación de './Invoices.css'
import axiomaIcon from '../assets/axioma-icon.png';

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
            setCurrentPage(data.currentPage); // Sincronizar
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(currentPage); }, [currentPage]);

    const handleSave = async (productData) => {
        const token = localStorage.getItem('token');
        const method = editingProduct ? 'PUT' : 'POST';
        const url = editingProduct ? `${apiUrl}/api/products/${editingProduct.product_id}` : `${apiUrl}/api/products`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(productData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error al guardar el producto.');
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
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiUrl}/api/products/${productId}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || 'Error al eliminar el producto.');
                toast.success('Producto eliminado.');
                fetchProducts(1);
            } catch (err) {
                toast.error(err.message);
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar este producto?</p>
                <button onClick={() => { performDelete(); closeToast(); }} className="mr-2 py-1 px-3 bg-red-600 text-white rounded-md">Sí</button>
                <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">No</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEdit = (product) => { setEditingProduct(product); setShowForm(true); };

    if (loading) return <p>Cargando...</p>;

    return (
        <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Productos y Servicios
            </h2>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Gestiona tu catálogo de items para facturación y gastos.</p>
                {!showForm && <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">Añadir Producto</button>}
            </div>
            {showForm && <ProductForm onSave={handleSave} onCancel={() => setShowForm(false)} currentProduct={editingProduct} />}
            {!showForm && (
                <>
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Código</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Costo</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.product_id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700 font-medium">{product.code}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{product.name}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{product.product_type}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700 text-right">${parseFloat(product.price).toFixed(2)}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700 text-right">${parseFloat(product.cost).toFixed(2)}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600" onClick={() => handleEdit(product)}>Editar</button>
                                                <button className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700" onClick={() => handleDelete(product.product_id)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                        <div></div>
                        <div className="text-sm text-gray-700 font-medium">
                            <span> Página {currentPage} de {totalPages} </span>
                        </div>
                        <div>
                            <button onClick={() => fetchProducts(currentPage - 1)} disabled={currentPage === 1} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Anterior</button>
                            <button onClick={() => fetchProducts(currentPage + 1)} disabled={currentPage >= totalPages} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed ml-2">Siguiente</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
export default Products;