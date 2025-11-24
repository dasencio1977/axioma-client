import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ComparativeChart = ({ chartData }) => {
    const data = {
        labels: chartData.labels, // ['Ingresos', 'Gastos', 'Ingreso Neto']
        datasets: [
            {
                label: 'Año Actual',
                data: [chartData.currentYear.income, chartData.currentYear.expenses, chartData.currentYear.netIncome],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Año Anterior',
                data: [chartData.lastYear.income, chartData.lastYear.expenses, chartData.lastYear.netIncome],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Comparativa Año Fiscal (Actual vs Anterior)',
                font: {
                    size: 18
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default ComparativeChart;
