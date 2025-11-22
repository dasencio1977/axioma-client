import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './Auth.css'

const apiUrl = process.env.REACT_APP_API_URL;

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { username, email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error en el registro');
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard';
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        // Usamos exactamente las mismas clases de Tailwind que en Login.js
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Axioma</h2>
                    <p className="text-gray-500 mt-2">Crea tu cuenta para empezar</p>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="mb-4 text-left">
                        <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre de Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={onChange}
                            required
                        />
                    </div>
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
                            minLength="6"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-bold hover:bg-gray-700 transition duration-300"
                    >
                        Crear Cuenta
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>¿Ya tienes una cuenta? <Link to="/login" className="text-blue-500 hover:underline font-bold">Inicia Sesión</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;