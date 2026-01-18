'use client';
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';

export default function AddOutlet({ onOutletAdded }) {
  const [outletForm, setOutletForm] = useState({
    name: '',
    address: ''
  });
  const [outletSubmitting, setOutletSubmitting] = useState(false);

  const handleOutletFormChange = (field, value) => {
    setOutletForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddOutlet = async (e) => {
    e.preventDefault();
    setOutletSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/outlets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(outletForm),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Outlet added successfully!');
        // Clear localStorage to force refresh of outlets
        localStorage.removeItem('outlets');
        // Reset form
        setOutletForm({
          name: '',
          address: ''
        });
        // Call callback to refresh outlets in parent
        if (onOutletAdded) {
          onOutletAdded();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add outlet');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setOutletSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <i className="pi pi-building text-green-600"></i>
          Add New Outlet
        </h1>
        <p className="text-gray-600 mt-2">Create a new outlet location for your business</p>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleAddOutlet} className="space-y-6">
          {/* Outlet Name Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="outletName" className="font-semibold text-gray-700 flex items-center gap-2">
              <i className="pi pi-tag text-green-600"></i>
              Outlet Name
            </label>
            <InputText
              id="outletName"
              value={outletForm.name}
              onChange={(e) => handleOutletFormChange('name', e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 transition-all"
              required
              placeholder="e.g., Main Branch, Downtown Outlet"
            />
          </div>

          {/* Address Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="font-semibold text-gray-700 flex items-center gap-2">
              <i className="pi pi-map-marker text-green-600"></i>
              Address
            </label>
            <InputText
              id="address"
              value={outletForm.address}
              onChange={(e) => handleOutletFormChange('address', e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 transition-all"
              required
              placeholder="e.g., Lucknow, Gomti Nagar"
            />
          </div>

          <Divider />

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined p-button-secondary"
              onClick={() => setOutletForm({
                name: '',
                address: ''
              })}
            />
            <Button
              type="submit"
              label={outletSubmitting ? 'Creating...' : 'Create Outlet'}
              icon={outletSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              className="p-button-success px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
              disabled={outletSubmitting}
              loading={outletSubmitting}
            />
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 bg-green-50 border-l-4 border-green-600">
        <div className="flex gap-3">
          <i className="pi pi-info-circle text-green-600 text-xl"></i>
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Outlet Information</h3>
            <p className="text-sm text-green-700">
              Once created, this outlet will be available for user assignment and business operations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
