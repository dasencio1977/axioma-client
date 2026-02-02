import React, { useState, useEffect } from 'react';
import EmployeeForm from './EmployeeForm';
import PayrollModal from './PayrollModal'; // Ensure this matches the file name case
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

// Custom Icon (Inline for now)
const EmployeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-600">
        <circle cx="12" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 2v2" />
        <path d="M12 11v3" />
    </svg>
);

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Payroll Modal State
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [payrollEmployee, setPayrollEmployee] = useState(null);

    const navigate = useNavigate();

    const fetchEmployees = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/employees`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('Error al obtener los empleados.');
            const data = await response.json();
            // Ensure data is array
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSave = async (employeeData) => {
        const token = localStorage.getItem('token');
        const method = editingEmployee ? 'PUT' : 'POST';
        const url = editingEmployee ? `${apiUrl}/api/employees/${editingEmployee.employee_id}` : `${apiUrl}/api/employees`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error al guardar el empleado.');
            }

            toast.success(`Empleado ${editingEmployee ? 'actualizado' : 'creado'} con éxito.`);
            fetchEmployees();
            setShowForm(false);
            setEditingEmployee(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = (id) => {
        const performDelete = async () => {
            const token = localStorage.getItem('token');
            try {
                await fetch(`${apiUrl}/api/employees/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
                toast.success('Empleado eliminado con éxito');
                fetchEmployees();
            } catch (err) {
                toast.error('Error al eliminar el empleado.');
            }
        };

        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Estás seguro de que quieres eliminar este empleado?</p>
                <button onClick={() => { performDelete(); closeToast(); }} className="mr-2 py-1 px-3 bg-red-600 text-white rounded-md">Sí, eliminar</button>
                <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingEmployee(null);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingEmployee(null);
    };

    const handlePay = (employee) => {
        setPayrollEmployee(employee);
        setShowPayrollModal(true);
    };

    // Filter logic safe check
    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.first_name || ''} ${emp.last_name_paternal || ''}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return <p className="p-8">Cargando empleados...</p>;

    return (
        <div>
            {/*Header*/}
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <EmployeeIcon />
                Empleados
            </h2>

            {/*Toolbar*/}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar empleado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!showForm &&
                    <button
                        onClick={handleAddNew}
                        className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors w-full md:w-auto"
                    >
                        Añadir Empleado
                    </button>
                }
            </div>

            {/*Form*/}
            {showForm && <EmployeeForm onSave={handleSave} onCancel={handleCancel} currentEmployee={editingEmployee} />}

            {/* Payroll Modal */}
            {showPayrollModal && payrollEmployee && (
                <PayrollModal
                    employee={payrollEmployee}
                    onClose={() => { setShowPayrollModal(false); setPayrollEmployee(null); }}
                    onPaymentSuccess={() => {
                        setShowPayrollModal(false);
                        setPayrollEmployee(null);
                    }}
                />
            )}

            {/*List*/}
            {!showForm && (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    {filteredEmployees.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No se encontraron empleados. Añade uno nuevo para comenzar.
                        </div>
                    ) : (
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase">Nombre</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase">Teléfono</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase">Posición</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase">Tipo</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase">Contratación</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase">Terminación</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700 font-medium">
                                            {emp.first_name} {emp.last_name_paternal}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{emp.cell_phone || emp.residential_phone || '-'}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{emp.position || '-'}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold 
                                                ${emp.employment_type === 'Salaried' ? 'bg-blue-100 text-blue-800' :
                                                    emp.employment_type === 'Exempt' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-orange-100 text-orange-800'}`}>
                                                {emp.employment_type === 'Salaried' ? 'Asalariado' :
                                                    emp.employment_type === 'Exempt' ? 'Exento' : 'Pro. Services'}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{emp.hiring_date ? new Date(emp.hiring_date).toLocaleDateString() : '-'}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{emp.termination_date ? new Date(emp.termination_date).toLocaleDateString() : '-'}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors shadow-sm"
                                                    onClick={() => handleEdit(emp)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                                                    onClick={() => handleDelete(emp.employee_id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default Employees;
