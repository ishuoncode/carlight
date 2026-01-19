'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { PanelMenu } from 'primereact/panelmenu';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AddUser from '../components/dashboard/AddUser';
import AddOutlet from '../components/dashboard/AddOutlet';
import ListStaff from '../components/dashboard/ListStaff';
import WashPackage from '../components/dashboard/WashPackage';
import OutletPricing from '../components/dashboard/OutletPricing';
import Billing from '../components/dashboard/Billing';
import Extras from '../components/dashboard/Extras';
import Customer from '../components/dashboard/Customer';
import CarFrequency from '../components/dashboard/CarFrequency';
import ExpenseManagement from '../components/dashboard/ExpenseManagement';
import Analytics from '../components/dashboard/Analytics';
import YourBilling from '../components/dashboard/YourBilling';
import CarOwner from '../components/dashboard/CarOwner';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage or default based on role
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTab');
      const storedUser = localStorage.getItem('user');
      const userRole = storedUser ? JSON.parse(storedUser).role : null;
      
      // For CASHIER, default to billing
      if (userRole === 'CASHIER') {
        return 'bills';
      }
      
      return savedTab || 'service';
    }
    return 'service';
  });
  const [outlets, setOutlets] = useState([]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Fetch outlets from API or localStorage
  useEffect(() => {
    const fetchOutlets = async () => {
      // Check if outlets are already in localStorage
      const cachedOutlets = localStorage.getItem('outlets');
      if (cachedOutlets) {
        const parsedOutlets = JSON.parse(cachedOutlets);
        setOutlets(parsedOutlets.map(outlet => ({
          label: outlet.name,
          value: outlet.id
        })));
        return;
      }

      // Fetch from API if not in localStorage
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/outlets`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Store in localStorage
          localStorage.setItem('outlets', JSON.stringify(data));
          // Set dropdown options
          setOutlets(data.map(outlet => ({
            label: outlet.name,
            value: outlet.id
          })));
        } else {
          toast.error('Failed to fetch outlets');
        }
      } catch (err) {
        console.error('Error fetching outlets:', err);
        toast.error('Error loading outlets');
      }
    };

    if (user) {
      fetchOutlets();
    }
  }, [user]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  const fetchOutletsData = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/outlets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
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
  };

  const menuItems = [
    {
      label: 'Your Billing',
      icon: 'pi pi-receipt',
      command: () => setActiveTab('yourBilling'),
      className: activeTab === 'yourBilling' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role === 'CASHIER'
    },
    {
      label: 'Service',
      icon: 'pi pi-wrench',
      command: () => setActiveTab('service'),
      className: activeTab === 'service' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Add Staff',
      icon: 'pi pi-user-plus',
      command: () => setActiveTab('addUser'),
      className: activeTab === 'addUser' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'List Staff',
      icon: 'pi pi-users',
      command: () => setActiveTab('listStaff'),
      className: activeTab === 'listStaff' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Add Outlet',
      icon: 'pi pi-building',
      command: () => setActiveTab('addOutlet'),
      className: activeTab === 'addOutlet' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Billing',
      icon: 'pi pi-file',
      command: () => setActiveTab('bills'),
      className: activeTab === 'bills' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: true
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-line',
      command: () => setActiveTab('analytics'),
      className: activeTab === 'analytics' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Extras',
      icon: 'pi pi-plus-circle',
      command: () => setActiveTab('extras'),
      className: activeTab === 'extras' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Bill History',
      icon: 'pi pi-history',
      command: () => setActiveTab('customer'),
      className: activeTab === 'customer' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Car Frequency',
      icon: 'pi pi-car',
      command: () => setActiveTab('carfrequency'),
      className: activeTab === 'carfrequency' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Car & Owner',
      icon: 'pi pi-id-card',
      command: () => setActiveTab('carowner'),
      className: activeTab === 'carowner' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    },
    {
      label: 'Expense Management',
      icon: 'pi pi-money-bill',
      command: () => setActiveTab('expenses'),
      className: activeTab === 'expenses' ? 'bg-blue-100 border-l-4 border-blue-600' : '',
      visible: user?.role !== 'CASHIER'
    }
  ].filter(item => item.visible);

  const renderContent = () => {
    switch (activeTab) {
      case 'service':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <i className="pi pi-cog text-blue-600"></i>
                Service Management
              </h1>
              <p className="text-gray-600 mt-2">Manage wash packages and outlet pricing</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wash Package Card */}
              <div 
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setActiveTab('washPackage')}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-500 transition-all">
                    <i className="pi pi-box text-3xl text-blue-600 group-hover:text-white"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600">Wash Package</h2>
                    <p className="text-gray-500 text-sm">Manage wash packages</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Create, edit, and manage different wash packages and services offered to customers.
                </p>
              </div>

              {/* Outlet Pricing Card */}
              <div 
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setActiveTab('outletPricing')}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-500 transition-all">
                    <i className="pi pi-dollar text-3xl text-green-600 group-hover:text-white"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 group-hover:text-green-600">Outlet Pricing</h2>
                    <p className="text-gray-500 text-sm">Manage outlet-specific pricing</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Set and manage pricing for wash packages at different outlet locations.
                </p>
              </div>
            </div>
          </div>
        );
      case 'washPackage':
        return <WashPackage onBack={() => setActiveTab('service')} />;
      case 'outletPricing':
        return <OutletPricing onBack={() => setActiveTab('service')} />;
      case 'addUser':
        return <AddUser outlets={outlets} />;
      case 'listStaff':
        return <ListStaff outlets={outlets} />;
      case 'addOutlet':
        return <AddOutlet onOutletAdded={fetchOutletsData} />;
      case 'bills':
        return <Billing />;
      case 'analytics':
        return <Analytics />;
      case 'extras':
        return <Extras />;
      case 'customer':
        return <Customer />;
      case 'carfrequency':
        return <CarFrequency />;
      case 'carowner':
        return <CarOwner />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'yourBilling':
        return <YourBilling />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden p-4 bg-white shadow">
        <Button
          icon="pi pi-bars"
          onClick={() => setVisible(true)}
          className="p-button-text"
          label="Menu"
        />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        className="lg:hidden w-64"
      >
        <h2 className="text-xl font-bold mb-4 px-3">Dashboard Menu</h2>
        <PanelMenu
          model={menuItems}
          className="w-full"
          onClick={() => setVisible(false)}
        />
      </Sidebar>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Dashboard</h2>
            <PanelMenu model={menuItems} className="w-full" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow p-6 ">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
