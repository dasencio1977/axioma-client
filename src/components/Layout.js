// client/src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para saber en qué página estamos

    // Estado para controlar si el submenú de Ventas está abierto
    const [isSalesOpen, setIsSalesOpen] = useState(false);
    // Estado para el menú de Compras
    const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
    // Estado para el menú de Contabilidad
    const [isAccountingOpen, setIsAccountingOpen] = useState(false);
    // Estado para el menú de Reportes
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    // UseEffect para abrir el submenú automáticamente si estamos en una página de ventas
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/invoices') || path.startsWith('/clients') || path.startsWith('/products')) {
            setIsSalesOpen(true);
        }
        // Lógica para abrir el menú de Compras automáticamente
        if (path.startsWith('/expenses') || path.startsWith('/vendors')) {
            setIsPurchasesOpen(true);
        }
        // Dentro del useEffect, añade '/bills' a la condición para abrir el menú de Compras
        if (path.startsWith('/expenses') || path.startsWith('/vendors') || path.startsWith('/bills')) {
            setIsPurchasesOpen(true);
        }
        // Lógica para abrir el menú automáticamente
        if (path.startsWith('/chart-of-accounts') || path.startsWith('/journal-entries')) {
            setIsAccountingOpen(true);
        }
        if (path.startsWith('/reports')) {
            setIsReportsOpen(true);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src="/axioma-logo-white.png" alt="Axioma Logo" style={{ maxWidth: '180px', height: 'auto', marginBottom: '20px' }} />
                </div>
                <nav>
                    <ul>
                        <li><NavLink to="/dashboard">Dashboard</NavLink></li>

                        {/* 3. Nuevo menú de Ventas expandible */}
                        <li>
                            <div className="menu-item-group" onClick={() => setIsSalesOpen(!isSalesOpen)}>
                                <span>Ventas</span>
                                <span className={`arrow ${isSalesOpen ? 'open' : ''}`}>▼</span>
                            </div>
                            {isSalesOpen && (
                                <ul className="submenu">
                                    <li><NavLink to="/invoices">Facturas</NavLink></li>
                                    <li><NavLink to="/clients">Clientes</NavLink></li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <div className="menu-item-group" onClick={() => setIsPurchasesOpen(!isPurchasesOpen)}>
                                <span>Compras</span>
                                <span className={`arrow ${isPurchasesOpen ? 'open' : ''}`}>▼</span>
                            </div>
                            {isPurchasesOpen && (
                                <ul className="submenu">
                                    <li><NavLink to="/bills">Facturas por Pagar</NavLink></li>
                                    <li><NavLink to="/expenses">Gastos</NavLink></li>
                                    <li><NavLink to="/vendors">Suplidores</NavLink></li>
                                </ul>
                            )}
                        </li>
                        <li><NavLink to="/bank-accounts">Bancos</NavLink></li>
                        {/* 3. Nuevo menú de Contabilidad */}
                        <li>
                            <div className="menu-item-group" onClick={() => setIsAccountingOpen(!isAccountingOpen)}>
                                <span>Contabilidad</span>
                                <span className={`arrow ${isAccountingOpen ? 'open' : ''}`}>▼</span>
                            </div>
                            {isAccountingOpen && (
                                <ul className="submenu">
                                    <li><NavLink to="/chart-of-accounts">Plan de Cuentas</NavLink></li>
                                    <li><NavLink to="/journal-entries">Asientos Contables</NavLink></li>
                                    <li><NavLink to="/reports/general-ledger">Libro Mayor</NavLink></li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <div className="menu-item-group" onClick={() => setIsReportsOpen(!isReportsOpen)}>
                                <span>Reportes</span>
                                <span className={`arrow ${isReportsOpen ? 'open' : ''}`}>▼</span>
                            </div>
                            {isReportsOpen && (
                                <ul className="submenu">
                                    <li><NavLink to="/reports/profit-loss">Ganancias y Pérdidas</NavLink></li>
                                    <li><NavLink to="/reports/balance-sheet">Balance General</NavLink></li>
                                    <li><NavLink to="/reports/cash-flow">Flujo de Caja</NavLink></li>
                                    <li><NavLink to="/reports/trial-balance">Balance de Comprobación</NavLink></li>
                                </ul>
                            )}
                        </li>
                        <li><NavLink to="/settings">Configuración</NavLink></li>
                    </ul>
                </nav>
                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;