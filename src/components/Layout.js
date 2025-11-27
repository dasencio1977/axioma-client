import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logoWhite from '../assets/axioma-logo-white.png';
import {
    HomeIcon,
    ShoppingCartIcon,
    BanknoteIcon,
    PackageIcon,
    LibraryIcon,
    BarChart3Icon,
    SettingsIcon,
    ChevronDownIcon,
    MenuIcon,
    LandmarkIcon
} from './Icons';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSalesOpen, setIsSalesOpen] = useState(false);
    const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
    const [isAccountingOpen, setIsAccountingOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [isBankOpen, setIsBankOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const path = location.pathname;
        setIsSalesOpen(path.startsWith('/invoices') || path.startsWith('/clients') || path.startsWith('/products') || path.startsWith('/estimates') || path.startsWith('/recurring-invoices'));
        setIsPurchasesOpen(path.startsWith('/bills') || path.startsWith('/expenses') || path.startsWith('/vendors'));
        setIsAccountingOpen(path.startsWith('/chart-of-accounts') || path.startsWith('/journal-entries'));
        setIsReportsOpen(path.startsWith('/reports'));
        setIsBankOpen(path.startsWith('/bank-accounts') || path.startsWith('/deposits'));
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getNavLinkClass = ({ isActive }) => {
        return `flex items-center gap-3 p-2.5 rounded-md transition-colors duration-200 ${isActive
            ? 'bg-gray-900 text-white'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`;
    };

    const menuGroupClass = `flex items-center justify-between gap-3 p-2.5 rounded-md cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white ${isCollapsed ? 'justify-center' : ''}`;

    return (
        <div className="flex min-h-screen">
            {/* --- BARRA LATERAL --- */}
            <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-800 text-gray-200 p-5 flex flex-col flex-shrink-0 transition-all duration-300`}>
                <div className="py-4 flex items-center justify-between mb-4">
                    {!isCollapsed && <img src={logoWhite} alt="Axioma Logo" className="mx-auto" style={{ maxWidth: '140px' }} />}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-400 hover:text-white focus:outline-none mx-auto">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-grow overflow-y-auto overflow-x-hidden">
                    <ul className="space-y-2">
                        <li>
                            <NavLink to="/dashboard" className={getNavLinkClass} end>
                                <HomeIcon />
                                {!isCollapsed && <span>Dashboard</span>}
                            </NavLink>
                        </li>

                        {/* --- Menú Ventas --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsSalesOpen(!isSalesOpen)}>
                                <div className="flex items-center gap-3"><ShoppingCartIcon /> {!isCollapsed && <span>Ventas</span>}</div>
                                {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSalesOpen ? 'rotate-180' : ''}`} />}
                            </div>
                            {isSalesOpen && (
                                <ul className={`list-none ${isCollapsed ? 'pl-0' : 'pl-6'} mt-2 space-y-1`}>
                                    <li><NavLink to="/estimates" className={getNavLinkClass} title="Estimados">{isCollapsed ? 'ES' : 'Estimados'}</NavLink></li>
                                    <li><NavLink to="/recurring-invoices" className={getNavLinkClass} title="Facturas Recurrentes">{isCollapsed ? 'FR' : 'Facturas Recurrentes'}</NavLink></li>
                                    <li><NavLink to="/invoices" className={getNavLinkClass} title="Facturas por Cobrar">{isCollapsed ? 'FC' : 'Facturas por Cobrar'}</NavLink></li>
                                    <li><NavLink to="/clients" className={getNavLinkClass} end title="Clientes">{isCollapsed ? 'CL' : 'Clientes'}</NavLink></li>
                                    <li><NavLink to="/clients/statement" className={getNavLinkClass} title="Estados de Cuenta">{isCollapsed ? 'EC' : 'Estados de Cuenta'}</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Compras --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsPurchasesOpen(!isPurchasesOpen)}>
                                <div className="flex items-center gap-3"><BanknoteIcon /> {!isCollapsed && <span>Compras</span>}</div>
                                {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isPurchasesOpen ? 'rotate-180' : ''}`} />}
                            </div>
                            {isPurchasesOpen && (
                                <ul className={`list-none ${isCollapsed ? 'pl-0' : 'pl-6'} mt-2 space-y-1`}>
                                    <li><NavLink to="/bills" className={getNavLinkClass} title="Facturas por Pagar">{isCollapsed ? 'FP' : 'Facturas por Pagar'}</NavLink></li>
                                    <li><NavLink to="/expenses" className={getNavLinkClass} title="Gastos">{isCollapsed ? 'GA' : 'Gastos'}</NavLink></li>
                                    <li><NavLink to="/vendors" className={getNavLinkClass} title="Suplidores">{isCollapsed ? 'SU' : 'Suplidores'}</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Productos --- */}
                        <li>
                            <NavLink to="/products" className={getNavLinkClass}>
                                <PackageIcon />
                                {!isCollapsed && <span>Productos y Servicios</span>}
                            </NavLink>
                        </li>

                        {/* --- Menú Bancos --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsBankOpen(!isBankOpen)}>
                                <div className="flex items-center gap-3"><LandmarkIcon /> {!isCollapsed && <span>Bancos</span>}</div>
                                {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isBankOpen ? 'rotate-180' : ''}`} />}
                            </div>
                            {isBankOpen && (
                                <ul className={`list-none ${isCollapsed ? 'pl-0' : 'pl-6'} mt-2 space-y-1`}>
                                    <li><NavLink to="/bank-accounts" className={getNavLinkClass} title="Cuentas Bancarias">{isCollapsed ? 'CB' : 'Cuentas Bancarias'}</NavLink></li>
                                    <li><NavLink to="/deposits" className={getNavLinkClass} title="Depósitos">{isCollapsed ? 'DP' : 'Depósitos'}</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Contabilidad --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsAccountingOpen(!isAccountingOpen)}>
                                <div className="flex items-center gap-3"><LibraryIcon /> {!isCollapsed && <span>Contabilidad</span>}</div>
                                {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isAccountingOpen ? 'rotate-180' : ''}`} />}
                            </div>
                            {isAccountingOpen && (
                                <ul className={`list-none ${isCollapsed ? 'pl-0' : 'pl-6'} mt-2 space-y-1`}>
                                    <li><NavLink to="/chart-of-accounts" className={getNavLinkClass} title="Plan de Cuentas">{isCollapsed ? 'PC' : 'Plan de Cuentas'}</NavLink></li>
                                    <li><NavLink to="/journal-entries" className={getNavLinkClass} title="Asientos Contables">{isCollapsed ? 'AC' : 'Asientos Contables'}</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Reportes --- */}
                        <li>
                            <div className={menuGroupClass} onClick={() => setIsReportsOpen(!isReportsOpen)}>
                                <div className="flex items-center gap-3"><BarChart3Icon /> {!isCollapsed && <span>Reportes</span>}</div>
                                {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isReportsOpen ? 'rotate-180' : ''}`} />}
                            </div>
                            {isReportsOpen && (
                                <ul className={`list-none ${isCollapsed ? 'pl-0' : 'pl-6'} mt-2 space-y-1`}>
                                    <li><NavLink to="/reports/profit-loss" className={getNavLinkClass} title="Ganancias y Pérdidas">{isCollapsed ? 'GP' : 'Ganancias y Pérdidas'}</NavLink></li>
                                    <li><NavLink to="/reports/trial-balance" className={getNavLinkClass} title="Balance de Comprobación">{isCollapsed ? 'BC' : 'Balance de Comprobación'}</NavLink></li>
                                    <li><NavLink to="/reports/balance-sheet" className={getNavLinkClass} title="Balance General">{isCollapsed ? 'BG' : 'Balance General'}</NavLink></li>
                                    <li><NavLink to="/reports/cash-flow" className={getNavLinkClass} title="Flujo de Caja">{isCollapsed ? 'FC' : 'Flujo de Caja'}</NavLink></li>
                                    <li><NavLink to="/reports/general-ledger" className={getNavLinkClass} title="Libro Mayor">{isCollapsed ? 'LM' : 'Libro Mayor'}</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* --- Menú Configuración --- */}
                        <li>
                            <NavLink to="/settings" className={getNavLinkClass}>
                                <SettingsIcon />
                                {!isCollapsed && <span>Configuración</span>}
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Botón de Logout */}
                <div>
                    <button
                        onClick={handleLogout}
                        className={`w-full bg-red-600 text-white p-2.5 rounded-md hover:bg-red-700 transition-colors duration-200 ${isCollapsed ? 'flex justify-center' : ''}`}
                        title="Cerrar Sesión"
                    >
                        {isCollapsed ? <span>&times;</span> : 'Cerrar Sesión'}
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