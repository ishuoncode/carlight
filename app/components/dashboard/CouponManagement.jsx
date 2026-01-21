'use client';
import React, { useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';

const CouponManagement = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const toast = React.useRef(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [cars, setCars] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    validTill: null,
    outletId: null,
    carId: null,
    maxUses: 999999,
    oncePerCar: false
  });

  // Fetch outlets
  const fetchOutlets = async () => {
    try {
      const cachedOutlets = localStorage.getItem('outlets');
      if (cachedOutlets) {
        const parsedOutlets = JSON.parse(cachedOutlets);
        setOutlets(parsedOutlets.map(outlet => ({
          label: outlet.name,
          value: outlet.id
        })));
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/outlets`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('outlets', JSON.stringify(data));
        setOutlets(data.map(outlet => ({
          label: outlet.name,
          value: outlet.id
        })));
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  // Fetch cars
  const fetchCars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cars`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cars API response:', data); // Debug log
        setCars(data.map(car => ({
          label: `${car.carNo || car.carNumber || 'N/A'} - ${car.customerName || car.ownerName || car.owner || 'Unknown'}`,
          value: car.id
        })));
      } else {
        console.error('Failed to fetch cars:', response.status);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch coupons',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch coupons',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Add coupon
  const handleAddCoupon = async () => {
    if (!formData.code || !formData.discountValue || !formData.validTill) {
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
      
      // Prepare request body
      const requestBody = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        validTill: formData.validTill.toISOString().split('T')[0],
        maxUses: formData.maxUses,
        oncePerCar: formData.oncePerCar
      };

      // Add optional fields only if they have values
      if (formData.outletId) {
        requestBody.outletId = formData.outletId;
      }
      if (formData.carId) {
        requestBody.carId = formData.carId;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Coupon created successfully',
          life: 3000
        });

        setAddDialogVisible(false);
        resetForm();
        fetchCoupons();
      } else {
        const errorData = await response.json();
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: errorData.message || 'Failed to create coupon',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create coupon',
        life: 3000
      });
    }
  };

  // Toggle coupon status
  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${couponId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          active: (!currentStatus).toString()
        })
      });

      if (response.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
          life: 3000
        });
        fetchCoupons();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update coupon status',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update coupon status',
        life: 3000
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENT',
      discountValue: '',
      validTill: null,
      outletId: null,
      carId: null,
      maxUses: 999999,
      oncePerCar: false
    });
  };

  useEffect(() => {
    fetchOutlets();
    fetchCars();
    fetchCoupons();
  }, []);

  const formatDate = (value) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const discountTypeOptions = [
    { label: 'Percentage (%)', value: 'PERCENT' },
    { label: 'Flat Amount (₹)', value: 'FLAT' }
  ];

  const statusBodyTemplate = (rowData) => {
    return (
      <InputSwitch
        checked={rowData.active}
        onChange={() => handleToggleStatus(rowData.id, rowData.active)}
        tooltip={rowData.active ? 'Deactivate' : 'Activate'}
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  const discountBodyTemplate = (rowData) => {
    if (rowData.discountType === 'PERCENT') {
      return `${rowData.discountValue}%`;
    }
    return `₹${rowData.discountValue}`;
  };

  const scopeBodyTemplate = (rowData) => {
    const hasOncePerCar = rowData.oncePerCar;
    
    if (rowData.outletId && rowData.carId) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <i className="pi pi-building text-blue-600 text-xs"></i>
            <span className="text-xs font-semibold text-gray-700">{rowData.outletName || `Outlet #${rowData.outletId}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="pi pi-car text-purple-600 text-xs"></i>
            <span className="text-xs font-semibold text-gray-700">{rowData.carNo || `Car #${rowData.carId}`}</span>
          </div>
          {hasOncePerCar && (
            <div className="flex items-center gap-2 mt-1">
              <i className="pi pi-shield text-orange-600 text-xs"></i>
              <span className="text-xs font-semibold text-orange-700">Once Per Car</span>
            </div>
          )}
        </div>
      );
    } else if (rowData.outletId) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <i className="pi pi-building text-blue-600 text-sm"></i>
            <span className="text-sm font-semibold text-gray-700">{rowData.outletName || `Outlet #${rowData.outletId}`}</span>
          </div>
          {hasOncePerCar && (
            <div className="flex items-center gap-2 mt-1">
              <i className="pi pi-shield text-orange-600 text-xs"></i>
              <span className="text-xs font-semibold text-orange-700">Once Per Car</span>
            </div>
          )}
        </div>
      );
    } else if (rowData.carId) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <i className="pi pi-car text-purple-600 text-sm"></i>
            <span className="text-sm font-semibold text-gray-700">{rowData.carNo || `Car #${rowData.carId}`}</span>
          </div>
          {hasOncePerCar && (
            <div className="flex items-center gap-2 mt-1">
              <i className="pi pi-shield text-orange-600 text-xs"></i>
              <span className="text-xs font-semibold text-orange-700">Once Per Car</span>
            </div>
          )}
        </div>
      );
    }
    
    // Global scope
    if (hasOncePerCar) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <i className="pi pi-globe text-green-600 text-sm"></i>
            <span className="text-sm font-semibold text-green-700">All Outlets & Cars</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <i className="pi pi-shield text-orange-600 text-xs"></i>
            <span className="text-xs font-semibold text-orange-700">Once Per Car</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <i className="pi pi-globe text-green-600 text-sm"></i>
        <span className="text-sm font-semibold text-green-700">All Outlets & Cars</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />

      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <i className="pi pi-ticket text-blue-600"></i>
              Coupon Management
            </h2>
            <p className="text-gray-600 mt-2">Create and manage discount coupons</p>
          </div>
          <div className="flex gap-3">
            <Button
              icon="pi pi-refresh"
              onClick={fetchCoupons}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3"
              tooltip="Refresh data"
              tooltipOptions={{ position: 'bottom' }}
              outlined
            />
            <Button
              label="Create Coupon"
              icon="pi pi-plus"
              onClick={() => setAddDialogVisible(true)}
              className="bg-blue-600 hover:bg-blue-700 border-0 text-white px-6 py-3"
            />
          </div>
        </div>

        {/* Coupon Table */}
        <div className="overflow-auto">
          <DataTable
            value={coupons}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            emptyMessage="No coupons found"
            stripedRows
            showGridlines
            sortField="createdAt"
            sortOrder={-1}
          >
            <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
            <Column field="code" header="Coupon Code" sortable style={{ width: '12rem' }} 
              body={(rowData) => <span className="font-bold text-blue-600">{rowData.code}</span>} 
            />
            <Column field="discountType" header="Discount" sortable body={discountBodyTemplate} style={{ width: '10rem' }} />
            <Column header="Scope" body={scopeBodyTemplate} style={{ width: '18rem' }} />
            <Column field="maxUses" header="Max Uses" sortable style={{ width: '8rem' }} />
            <Column field="usedCount" header="Used" sortable style={{ width: '8rem' }} />
            <Column field="validTill" header="Valid Till" sortable body={(rowData) => formatDate(rowData.validTill)} style={{ width: '12rem' }} />
            <Column field="active" header="Status" body={statusBodyTemplate} style={{ width: '8rem' }} />
          </DataTable>
        </div>
      </div>

      {/* Add Coupon Dialog */}
      <Dialog
        visible={addDialogVisible}
        onHide={() => {
          setAddDialogVisible(false);
          resetForm();
        }}
        modal
        header={
          <div className="flex items-center gap-4 pb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
              <i className="pi pi-ticket text-3xl text-white"></i>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">Create New Coupon</h3>
              <p className="text-sm text-gray-500 mt-1">Design and launch your discount campaign</p>
            </div>
          </div>
        }
        style={{ width: '650px', maxWidth: '95vw' }}
        className="add-coupon-dialog"
      >
        <div className="pt-6 space-y-6">
          {/* Coupon Code */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border-2 border-blue-200">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="pi pi-tag text-white text-sm"></i>
              </div>
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SUMMER25, FLASH50, VIP100"
              className="w-full border-2 border-blue-300 text-lg font-bold tracking-wider uppercase p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              maxLength={20}
            />
            <div className="flex items-center gap-2 mt-2">
              <i className="pi pi-info-circle text-blue-600 text-xs"></i>
              <small className="text-gray-600 font-medium">Create a memorable code using letters and numbers</small>
            </div>
          </div>

          {/* Discount Section */}
          <div className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <i className="pi pi-percentage text-white text-sm"></i>
              </div>
              <h4 className="text-lg font-bold text-gray-800">Discount Details</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={formData.discountType}
                  options={discountTypeOptions}
                  onChange={(e) => setFormData({ ...formData, discountType: e.value })}
                  className="w-full border-2 border-gray-300 rounded-lg"
                />
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Value <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  value={formData.discountValue}
                  onValueChange={(e) => setFormData({ ...formData, discountValue: e.value })}
                  placeholder={formData.discountType === 'PERCENT' ? '10' : '100'}
                  className="w-full border-2 border-gray-300 rounded-lg"
                  inputClassName="text-lg font-bold"
                  min={0}
                  max={formData.discountType === 'PERCENT' ? 100 : undefined}
                  suffix={formData.discountType === 'PERCENT' ? '%' : ' ₹'}
                />
              </div>
            </div>

            {/* Preview Badge */}
            {formData.discountValue > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                <div className="flex items-center gap-2">
                  <i className="pi pi-eye text-green-700"></i>
                  <span className="text-sm font-semibold text-green-700">Preview:</span>
                  <span className="text-lg font-bold text-green-800">
                    {formData.discountType === 'PERCENT' 
                      ? `${formData.discountValue}% OFF` 
                      : `₹${formData.discountValue} OFF`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Validity & Usage */}
          <div className="grid grid-cols-2 gap-4">
            {/* Valid Till */}
            <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <i className="pi pi-calendar text-orange-600"></i>
                Valid Till <span className="text-red-500">*</span>
              </label>
              <Calendar
                value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.value })}
                dateFormat="dd M yy"
                placeholder="Select date"
                className="w-full border-2 border-orange-300 rounded-lg"
                showIcon
                minDate={new Date()}
              />
            </div>

            {/* Max Uses */}
            <div className="bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <i className="pi pi-hashtag text-pink-600"></i>
                Maximum Uses
              </label>
              <InputNumber
                value={formData.maxUses}
                onValueChange={(e) => setFormData({ ...formData, maxUses: e.value })}
                placeholder="999999"
                className="w-full border-2 border-pink-300 rounded-lg"
                min={1}
                useGrouping
              />
              <small className="text-gray-600 text-xs mt-1 block">∞ for unlimited</small>
            </div>
          </div>

          {/* Advanced Restrictions */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <i className="pi pi-filter text-white text-sm"></i>
              </div>
              <h4 className="text-lg font-bold text-gray-800">Advanced Restrictions</h4>
              <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-semibold">Optional</span>
            </div>

            <div className="space-y-4">
              {/* Outlet */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <i className="pi pi-building text-purple-600"></i>
                  Specific Outlet
                </label>
                <Dropdown
                  value={formData.outletId}
                  options={outlets}
                  onChange={(e) => setFormData({ ...formData, outletId: e.value })}
                  placeholder="🌍 Apply to all outlets"
                  className="w-full border-2 border-purple-300 rounded-lg"
                  showClear
                  filter
                />
                {formData.outletId && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded-lg">
                    <i className="pi pi-lock"></i>
                    <span>Coupon restricted to selected outlet only</span>
                  </div>
                )}
              </div>

              {/* Car */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <i className="pi pi-car text-purple-600"></i>
                  Specific Car / Customer
                </label>
                <Dropdown
                  value={formData.carId}
                  options={cars}
                  onChange={(e) => setFormData({ ...formData, carId: e.value })}
                  placeholder="🚗 Apply to all customers"
                  className="w-full border-2 border-purple-300 rounded-lg"
                  showClear
                  filter
                />
                {formData.carId && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded-lg">
                    <i className="pi pi-lock"></i>
                    <span>VIP coupon for selected customer only</span>
                  </div>
                )}
              </div>

              {/* Once Per Car */}
              <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <i className="pi pi-shield text-white text-sm"></i>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-800">Once Per Car</h5>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formData.oncePerCar ? 'Each car can use this coupon only once' : 'Cars can use this coupon multiple times'}
                      </p>
                    </div>
                  </div>
                  <InputSwitch
                    checked={formData.oncePerCar}
                    onChange={(e) => setFormData({ ...formData, oncePerCar: e.value })}
                  />
                </div>
                
                {formData.oncePerCar && (
                  <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <i className="pi pi-info-circle text-orange-700 text-sm"></i>
                      <p className="text-xs text-orange-700">
                        This coupon will be valid only once per vehicle, regardless of the total max uses limit
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setAddDialogVisible(false);
                resetForm();
              }}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg"
              outlined
            />
            <Button
              label="Create Coupon"
              icon="pi pi-check"
              onClick={handleAddCoupon}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white px-8 py-3 font-semibold rounded-lg shadow-lg"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CouponManagement;
