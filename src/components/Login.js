// client/src/components/Login.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        // ... (toda tu lógica de onSubmit se mantiene igual)
        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error en el inicio de sesión');
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard';
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>Axioma</h2>
                    <p>Bienvenido de nuevo</p>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input id="email" type="email" name="email" className="auth-input" value={email} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input id="password" type="password" name="password" className="auth-input" value={password} onChange={onChange} required />
                    </div>
                    <button type="submit" className="auth-button">Iniciar Sesión</button>
                </form>
                <div className="auth-link">
                    <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;