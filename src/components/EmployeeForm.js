import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EmployeeForm = ({ onSave, onCancel, currentEmployee }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState({
        // Personal
        first_name: '', initial: '', last_name_paternal: '', last_name_maternal: '',
        is_us_citizen: true, ssn: '', international_id: '', birth_date: '',
        residential_phone: '', cell_phone: '', alternate_phone: '',

        // Addresses
        physical_address_1: '', physical_address_2: '', physical_address_3: '',
        physical_city: '', physical_state: '', physical_zip_code: '', physical_country: 'Puerto Rico',
        is_address_same: false,
        postal_address_1: '', postal_address_2: '', postal_address_3: '',
        postal_city: '', postal_state: '', postal_zip_code: '', postal_country: 'Puerto Rico',

        // Status
        marital_status: 'Soltero', dependents_count: 0,

        // Employment
        position: '', reports_to: '', employment_type: 'Salaried',
        payment_frequency: 'Weekly', pay_rate: '', annual_salary: '',
        hiring_date: '', termination_date: '',

        // Tax / Financial
        tax_exemption_type: 'None',
        payment_method: 'Check', bank_account_number: '', bank_routing_number: '',
        loan_repayment_401k_amount: '',

        // Tax Percentages
        state_tax_percent: '', federal_tax_percent: '',
        social_security_percent: '6.20', medicare_percent: '1.45',
        employer_401k_percent: '', employee_401k_percent: '',
        employer_state_unemployment_percent: '', employer_federal_unemployment_percent: '',
        employer_state_disability_percent: '', employee_state_disability_percent: '',

        // Balances
        vacation_hours_balance: '', sick_hours_balance: '',

        // Emergency Contacts (Array of 3 empty objects)
        emergency_contacts: [
            { name: '', phone: '', address: '', relationship: '' },
            { name: '', phone: '', address: '', relationship: '' },
            { name: '', phone: '', address: '', relationship: '' }
        ]
    });

    useEffect(() => {
        if (currentEmployee) {
            // Merge current employee data
            const contacts = currentEmployee.emergency_contacts || [];
            // Ensure 3 slots
            while (contacts.length < 3) {
                contacts.push({ name: '', phone: '', address: '', relationship: '' });
            }

            setFormData({
                ...currentEmployee,
                is_address_same: currentEmployee.is_address_same || false,
                is_us_citizen: currentEmployee.is_us_citizen !== false, // default true
                emergency_contacts: contacts
            });
        }
    }, [currentEmployee]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };

            // Address sync
            if (name === 'is_address_same' && checked) {
                return {
                    ...newData,
                    postal_address_1: prev.physical_address_1,
                    postal_address_2: prev.physical_address_2,
                    postal_address_3: prev.physical_address_3,
                    postal_city: prev.physical_city,
                    postal_state: prev.physical_state,
                    postal_zip_code: prev.physical_zip_code,
                    postal_country: prev.physical_country,
                };
            }
            return newData;
        });
    };

    // Salary Calculations
    // Salaried (Hourly): Pay Rate (Hour) -> Annual = Rate * 40 * 52
    // Exempt/Pro: Annual -> Pay Rate (Period) = Annual / Weeks
    // We trigger this when leaving the field (onBlur) or changing type

    const calculateSalary = (type, rate, annual) => {
        let newRate = rate;
        let newAnnual = annual;

        if (type === 'Salaried') {
            // Basis: Hourly Rate
            if (rate) {
                newAnnual = (parseFloat(rate) * 40 * 52).toFixed(2);
            }
        } else {
            // Basis: Annual Salary (Fixed)
            // Default divisor 52 for calculation display
            if (annual) {
                newRate = (parseFloat(annual) / 52).toFixed(2);
            }
        }
        return { newRate, newAnnual };
    };

    const handleSalaryBlur = (e) => {
        const { name, value } = e.target;
        if (name === 'pay_rate' && formData.employment_type === 'Salaried') {
            const { newAnnual } = calculateSalary('Salaried', value, formData.annual_salary);
            setFormData(prev => ({ ...prev, annual_salary: newAnnual }));
        } else if (name === 'annual_salary' && formData.employment_type !== 'Salaried') {
            const { newRate } = calculateSalary(formData.employment_type, formData.pay_rate, value);
            setFormData(prev => ({ ...prev, pay_rate: newRate }));
        }
    };

    // Emergency Contact Change
    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...formData.emergency_contacts];
        updatedContacts[index] = { ...updatedContacts[index], [field]: value };
        setFormData(prev => ({ ...prev, emergency_contacts: updatedContacts }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const tabs = [
        { id: 'personal', label: 'Personal' },
        { id: 'address', label: 'Direcciones' },
        { id: 'employment', label: 'Empleo' },
        { id: 'tax', label: 'Contributiva' },
        { id: 'financial', label: 'Financiera' },
        { id: 'emergency', label: 'Emergencia' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">
                    {currentEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h3>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>

            <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-4 text-sm font-medium focus:outline-none transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 h-[70vh] overflow-y-auto">

                {/* Personal */}
                {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium mb-1">Nombre *</label><input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Inicial</label><input type="text" name="initial" value={formData.initial} onChange={handleChange} className="w-full border p-2 rounded" maxLength="5" /></div>
                        <div><label className="block text-sm font-medium mb-1">Apellido Paterno *</label><input required type="text" name="last_name_paternal" value={formData.last_name_paternal} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Apellido Materno</label><input type="text" name="last_name_maternal" value={formData.last_name_maternal} onChange={handleChange} className="w-full border p-2 rounded" /></div>

                        <div className="col-span-2 border-t pt-4 mt-2"><h4 className="font-semibold mb-2">Identificación</h4></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ciudadanía</label>
                            <select name="is_us_citizen" value={formData.is_us_citizen} onChange={(e) => handleChange({ target: { name: 'is_us_citizen', value: e.target.value === 'true' } })} className="w-full border p-2 rounded">
                                <option value="true">Ciudadano Americano</option>
                                <option value="false">Extranjero</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{formData.is_us_citizen ? 'Seguro Social (SSN)' : 'Pasaporte / ID Internacional'}</label>
                            <input
                                type="text"
                                name={formData.is_us_citizen ? 'ssn' : 'international_id'}
                                value={formData.is_us_citizen ? formData.ssn : formData.international_id}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                                placeholder={formData.is_us_citizen ? 'xxx-xx-xxxx' : ''}
                            />
                        </div>

                        <div className="col-span-2 border-t pt-4 mt-2"><h4 className="font-semibold mb-2">Teléfonos</h4></div>
                        <div><label className="block text-sm font-medium mb-1">Celular</label><input type="text" name="cell_phone" value={formData.cell_phone} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Residencial</label><input type="text" name="residential_phone" value={formData.residential_phone} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Alterno</label><input type="text" name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label><input type="date" name="birth_date" value={formData.birth_date ? formData.birth_date.split('T')[0] : ''} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    </div>
                )}

                {/* Address */}
                {activeTab === 'address' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Dirección Física</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <input type="text" name="physical_address_1" placeholder="Línea 1" value={formData.physical_address_1} onChange={handleChange} className="w-full border p-2 rounded" />
                                <input type="text" name="physical_address_2" placeholder="Línea 2" value={formData.physical_address_2} onChange={handleChange} className="w-full border p-2 rounded" />
                                <input type="text" name="physical_address_3" placeholder="Línea 3" value={formData.physical_address_3} onChange={handleChange} className="w-full border p-2 rounded" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name="physical_city" placeholder="Ciudad" value={formData.physical_city} onChange={handleChange} className="w-full border p-2 rounded" />
                                    <input type="text" name="physical_state" placeholder="Estado" value={formData.physical_state} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name="physical_zip_code" placeholder="Zip Code" value={formData.physical_zip_code} onChange={handleChange} className="w-full border p-2 rounded" />
                                    <input type="text" name="physical_country" placeholder="País" value={formData.physical_country} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-800">Dirección Postal</h4>
                                <label className="flex items-center space-x-2 text-sm text-gray-600">
                                    <input type="checkbox" name="is_address_same" checked={formData.is_address_same} onChange={handleChange} className="rounded text-blue-600" />
                                    <span>Igual a la Física</span>
                                </label>
                            </div>
                            <div className={`grid grid-cols-1 gap-3 ${formData.is_address_same ? 'opacity-50 pointer-events-none' : ''}`}>
                                <input type="text" name="postal_address_1" placeholder="Línea 1" value={formData.postal_address_1} onChange={handleChange} className="w-full border p-2 rounded" />
                                <input type="text" name="postal_address_2" placeholder="Línea 2" value={formData.postal_address_2} onChange={handleChange} className="w-full border p-2 rounded" />
                                <input type="text" name="postal_address_3" placeholder="Línea 3" value={formData.postal_address_3} onChange={handleChange} className="w-full border p-2 rounded" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name="postal_city" placeholder="Ciudad" value={formData.postal_city} onChange={handleChange} className="w-full border p-2 rounded" />
                                    <input type="text" name="postal_state" placeholder="Estado" value={formData.postal_state} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name="postal_zip_code" placeholder="Zip Code" value={formData.postal_zip_code} onChange={handleChange} className="w-full border p-2 rounded" />
                                    <input type="text" name="postal_country" placeholder="País" value={formData.postal_country} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Employment */}
                {activeTab === 'employment' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium mb-1">Puesto</label><input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Se reporta a</label><input type="text" name="reports_to" value={formData.reports_to} onChange={handleChange} className="w-full border p-2 rounded" /></div>

                        <div><label className="block text-sm font-medium mb-1">Fecha de Contratación</label><input type="date" name="hiring_date" value={formData.hiring_date ? formData.hiring_date.split('T')[0] : ''} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Fecha de Terminación</label><input type="date" name="termination_date" value={formData.termination_date ? formData.termination_date.split('T')[0] : ''} onChange={handleChange} className="w-full border p-2 rounded" /></div>

                        <div className="col-span-2 border-t pt-4 mt-2"><h4 className="font-semibold mb-2">Compensación</h4></div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo de Empleo</label>
                            <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="Salaried">Asalariado (Por Hora)</option>
                                <option value="Exempt">Exento (Salario Fijo)</option>
                                <option value="Professional Services">Servicios Profesionales</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Frecuencia de Pago</label>
                            <select name="payment_frequency" value={formData.payment_frequency} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="Weekly">Semanal</option>
                                <option value="BiWorker">Bisemanal (Cada 2 Semanas)</option>
                                <option value="SemiMonthly">Quincenal (2 veces al mes)</option>
                                <option value="Monthly">Mensual</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {formData.employment_type === 'Salaried' ? 'Pago por Hora ($)' : 'Pago por Periodo ($)'}
                            </label>
                            <input
                                type="number" step="0.01" name="pay_rate"
                                value={formData.pay_rate} onChange={handleChange} onBlur={handleSalaryBlur}
                                className="w-full border p-2 rounded"
                            />
                            {formData.employment_type !== 'Salaried' && <span className="text-xs text-gray-500">Calculado aprox: Salario Anual / 52</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Salario Anual ($)</label>
                            <input
                                type="number" step="0.01" name="annual_salary"
                                value={formData.annual_salary} onChange={handleChange} onBlur={handleSalaryBlur}
                                className="w-full border p-2 rounded"
                            />
                            {formData.employment_type === 'Salaried' && <span className="text-xs text-gray-500">Calculado: Hora * 40 * 52</span>}
                        </div>
                    </div>
                )}

                {/* Tax */}
                {activeTab === 'tax' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Estado Civil</label>
                                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full border p-2 rounded">
                                    <option value="Soltero">Soltero/a</option>
                                    <option value="Casado">Casado/a</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Dependientes</label>
                                <input type="number" name="dependents_count" value={formData.dependents_count} onChange={handleChange} className="w-full border p-2 rounded" />
                            </div>

                            {formData.employment_type !== 'Professional Services' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Exención Contributiva</label>
                                    <select name="tax_exemption_type" value={formData.tax_exemption_type} onChange={handleChange} className="w-full border p-2 rounded">
                                        <option value="None">Ninguna</option>
                                        <option value="Half">Mitad</option>
                                        <option value="Complete">Completa</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Configuración de Porcientos (%)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div><label className="block mb-1">Income Tax Estatal</label><input type="number" step="0.01" name="state_tax_percent" value={formData.state_tax_percent} onChange={handleChange} className="w-full border p-2 rounded" placeholder="0.00" /></div>
                                <div><label className="block mb-1">Income Tax Federal</label><input type="number" step="0.01" name="federal_tax_percent" value={formData.federal_tax_percent} onChange={handleChange} className="w-full border p-2 rounded" placeholder="0.00" /></div>
                                <div><label className="block mb-1">Seguro Social</label><input type="number" step="0.01" name="social_security_percent" value={formData.social_security_percent} onChange={handleChange} className="w-full border p-2 rounded" placeholder="6.20" /></div>
                                <div><label className="block mb-1">Medicare</label><input type="number" step="0.01" name="medicare_percent" value={formData.medicare_percent} onChange={handleChange} className="w-full border p-2 rounded" placeholder="1.45" /></div>

                                <div><label className="block mb-1">401k Empleado</label><input type="number" step="0.01" name="employee_401k_percent" value={formData.employee_401k_percent} onChange={handleChange} className="w-full border p-2 rounded" placeholder="0.00" /></div>
                                <div><label className="block mb-1">Incapacidad Empleado</label><input type="number" step="0.01" name="employee_state_disability_percent" value={formData.employee_state_disability_percent} onChange={handleChange} className="w-full border p-2 rounded" placeholder="0.00" /></div>

                                <div className="col-span-2 md:col-span-3 mt-2 border-t pt-2"><h5 className="font-medium text-gray-600">Aportaciones Patronales</h5></div>
                                <div><label className="block mb-1">401k Patrono</label><input type="number" step="0.01" name="employer_401k_percent" value={formData.employer_401k_percent} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" placeholder="0.00" /></div>
                                <div><label className="block mb-1">Desempleo Estatal</label><input type="number" step="0.01" name="employer_state_unemployment_percent" value={formData.employer_state_unemployment_percent} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" placeholder="0.00" /></div>
                                <div><label className="block mb-1">Desempleo Federal</label><input type="number" step="0.01" name="employer_federal_unemployment_percent" value={formData.employer_federal_unemployment_percent} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" placeholder="0.00" /></div>
                                <div><label className="block mb-1">Incapacidad Patrono</label><input type="number" step="0.01" name="employer_state_disability_percent" value={formData.employer_state_disability_percent} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" placeholder="0.00" /></div>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Balances de Licencias (Horas)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Vacaciones Acumuladas</label><input type="number" step="0.01" name="vacation_hours_balance" value={formData.vacation_hours_balance} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                                <div><label className="block text-sm font-medium mb-1">Enfermedad Acumulada</label><input type="number" step="0.01" name="sick_hours_balance" value={formData.sick_hours_balance} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Deducciones Adicionales</h4>
                            <div><label className="block text-sm font-medium mb-1">Pago Mensual Préstamo 401k ($)</label><input type="number" step="0.01" name="loan_repayment_401k_amount" value={formData.loan_repayment_401k_amount} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        </div>
                    </div>
                )}

                {/* Financial */}
                {activeTab === 'financial' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Método de Pago</label>
                            <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="Check">Cheque</option>
                                <option value="Direct Deposit">Depósito Directo</option>
                            </select>
                        </div>
                        {formData.payment_method === 'Direct Deposit' && (
                            <>
                                <div><label className="block text-sm font-medium mb-1">Número de Cuenta</label><input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                                <div><label className="block text-sm font-medium mb-1">Número de Ruta</label><input type="text" name="bank_routing_number" value={formData.bank_routing_number} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                            </>
                        )}
                    </div>
                )}

                {/* Emergency Contacts */}
                {activeTab === 'emergency' && (
                    <div className="space-y-6">
                        {formData.emergency_contacts.map((contact, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-700 mb-2">Contacto {index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className="text-xs text-gray-500">Nombre</label><input type="text" value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} className="w-full border p-1 rounded" /></div>
                                    <div><label className="text-xs text-gray-500">Parentesco</label><input type="text" value={contact.relationship} onChange={(e) => handleContactChange(index, 'relationship', e.target.value)} className="w-full border p-1 rounded" /></div>
                                    <div><label className="text-xs text-gray-500">Teléfono</label><input type="text" value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} className="w-full border p-1 rounded" /></div>
                                    <div><label className="text-xs text-gray-500">Dirección</label><input type="text" value={contact.address} onChange={(e) => handleContactChange(index, 'address', e.target.value)} className="w-full border p-1 rounded" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white p-4">
                    <button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium">Cancelar</button>
                    <button type="submit" className="py-2 px-6 bg-blue-600 text-white rounded-lg font-semibold shadow-md">Guardar Empleado</button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
