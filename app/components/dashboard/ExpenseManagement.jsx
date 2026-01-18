'use client';
import React, { useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ExpenseManagement = () => {
  const toast = React.useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('monthly'); // monthly or yearly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedOutlet, setSelectedOutlet] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    outletId: '',
    title: '',
    amount: '',
    category: '',
    notes: ''
  });

  const COLORS = [
    '#0088FE', // Blue
    '#00C49F', // Teal
    '#FFBB28', // Yellow
    '#FF8042', // Orange
    '#8884D8', // Purple
    '#82ca9d', // Green
    '#ffc658', // Gold
    '#ff7c7c', // Red
    '#a4de6c', // Light Green
    '#d0ed57', // Lime
    '#8dd1e1', // Sky Blue
    '#83a6ed', // Lavender
    '#8e44ad', // Deep Purple
    '#e74c3c', // Crimson
    '#3498db', // Dodger Blue
    '#1abc9c', // Turquoise
    '#f39c12', // Carrot
    '#e67e22', // Pumpkin
    '#95a5a6', // Gray
    '#34495e'  // Dark Slate
  ];

  // Fetch enums from API or localStorage
  const fetchEnums = async () => {
    try {
      const cachedEnums = localStorage.getItem('enumsData');
      if (cachedEnums) {
        const enums = JSON.parse(cachedEnums);
        if (enums.expenseCategories) {
          setCategories(enums.expenseCategories.map(cat => ({ label: cat, value: cat })));
          return;
        }
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/meta/enums', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const enums = await response.json();
        localStorage.setItem('enumsData', JSON.stringify(enums));
        if (enums.expenseCategories) {
          setCategories(enums.expenseCategories.map(cat => ({ label: cat, value: cat })));
        }
      }
    } catch (error) {
      console.error('Error fetching enums:', error);
    }
  };

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
          Authorization: `Bearer ${token}`,
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

  // Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/expenses', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch expenses',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch expenses',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch pie chart data (FIXED)
  const fetchPieData = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '';

      if (viewMode === 'monthly') {
        url = `http://localhost:8080/api/expenses/pie/monthly?year=${selectedYear}&month=${selectedMonth}`;
        if (selectedOutlet) url += `&outletId=${selectedOutlet}`;
      } else {
        url = `http://localhost:8080/api/expenses/pie/yearly?year=${selectedYear}`;
        if (selectedOutlet) url += `&outletId=${selectedOutlet}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch pie data:', response.status);
        setPieData([]);
        return;
      }

      const data = await response.json();

      console.log('✅ Pie raw API data:', data);

      if (Array.isArray(data)) {
        const transformedData = data
          .map(item => ({
            name: item.category || 'Unknown',
            value: Number(item.total || 0) // ✅ correct field total
          }))
          .filter(d => d.value > 0);

        console.log('✅ Pie transformed data:', transformedData);

        setPieData(transformedData);
      } else {
        setPieData([]);
      }
    } catch (error) {
      console.error('Error fetching pie data:', error);
      setPieData([]);
    }
  };

  // Add expense
  const handleAddExpense = async () => {
    if (!formData.outletId || !formData.title || !formData.amount || !formData.category) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields',
        life: 3000
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Expense added successfully',
          life: 3000
        });

        setAddDialogVisible(false);
        setFormData({
          outletId: '',
          title: '',
          amount: '',
          category: '',
          notes: ''
        });

        fetchExpenses();
        fetchPieData();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add expense',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add expense',
        life: 3000
      });
    }
  };

  useEffect(() => {
    fetchEnums();
    fetchOutlets();
    fetchExpenses();
  }, []);

  useEffect(() => {
    fetchPieData();
  }, [viewMode, selectedYear, selectedMonth, selectedOutlet]);

  const formatCurrency = (value) => `₹${value ? Number(value).toFixed(2) : '0.00'}`;

  const formatDate = (value) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const allMonths = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Filter months based on selected year
  const months = selectedYear === currentYear 
    ? allMonths.filter(month => month.value <= currentMonth)
    : allMonths;

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 9 + i;
    return { label: year.toString(), value: year };
  });

  return (
    <div className="p-6">
      <Toast ref={toast} />

      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <i className="pi pi-money-bill text-blue-600"></i>
              Expense Management
            </h2>
            <p className="text-gray-600 mt-2">Track and manage your business expenses</p>
          </div>
          <div className="flex gap-3">
            <Button
              icon="pi pi-refresh"
              onClick={() => {
                fetchExpenses();
                fetchPieData();
              }}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3"
              tooltip="Refresh data"
              tooltipOptions={{ position: 'bottom' }}
              outlined
            />
            <Button
              label="Add Expense"
              icon="pi pi-plus"
              onClick={() => setAddDialogVisible(true)}
              className="bg-blue-600 hover:bg-blue-700 border-0 text-white px-6 py-3"
            />
          </div>
        </div>

        {/* Filters and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
                <Dropdown
                  value={viewMode}
                  options={[
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' }
                  ]}
                  onChange={(e) => setViewMode(e.value)}
                  className="w-full border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Dropdown
                  value={selectedYear}
                  options={years}
                  onChange={(e) => setSelectedYear(e.value)}
                  className="w-full border border-gray-300"
                />
              </div>
            </div>

            {viewMode === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <Dropdown
                  value={selectedMonth}
                  options={months}
                  onChange={(e) => setSelectedMonth(e.value)}
                  className="w-full border border-gray-300"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
              <Dropdown
                value={selectedOutlet}
                options={[{ label: 'All Outlets', value: '' }, ...outlets]}
                onChange={(e) => setSelectedOutlet(e.value)}
                className="w-full border border-gray-300"
              />
            </div>

            {/* Category List */}
            {pieData.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h4>
                <div className="space-y-2">
                  {pieData.map((item, index) => {
                    const total = pieData.reduce((sum, d) => sum + d.value, 0);
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div 
                        key={index} 
                        className="bg-white rounded-lg p-3 shadow-sm border-l-4"
                        style={{ borderLeftColor: COLORS[index % COLORS.length] }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-gray-800">{item.name}</span>
                          <span className="text-sm font-bold text-blue-600">{percentage}%</span>
                        </div>
                        <div className="text-lg font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Expense Distribution</h3>
            {pieData.length > 0 ? (
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                      minAngle={4}
                      isAnimationActive={true}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '400px' }} className="flex items-center justify-center text-gray-500">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Expense Table */}
        <div className="overflow-auto">
          <DataTable
            value={expenses}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            emptyMessage="No expenses found"
            stripedRows
            showGridlines
            sortField="createdAt"
            sortOrder={-1}
          >
            <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
            <Column field="title" header="Title" sortable style={{ width: '15rem' }} />
            <Column field="outlet.name" header="Outlet" sortable style={{ width: '12rem' }} />
            <Column field="category" header="Category" sortable style={{ width: '10rem' }} />
            <Column field="amount" header="Amount" sortable body={(rowData) => formatCurrency(rowData.amount)} style={{ width: '10rem' }} />
            <Column field="createdAt" header="Date" sortable body={(rowData) => formatDate(rowData.createdAt)} style={{ width: '10rem' }} />
            <Column field="notes" header="Notes" style={{ width: '15rem' }} />
          </DataTable>
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog
        visible={addDialogVisible}
        onHide={() => setAddDialogVisible(false)}
        modal
        header={
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="bg-blue-100 p-3 rounded-full">
              <i className="pi pi-money-bill text-2xl text-blue-600"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Add New Expense</h3>
              <p className="text-sm text-gray-500">Record a new business expense</p>
            </div>
          </div>
        }
        style={{ width: '600px' }}
        className="add-expense-dialog"
      >
        <div className="pt-4 space-y-5">
          {/* Outlet */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="pi pi-building text-blue-600"></i>
              Outlet <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.outletId}
              options={outlets}
              onChange={(e) => setFormData({ ...formData, outletId: e.value })}
              placeholder="Select an outlet"
              className="w-full border border-gray-300"
              showClear
              filter
              optionLabel="label"
              optionValue="value"
            />
          </div>

          {/* Title */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="pi pi-tag text-blue-600"></i>
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Shop Rent - January 2026"
              className="w-full border border-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <i className="pi pi-list text-blue-600"></i>
                Category <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.category}
                options={categories}
                onChange={(e) => setFormData({ ...formData, category: e.value })}
                placeholder="Select category"
                className="w-full border border-gray-300"
                filter
              />
            </div>

            {/* Amount */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <i className="pi pi-dollar text-blue-600"></i>
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <InputText
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-8 border border-gray-300"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="pi pi-file-edit text-blue-600"></i>
              Notes <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <InputTextarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details or remarks..."
              rows={4}
              className="w-full border border-gray-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setAddDialogVisible(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              outlined
            />
            <Button
              label="Add Expense"
              icon="pi pi-check"
              onClick={handleAddExpense}
              className="bg-blue-600 hover:bg-blue-700 border-0 text-white px-6 py-2"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ExpenseManagement;
