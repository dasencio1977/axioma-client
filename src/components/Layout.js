import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logoWhite from '../assets/axioma-logo-white.png';
// 1. Importamos los íconos que usaremos
import {
    HomeIcon,
    ShoppingCartIcon,
    BanknoteIcon,
    PackageIcon,
    LibraryIcon,
    BarChart3Icon,
    SettingsIcon,
    ChevronDownIcon
} from './Icons'; // Importamos desde nuestra nueva biblioteca

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSalesOpen, setIsSalesOpen] = useState(false);
    const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
    const [isAccountingOpen, setIsAccountingOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    useEffect(() => {
        const path = location.pathname;
        setIsSalesOpen(path.startsWith('/invoices') || path.startsWith('/clients') || path.startsWith('/products'));
        setIsPurchasesOpen(path.startsWith('/bills') || path.startsWith('/expenses') || path.startsWith('/vendors'));
        setIsAccountingOpen(path.startsWith('/chart-of-accounts') || path.startsWith('/journal-entries'));
        setIsReportsOpen(path.startsWith('/reports'));
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // 2. Actualizamos la función de clases para alinear los íconos
    const getNavLinkClass = ({ isActive }) => {
        return `flex items-center gap-3 p-2.5 rounded-md transition-colors duration-200 ${isActive
            ? 'bg-gray-900 text-white'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`;
    };

    // 3. Estilo para los grupos de menú
    const menuGroupClass = "flex items-center justify-between gap-3 p-2.5 rounded-md cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white";

    return (
        <div className="flex min-h-screen">
            {/* --- BARRA LATERAL --- */}
            <aside className="w-64 bg-gray-800 text-gray-200 p-5 flex flex-col flex-shrink-0">
                <div className="py-4 text-center">
                    <img src={logoWhite} alt="Axioma Logo" className="mx-auto" style={{ maxWidth: '180px' }} />
                </div>

                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {/* 4. Reemplazamos los enlaces con íconos */}
                        <li>
                            <NavLink to="/dashboard" className={getNavLinkClass}>
                                <HomeIcon />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        {/* --- Menú Ventas --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsSalesOpen(!isSalesOpen)}>
                                <div className="flex items-center gap-3"><ShoppingCartIcon /> <span>Ventas</span></div>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSalesOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {isSalesOpen && (
                                <ul className="list-none pl-6 mt-2 space-y-1">
                                    <li><NavLink to="/invoices" className={getNavLinkClass}>Facturas por Cobrar</NavLink></li>
                                    <li><NavLink to="/clients" className={getNavLinkClass}>Clientes</NavLink></li>
                                    <li><NavLink to="/clients/statement" className={getNavLinkClass}>Estados de Cuenta</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Compras --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsPurchasesOpen(!isPurchasesOpen)}>
                                <div className="flex items-center gap-3"><BanknoteIcon /> <span>Compras</span></div>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isPurchasesOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {isPurchasesOpen && (
                                <ul className="list-none pl-6 mt-2 space-y-1">
                                    <li><NavLink to="/bills" className={getNavLinkClass}>Facturas por Pagar</NavLink></li>
                                    <li><NavLink to="/expenses" className={getNavLinkClass}>Gastos</NavLink></li>
                                    <li><NavLink to="/vendors" className={getNavLinkClass}>Suplidores</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Productos --- */}
                        <li>
                            <NavLink to="/products" className={getNavLinkClass}>
                                <PackageIcon />
                                <span>Productos y Servicios</span>
                            </NavLink>
                        </li>

                        {/* --- Menú Contabilidad --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsAccountingOpen(!isAccountingOpen)}>
                                <div className="flex items-center gap-3"><LibraryIcon /> <span>Contabilidad</span></div>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isAccountingOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {isAccountingOpen && (
                                <ul className="list-none pl-6 mt-2 space-y-1">
                                    <li><NavLink to="/chart-of-accounts" className={getNavLinkClass}>Plan de Cuentas</NavLink></li>
                                    <li><NavLink to="/journal-entries" className={getNavLinkClass}>Asientos Contables</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Reportes --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsReportsOpen(!isReportsOpen)}>
                                <div className="flex items-center gap-3"><BarChart3Icon /> <span>Reportes</span></div>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isReportsOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {isReportsOpen && (
                                <ul className="list-none pl-6 mt-2 space-y-1">
                                    <li><NavLink to="/reports/profit-loss" className={getNavLinkClass}>Ganancias y Pérdidas</NavLink></li>
                                    <li><NavLink to="/reports/trial-balance" className={getNavLinkClass}>Balance de Comprobación</NavLink></li>
                                    <li><NavLink to="/reports/balance-sheet" className={getNavLinkClass}>Balance General</NavLink></li>
                                    <li><NavLink to="/reports/cash-flow" className={getNavLinkClass}>Flujo de Caja</NavLink></li>
                                    <li><NavLink to="/reports/general-ledger" className={getNavLinkClass}>Libro Mayor</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Configuración --- */}
                        <li>
                            <NavLink to="/settings" className={getNavLinkClass}>
                                <SettingsIcon />
                                <span>Configuración</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Botón de Logout */}
                <div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 text-white p-2.5 rounded-md hover:bg-red-700 transition-colors duration-200"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 p-8 bg-gray-100 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;