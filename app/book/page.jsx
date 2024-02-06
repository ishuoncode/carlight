'use client';

import { useFormik } from 'formik';

import 'react-datepicker/dist/react-datepicker.css';
import Bookdate from './bookdate';

const initialValues = {
  email: '',
  phone: '',
  name: '',
};

export default function Page() {
  const { handleBlur, handleSubmit, values, handleChange } = useFormik({
    initialValues,
    onSubmit: async values => {
      console.log(values);
    },
  });

  // Sample data for wash plans
  const plan = {
    id: 3,
    name: 'Premium Wash',
    price: '30',
    date: '22',
    time: 22,
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between">
    {/* Left side - Card displaying wash plans */}
    <div className="w-full md:w-1/3 p-4">
      <h2 className="text-xl font-bold mb-4">Wash Plan</h2>
      <div className="bg-white p-4 mb-4 shadow-md">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <p className="text-gray-600">Price: ₹{plan.price}</p>
        <p className="text-lg text-gray-600">Date: {plan.date}</p>
        <p className="text-gray-600">Time: {plan.time}</p>
      </div>
    </div>

      {/* Right side - Form */}
      <div className="w-full md:w-2/3 p-4">
        <h2 className="text-xl font-bold mb-4">Checkout Form</h2>
        <Bookdate />

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem]">
              Name <sup className="text-pink-200">*</sup>
            </p>
            <input
              type="name"
              id="name"
              placeholder="Name"
              autoComplete="on"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            />
          </label>
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

          <button
            type="submit"
            className="mt-6 rounded bg-yellow-50 py-3 px-4 font-medium text-gray-900 duration-500 "
          >
            Proceed
          </button>
        </form>
      </div>
    </div>
  );
}
