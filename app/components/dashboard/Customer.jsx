'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const Customer = () => {
  const toast = React.useRef(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/bills', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch bills',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch bills',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
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

  const formatLastVisit = (createdAt) => {
    if (!createdAt) return 'N/A';
    
    const days = differenceInDays(new Date(), new Date(createdAt));
    
    if (days > 90) {
      const months = Math.floor(days / 30);
      return `last ${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `last ${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  const viewMoreTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text p-button-info"
        onClick={() => {
          setSelectedBill(rowData);
          setViewDialogVisible(true);
        }}
        tooltip="View Details"
      />
    );
  };

  const generateBillPDF = (billData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Helper function for PDF currency format (without rupee symbol)
    const formatPDFCurrency = (value) => {
      return (value ? value.toFixed(2) : '0.00');
    };

    // Header - CARLIGHT
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('CARLIGHT', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(billData.outletName, pageWidth / 2, yPos, { align: 'center' });
    
    // Line separator
    yPos += 8;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Invoice Info
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice No: ${billData.invoiceNo}`, 15, yPos);
    doc.text(`Date: ${formatDateTime(billData.createdAt)}`, pageWidth - 15, yPos, { align: 'right' });
    
    yPos += 6;
    doc.text(`Bill ID: ${billData.billId}`, 15, yPos);
    doc.text(`Payment: ${billData.paymentMethod}`, pageWidth - 15, yPos, { align: 'right' });
    
    // Customer Details Section
    yPos += 12;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Details', 15, yPos);
    doc.setFont(undefined, 'normal');
    
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Name: ${billData.customerName}`, 15, yPos);
    yPos += 6;
    doc.text(`Phone: ${billData.phoneNumber}`, 15, yPos);
    yPos += 6;
    doc.text(`Vehicle Number: ${billData.carNo}`, 15, yPos);
    yPos += 6;
    doc.text(`Vehicle Type: ${billData.carType || 'N/A'}`, 15, yPos);
    
    // Services Section
    yPos += 12;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Services', 15, yPos);
    doc.setFont(undefined, 'normal');
    
    yPos += 8;
    doc.setFontSize(10);
    
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 7, 'F');
    doc.setFont(undefined, 'bold');
    doc.text('Description', 20, yPos);
    doc.text('Amount (INR)', pageWidth - 20, yPos, { align: 'right' });
    doc.setFont(undefined, 'normal');
    
    yPos += 8;
    
    // Package
    doc.text(billData.packageName, 20, yPos);
    doc.text(formatPDFCurrency(billData.packagePrice || 0), pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
    
    // Extras
    if (billData.extras && billData.extras.length > 0) {
      billData.extras.forEach(extra => {
        doc.text(extra.name, 20, yPos);
        doc.text(formatPDFCurrency(extra.price), pageWidth - 20, yPos, { align: 'right' });
        yPos += 6;
      });
    }
    
    // Additional Charges
    if (billData.additionalCharges && billData.additionalCharges.length > 0) {
      billData.additionalCharges.forEach(charge => {
        doc.text(charge.title, 20, yPos);
        doc.text(formatPDFCurrency(charge.amount), pageWidth - 20, yPos, { align: 'right' });
        yPos += 6;
      });
    }
    
    // Discount
    if (billData.discount > 0) {
      doc.setTextColor(255, 0, 0);
      doc.text('Discount', 20, yPos);
      doc.text(`- ${formatPDFCurrency(billData.discount)}`, pageWidth - 20, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    }
    
    // Total line
    yPos += 2;
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;
    
    // Total Amount
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL AMOUNT', 20, yPos);
    doc.text(formatPDFCurrency(billData.totalAmount), pageWidth - 20, yPos, { align: 'right' });
    
    // Footer
    yPos += 15;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Created by: ${billData.createdBy}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
    
    return doc;
  };

  const printBill = (billData) => {
    const doc = generateBillPDF(billData);
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = function() {
        printWindow.print();
      };
    }
  };

  const downloadBill = (billData) => {
    try {
      const doc = generateBillPDF(billData);
      doc.save(`Bill_${billData.invoiceNo}.pdf`);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Bill downloaded as PDF successfully',
        life: 3000
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate PDF',
        life: 3000
      });
    }
  };

  const printTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-print"
        className="p-button-rounded p-button-text p-button-secondary"
        onClick={() => printBill(rowData)}
        tooltip="Print Bill"
      />
    );
  };

  const downloadTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-download"
        className="p-button-rounded p-button-text p-button-success"
        onClick={() => downloadBill(rowData)}
        tooltip="Download Bill"
      />
    );
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = !searchTerm || (
      (bill.phoneNumber && bill.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.customerName && bill.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.carNo && bill.carNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesOutlet = !selectedOutlet || bill.outletName === selectedOutlet;
    
    // Date filter
    let matchesDate = true;
    if (startDate || endDate) {
      const billDate = new Date(bill.createdAt);
      billDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && billDate >= start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of day
        matchesDate = matchesDate && billDate <= end;
      }
    }
    
    return matchesSearch && matchesOutlet && matchesDate;
  });

  const uniqueOutlets = [...new Set(bills.map(bill => bill.outletName).filter(Boolean))];

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredBills.map((bill, index) => ({
      'S.No': index + 1,
      'Bill ID': bill.billId,
      'Invoice No': bill.invoiceNo,
      'Car Number': bill.carNo,
      'Car Type': bill.carType || 'N/A',
      'Customer Name': bill.customerName,
      'Phone Number': bill.phoneNumber,
      'Outlet Name': bill.outletName,
      'Package Name': bill.packageName,
      'Total Amount (INR)': bill.totalAmount ? bill.totalAmount.toFixed(2) : '0.00',
      'Discount (INR)': bill.discount ? bill.discount.toFixed(2) : '0.00',
      'Payment Method': bill.paymentMethod,
      'Created At': formatDateTime(bill.createdAt),
      'Created By': bill.createdBy
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 10 }, // Bill ID
      { wch: 22 }, // Invoice No
      { wch: 15 }, // Car Number
      { wch: 12 }, // Car Type
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Phone Number
      { wch: 15 }, // Outlet Name
      { wch: 18 }, // Package Name
      { wch: 18 }, // Total Amount
      { wch: 15 }, // Discount
      { wch: 15 }, // Payment Method
      { wch: 20 }, // Created At
      { wch: 25 }  // Created By
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bill History');

    // Generate filename with current date
    const date = new Date();
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const filename = `Bill_History_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);

    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Bill history exported to Excel successfully',
      life: 3000
    });
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <i className="pi pi-history text-blue-600"></i>
                Bill History
              </h2>
              <p className="text-gray-600 mt-2">View complete billing history</p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Box */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Phone, customer name, or car number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Outlet Dropdown */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
              <div className="relative">
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Outlets</option>
                  {uniqueOutlets.map((outlet, index) => (
                    <option key={index} value={outlet}>{outlet}</option>
                  ))}
                </select>
                <i className="pi pi-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>

            {/* Start Date */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 invisible">Actions</label>
              <div className="flex gap-2">
                <Button
                  icon="pi pi-filter-slash"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedOutlet('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 border-0 text-white"
                  tooltip="Clear Filters"
                />
                <Button
                  icon="pi pi-file-excel"
                  onClick={exportToExcel}
                  className="flex-1 bg-green-600 hover:bg-green-700 border-0 text-white"
                  disabled={filteredBills.length === 0}
                  tooltip="Export to Excel"
                />
                <Button
                  icon="pi pi-refresh"
                  onClick={fetchBills}
                  loading={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 border-0 text-white"
                  tooltip="Refresh"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-auto" style={{ width: '100%' }}>
          <DataTable
            value={filteredBills}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            emptyMessage="No bills found"
            stripedRows
            showGridlines
          >
          <Column field="carNo"  header="Car No" sortable style={{ width: '10rem' }} />
            <Column field="carType"  header="Car Type" sortable style={{ width: '10rem' }} />
          <Column field="customerName" header="Customer Name" sortable style={{ width: '12rem' }} />
          <Column field="phoneNumber" header="Phone Number" sortable style={{ width: '11rem' }} />
          <Column 
            field="createdAt" 
            header="Created At" 
            sortable 
            body={(rowData) => formatDate(rowData.createdAt)} 
            style={{ width: '14rem' }} 
          />
          <Column field="outletName" header="Outlet Name" sortable style={{ width: '12rem' }} />
          <Column 
            field="totalAmmount" 
            header="Total Amount" 
            sortable 
            body={(rowData) => `₹${rowData.totalAmount.toFixed(1)}`} 
            style={{ width: '10rem' }} 
          />
          <Column 
            header="Action" 
            body={(rowData) => (
              <div className="flex gap-1">
                {printTemplate(rowData)}
                {downloadTemplate(rowData)}
                {viewMoreTemplate(rowData)}
              </div>
            )} 
            style={{ width: '10rem', textAlign: 'center' }} 
          />
        </DataTable>
        </div>
      </div>

      {/* View More Dialog */}
      <Dialog
        header="Bill Details"
        visible={viewDialogVisible}
        style={{ width: '60vw' }}
        onHide={() => setViewDialogVisible(false)}
        modal
      >
        {selectedBill && (
          <div className="p-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 font-semibold">Bill ID:</p>
                <p className="text-gray-800">{selectedBill.billId}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Invoice No:</p>
                <p className="text-gray-800">{selectedBill.invoiceNo}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Customer Name:</p>
                <p className="text-gray-800">{selectedBill.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Phone Number:</p>
                <p className="text-gray-800">{selectedBill.phoneNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Car Number:</p>
                <p className="text-gray-800">{selectedBill.carNo}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Car Type:</p>
                <p className="text-gray-800">{selectedBill.carType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Outlet:</p>
                <p className="text-gray-800">{selectedBill.outletName}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Payment Method:</p>
                <p className="text-gray-800">{selectedBill.paymentMethod}</p>
              </div>
            </div>

            {/* Package Details */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h3 className="font-bold text-gray-700 mb-2">Package Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600 font-semibold">Package Name:</p>
                  <p className="text-gray-800">{selectedBill.packageName}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Package Price:</p>
                  <p className="text-gray-800">{formatCurrency(selectedBill.packagePrice || 0)}</p>
                </div>
              </div>
            </div>

            {/* Extras */}
            {selectedBill.extras && selectedBill.extras.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <h3 className="font-bold text-gray-700 mb-2">Extras</h3>
                <div className="space-y-2">
                  {selectedBill.extras.map((extra, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="text-gray-800">{extra.name}</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(extra.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Charges */}
            {selectedBill.additionalCharges && selectedBill.additionalCharges.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 rounded">
                <h3 className="font-bold text-gray-700 mb-2">Additional Charges</h3>
                <div className="space-y-2">
                  {selectedBill.additionalCharges.map((charge, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="text-gray-800">{charge.title}</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(charge.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="p-3 bg-green-50 rounded">
              <h3 className="font-bold text-gray-700 mb-2">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-red-600 font-semibold">- {formatCurrency(selectedBill.discount || 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="text-gray-800 font-bold text-lg">Total Amount:</span>
                  <span className="text-green-600 font-bold text-lg">{formatCurrency(selectedBill.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-600 font-semibold">Created At:</p>
                <p className="text-gray-800">{formatDateTime(selectedBill.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Created By:</p>
                <p className="text-gray-800">{selectedBill.createdBy}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Customer;
