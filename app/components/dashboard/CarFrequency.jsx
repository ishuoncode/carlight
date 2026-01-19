'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import * as XLSX from 'xlsx';

const CarFrequency = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const toast = React.useRef(null);
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [carVisits, setCarVisits] = useState([]);
  const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
  const [allBills, setAllBills] = useState([]);

  const fetchCarFrequency = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const bills = await response.json();
        setAllBills(bills); // Store all bills for later use
        
        // Group bills by car number and calculate frequency
        const carFrequencyMap = {};
        bills.forEach(bill => {
          const carNo = bill.carNo;
          if (carNo) {
            if (!carFrequencyMap[carNo]) {
              carFrequencyMap[carNo] = {
                carNo: carNo,
                carType: bill.carType,
                customerName: bill.customerName,
                phoneNumber: bill.phoneNumber,
                visitCount: 0,
                totalSpent: 0,
                lastVisit: bill.createdAt
              };
            }
            carFrequencyMap[carNo].visitCount += 1;
            carFrequencyMap[carNo].totalSpent += bill.totalAmount || 0;
            
            // Update last visit if this bill is more recent
            if (new Date(bill.createdAt) > new Date(carFrequencyMap[carNo].lastVisit)) {
              carFrequencyMap[carNo].lastVisit = bill.createdAt;
            }
          }
        });
        
        // Convert to array and sort by visit count
        const carArray = Object.values(carFrequencyMap).sort((a, b) => b.visitCount - a.visitCount);
        setCarData(carArray);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch car frequency data',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching car frequency:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch car frequency data',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarFrequency();
  }, []);

  const formatDate = (value) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const formatDateTime = (value) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;
    
    return `${day} ${month} ${year} ${hour12}:${minutes} ${ampm}`;
  };

  const formatCurrency = (value) => {
    return `₹${value ? value.toFixed(2) : '0.00'}`;
  };

  const viewDetailsTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-eye"
        label="Visits"
        className="p-button-sm p-button-info"
        onClick={() => {
          setSelectedCar(rowData);
          const visits = allBills.filter(bill => bill.carNo === rowData.carNo);
          setCarVisits(visits);
          setDetailsDialogVisible(true);
        }}
        tooltip="View All Visits"
      />
    );
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredCars.map((car, index) => ({
      'S.No': index + 1,
      'Car Number': car.carNo,
      'Car Type': car.carType || 'N/A',
      'Customer Name': car.customerName,
      'Phone Number': car.phoneNumber,
      'Total Visits': car.visitCount,
      'Total Spent (₹)': car.totalSpent.toFixed(2),
      'Average Per Visit (₹)': (car.totalSpent / car.visitCount).toFixed(2),
      'Last Visit': formatDate(car.lastVisit)
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 15 }, // Car Number
      { wch: 12 }, // Car Type
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Phone Number
      { wch: 12 }, // Total Visits
      { wch: 15 }, // Total Spent
      { wch: 18 }, // Average Per Visit
      { wch: 15 }  // Last Visit
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Car Frequency');

    // Generate filename with current date
    const date = new Date();
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const filename = `Car_Frequency_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);

    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Data exported to Excel successfully',
      life: 3000
    });
  };

  const filteredCars = carData.filter(car => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (car.carNo && car.carNo.toLowerCase().includes(search)) ||
      (car.customerName && car.customerName.toLowerCase().includes(search)) ||
      (car.phoneNumber && car.phoneNumber.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-6">
      <Toast ref={toast} />
      
      <div className="bg-white shadow-sm rounded-lg">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <i className="pi pi-car text-blue-600"></i>
              Car Frequency
            </h2>
            <p className="text-gray-600 mt-2">Track vehicle visit frequency and spending</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              label="Export to Excel"
              icon="pi pi-file-excel"
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 border-0 text-white px-4 py-2"
              disabled={filteredCars.length === 0}
            />
            <Button
              type="button"
              label="Refresh"
              icon="pi pi-refresh"
              onClick={fetchCarFrequency}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 border-0 text-white px-4 py-2"
            />
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-4">
          <div className="relative">
            <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by car number, customer name, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-auto" style={{ width: '100%' }}>
          <DataTable
            value={filteredCars}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            emptyMessage="No car data found"
            stripedRows
            showGridlines
          >
            <Column field="carNo" header="Car No" sortable style={{ width: '10rem' }} />
            <Column field="carType" header="Car Type" sortable style={{ width: '10rem' }} />
            <Column field="customerName" header="Customer Name" sortable style={{ width: '12rem' }} />
            <Column field="phoneNumber" header="Phone Number" sortable style={{ width: '11rem' }} />
            <Column 
              field="visitCount" 
              header="Total Visits" 
              sortable 
              style={{ width: '10rem' }}
              body={(rowData) => (
                <span className="font-semibold text-blue-600">{rowData.visitCount}</span>
              )}
            />
            <Column 
              field="totalSpent" 
              header="Total Spent" 
              sortable 
              body={(rowData) => formatCurrency(rowData.totalSpent)} 
              style={{ width: '10rem' }} 
            />
            <Column 
              field="lastVisit" 
              header="Last Visit" 
              sortable 
              body={(rowData) => formatDate(rowData.lastVisit)} 
              style={{ width: '11rem' }} 
            />
            <Column 
              header="Action" 
              body={viewDetailsTemplate} 
              style={{ width: '10rem', textAlign: 'center' }} 
            />
          </DataTable>
        </div>
      </div>

      {/* Car Visits Details Dialog */}
      <Dialog
        header={selectedCar ? `All Visits - ${selectedCar.carNo}` : 'Car Visits'}
        visible={detailsDialogVisible}
        style={{ width: '80vw' }}
        onHide={() => setDetailsDialogVisible(false)}
        modal
      >
        {selectedCar && (
          <div className="p-4">
            {/* Car Summary */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 font-semibold">Car Number:</p>
                  <p className="text-gray-800 text-lg">{selectedCar.carNo}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Car Type:</p>
                  <p className="text-gray-800 text-lg">{selectedCar.carType}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Customer Name:</p>
                  <p className="text-gray-800 text-lg">{selectedCar.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Phone Number:</p>
                  <p className="text-gray-800 text-lg">{selectedCar.phoneNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
                <div className="text-center">
                  <p className="text-gray-600 font-semibold">Total Visits</p>
                  <p className="text-blue-600 text-2xl font-bold">{selectedCar.visitCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-semibold">Total Spent</p>
                  <p className="text-green-600 text-2xl font-bold">{formatCurrency(selectedCar.totalSpent)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-semibold">Average Per Visit</p>
                  <p className="text-purple-600 text-2xl font-bold">{formatCurrency(selectedCar.totalSpent / selectedCar.visitCount)}</p>
                </div>
              </div>
            </div>

            {/* All Visits Table */}
            <h3 className="text-xl font-bold mb-3 text-gray-800">Visit History</h3>
            <DataTable
              value={carVisits}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 15]}
              emptyMessage="No visits found"
              stripedRows
              showGridlines
            >
              <Column 
                field="billId" 
                header="Bill ID" 
                sortable 
                style={{ width: '8rem' }}
              />
              <Column 
                field="invoiceNo" 
                header="Invoice No" 
                sortable 
                style={{ width: '15rem' }}
              />
              <Column 
                field="createdAt" 
                header="Visit Date" 
                sortable 
                body={(rowData) => formatDateTime(rowData.createdAt)} 
                style={{ width: '15rem' }}
              />
              <Column 
                field="outletName" 
                header="Outlet" 
                sortable 
                style={{ width: '12rem' }}
              />
              <Column 
                field="packageName" 
                header="Package" 
                sortable 
                style={{ width: '12rem' }}
              />
              <Column 
                field="totalAmount" 
                header="Amount" 
                sortable 
                body={(rowData) => formatCurrency(rowData.totalAmount)} 
                style={{ width: '10rem' }}
              />
              <Column 
                field="paymentMethod" 
                header="Payment" 
                sortable 
                style={{ width: '10rem' }}
              />
            </DataTable>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default CarFrequency;
