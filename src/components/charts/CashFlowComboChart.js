import React from 'react';
// Importamos 'Chart' que nos permite crear gráficos combinados
import { Chart } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Registramos todos los elementos que necesitamos para un gráfico combinado
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const CashFlowComboChart = ({ chartData }) => {
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                type: 'bar', // Tipo de gráfico: Columna
                label: 'Entradas (Inflow)',
                data: chartData.incomeData,
                backgroundColor: 'rgba(40, 167, 69, 0.7)', // Verde
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
                yAxisID: 'y', // Asociar al eje Y principal
            },
            {
                type: 'bar', // Tipo de gráfico: Columna
                label: 'Salidas (Outflow)',
                data: chartData.outflowData,
                backgroundColor: 'rgba(220, 53, 69, 0.7)', // Rojo
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1,
                yAxisID: 'y', // Asociar al eje Y principal
            },
            {
                type: 'line', // Tipo de gráfico: Línea
                label: 'Cambio Neto (Net Change)',
                data: chartData.netChangeData,
                borderColor: 'rgba(0, 123, 255, 1)', // Azul
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
                tension: 0.1,
                yAxisID: 'y', // Asociar al eje Y principal
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Permite que el gráfico llene el contenedor
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Flujo de Caja Mensual',
                font: {
                    size: 18
                }
            },
        },
        scales: {
            x: {
                stacked: false, // Columnas agrupadas (clustered), no apiladas
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                stacked: false,
                beginAtZero: true,
            },
        },
    };

    // Usamos el componente <Chart> que permite tipos mixtos
    return <Chart type='bar' data={data} options={options} />;
};

export default CashFlowComboChart;