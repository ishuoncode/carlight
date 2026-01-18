'use client';
import React, { useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const toast = React.useRef(null);
  const [outlets, setOutlets] = useState([]);
  const [viewMode, setViewMode] = useState('monthly'); // monthly or yearly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  
  // Data states
  const [totalBill, setTotalBill] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [carsServiced, setCarsServiced] = useState(0);
  const [carsServicedChartData, setCarsServicedChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch outlets
  const fetchOutlets = async () => {
    try {
      const cachedOutlets = localStorage.getItem('outlets');
      if (cachedOutlets) {
        const parsedOutlets = JSON.parse(cachedOutlets);
        setOutlets(parsedOutlets.map(outlet => ({ label: outlet.name, value: outlet.id })));
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/shop', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('outlets', JSON.stringify(data));
        setOutlets(data.map(outlet => ({ label: outlet.name, value: outlet.id })));
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  // Fetch total bill
  const fetchTotalBill = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:8080/api/bills/yearly?year=${selectedYear}`;
      if (selectedOutlet) url += `&outletId=${selectedOutlet}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const bills = await response.json();
        console.log('Bills received:', bills);
        console.log('Number of bills:', bills.length);
        // Calculate total from bills array
        const total = Array.isArray(bills) ? bills.reduce((sum, bill) => {
          console.log('Adding bill amount:', bill.totalAmount);
          return sum + (parseFloat(bill.totalAmount) || 0);
        }, 0) : 0;
        console.log('Total bill calculated:', total);
        setTotalBill(total);
      }
    } catch (error) {
      console.error('Error fetching total bill:', error);
    }
  };

  // Fetch total expense
  const fetchTotalExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:8080/api/expenses/pie/yearly?year=${selectedYear}`;
      if (selectedOutlet) url += `&outletId=${selectedOutlet}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Expense data received:', data);
        // Sum all category totals
        const total = Array.isArray(data) ? data.reduce((sum, item) => {
          const categoryTotal = parseFloat(item.total || 0);
          console.log(`Category: ${item.category}, Total: ${categoryTotal}`);
          return sum + categoryTotal;
        }, 0) : 0;
        console.log('Total expense calculated:', total);
        setTotalExpense(total);
      }
    } catch (error) {
      console.error('Error fetching total expense:', error);
    }
  };

  // Fetch cars serviced
  const fetchCarsServiced = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:8080/api/bills/yearly?year=${selectedYear}`;
      if (selectedOutlet) url += `&outletId=${selectedOutlet}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const bills = await response.json();
        
        // Create month-wise data structure (count bills, not unique cars)
        const monthData = {
          1: 0, 2: 0, 3: 0, 4: 0,
          5: 0, 6: 0, 7: 0, 8: 0,
          9: 0, 10: 0, 11: 0, 12: 0
        };
        
        // Count bills by month
        bills.forEach(bill => {
          const date = new Date(bill.createdAt);
          const month = date.getMonth() + 1; // 1-12
          monthData[month]++;
        });
        
        // Convert to chart data
        const chartData = [
          { month: 'Jan', totalcar: monthData[1] },
          { month: 'Feb', totalcar: monthData[2] },
          { month: 'Mar', totalcar: monthData[3] },
          { month: 'Apr', totalcar: monthData[4] },
          { month: 'May', totalcar: monthData[5] },
          { month: 'Jun', totalcar: monthData[6] },
          { month: 'Jul', totalcar: monthData[7] },
          { month: 'Aug', totalcar: monthData[8] },
          { month: 'Sep', totalcar: monthData[9] },
          { month: 'Oct', totalcar: monthData[10] },
          { month: 'Nov', totalcar: monthData[11] },
          { month: 'Dec', totalcar: monthData[12] }
        ];
        
        // Set total services count (total bills)
        setCarsServiced(bills.length);
        setCarsServicedChartData(chartData);
      }
    } catch (error) {
      console.error('Error fetching cars serviced:', error);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTotalBill(),
      fetchTotalExpense(),
      fetchCarsServiced()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, selectedOutlet]);

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  const formatCurrency = (value) => `₹${value ? Number(value).toFixed(2) : '0.00'}`;

  const totalProfit = totalBill - totalExpense;

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 9 + i;
    return { label: year.toString(), value: year };
  });

  return (
    <div className="p-6">
      <Toast ref={toast} />

      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <i className="pi pi-chart-line text-blue-600"></i>
                Analytics Dashboard
              </h2>
              <p className="text-gray-600 mt-2">Business performance insights and metrics</p>
            </div>
            <Button
              icon="pi pi-refresh"
              onClick={fetchAllData}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3"
              tooltip="Refresh data"
              tooltipOptions={{ position: 'bottom' }}
              outlined
              loading={loading}
            />
          </div>

          {/* Total Profit Display */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  {selectedYear} - Total Profit
                </p>
                <h3 className="text-4xl font-bold">{formatCurrency(totalProfit)}</h3>
                <p className="text-blue-100 text-sm mt-2">
                  Revenue: {formatCurrency(totalBill)} - Expenses: {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <i className="pi pi-dollar text-5xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <Dropdown
              value={selectedYear}
              options={years}
              onChange={(e) => setSelectedYear(e.value)}
              className="w-full border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
            <Dropdown
              value={selectedOutlet}
              options={outlets}
              onChange={(e) => setSelectedOutlet(e.value)}
              className="w-full border border-gray-300"
              showClear
              placeholder="All Outlets"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-green-800">{formatCurrency(totalBill)}</h3>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <i className="pi pi-money-bill text-2xl text-white"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium mb-1">Total Expenses</p>
                <h3 className="text-3xl font-bold text-red-800">{formatCurrency(totalExpense)}</h3>
              </div>
              <div className="bg-red-500 p-3 rounded-full">
                <i className="pi pi-wallet text-2xl text-white"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium mb-1">Cars Serviced</p>
                <h3 className="text-3xl font-bold text-purple-800">{carsServiced}</h3>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <i className="pi pi-car text-2xl text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Cars Serviced Bar Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <i className="pi pi-chart-bar text-purple-600"></i>
            Cars Serviced This Year
          </h3>
          {carsServicedChartData.length > 0 ? (
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carsServicedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalcar" fill="#8b5cf6" name="Cars Serviced" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '400px' }} className="flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
