import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './Auth.css'

const apiUrl = process.env.REACT_APP_API_URL;

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error en el inicio de sesión');
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard'; // Redirige al dashboard
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        // Contenedor principal: ocupa toda la pantalla, centra todo y pone un fondo gris claro
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            {/* La caja de login: fondo blanco, padding, esquinas redondeadas, sombra y ancho máximo */}
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    {/* Encabezado */}
                    <h2 className="text-3xl font-bold text-gray-800">Axioma Accounting Pro</h2>
                    <p className="text-gray-500 mt-2">Bienvenido de Nuevo</p>
                    <p className="text-xs text-gray-400 mt-1">v1.3.0</p>
                </div>
                <form onSubmit={onSubmit}>
                    {/* Grupo de formulario */}
                    <div className="mb-4 text-left">
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="mb-6 text-left">
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    {/* Botón principal */}
                    <button
                        type="submit"
                        className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-bold hover:bg-gray-700 transition duration-300"
                    >
                        Iniciar Sesión
                    </button>
                </form>
                {/* Enlace inferior */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>¿No tienes una cuenta? <Link to="/register" className="text-blue-500 hover:underline font-bold">Regístrate</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;