'use client';
import {useState} from 'react';
import { useFormik } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const initialValues = {
  email: '',
  phone: '',
  address: '',
  pincode: '',
  selectedDate: null,
};

export default function Page() {
  const [selectedDate, setSelectedDate] = useState(null)



  const { handleBlur, handleSubmit, values, handleChange ,setFieldValue} = useFormik({
    initialValues,
    onSubmit: async values => {
      console.log(values);
    },
  });

  // Sample data for wash plans
  const washPlans = [
    { id: 1, name: 'Basic Wash', price: '10' },
    { id: 2, name: 'Standard Wash', price: '20' },
    { id: 3, name: 'Premium Wash', price: '30' },
  ];

 

  return (
    <div className="flex justify-between">
      {/* Left side - Card displaying wash plans */}
      <div className="w-1/3 p-4">
        <h2 className="text-xl font-bold mb-4">Wash Plans</h2>
        {washPlans.map(plan => (
          <div key={plan.id} className="bg-white p-4 mb-4 shadow-md">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-gray-600">Price: ${plan.price}</p>
          </div>
        ))}
      </div>

      {/* Right side - Form */}
      <div className="w-2/3 p-4">
        <h2 className="text-xl font-bold mb-4">Checkout Form</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem]">
              Email Address <sup className="text-pink-200">*</sup>
            </p>
            <input
              type="email"
              id="email"
              placeholder="Email"
              autoComplete="on"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            />
          </label>
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem]">
              Phone Number <sup className="text-pink-200">*</sup>
            </p>
            <input
              type="tel"
              id="phone"
              placeholder="Phone Number"
              autoComplete="on"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            />
          </label>
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem]">Select Date</p>
            <DatePicker
              selected={selectedDate}
              onChange={date => {
                setSelectedDate(date);
                setFieldValue('selectedDate', date);
              }}
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            />
          </label>
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem]">
              Address <sup className="text-pink-200">*</sup>
            </p>
            <textarea
              id="address"
              placeholder="Address"
              name="address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            ></textarea>
          </label>
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem]">
              Pincode <sup className="text-pink-200">*</sup>
            </p>
            <input
              type="text"
              id="pincode"
              placeholder="Pincode"
              autoComplete="on"
              name="pincode"
              value={values.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            />
          </label>
          <button
            type="submit"
            className="mt-6 rounded-[8px] bg-yellow-50 py-[9px] px-[12px] font-medium text-gray-900 duration-500 hover:scale-[1.1]"
          >
            Proceed
          </button>
        </form>
      </div>
    </div>
  );
}
