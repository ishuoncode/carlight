import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useFormik } from 'formik';

const initialValues = {
  address: '',
  date: '',
  time: '',
};

export default function Bookdate() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDisabled,setIsDisabled] =useState(false)
  const [searchtime,setSearchTime] =useState(false)

  const { handleBlur, handleSubmit, values, handleChange, setFieldValue } =
    useFormik({
      initialValues,
      onSubmit: async values => {
        console.log(values);
        // You can perform form submission logic here
      },
    });

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
        const formattedMinute = minute === 0 ? '00' : `${minute}`;
        const time = `${formattedHour}:${formattedMinute}`;
        options.push(
          <option key={time} value={time}>
            {time}
          </option>
        );
      }
    }
    return options;
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="grid grid-cols-2 gap-1">
          <label className="">
            <p className="mb-1 text-sm leading-[1.375rem]">Select Date</p>
            <DatePicker
              selected={selectedDate}
              required
              onChange={date => {
                setSelectedDate(date);
                setFieldValue('date', date); // Update 'date' field in form values
              }}
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            />
          </label>
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem]">Select Time</p>
            <select
              id="time"
              name="time"
              value={values.time}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
            >
              <option value="">Select Time</option>
              {generateTimeOptions()}
            </select>
          </label>
        </div>
        <label className="w-full">
          <p className="mb-1 text-sm leading-[1.375rem]">Select Address</p>
          <select
            id="address"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="w-full rounded-[0.5rem] p-[12px] bg-gray-200"
          >
            <option value="">Select Address</option>
            <option value="CarLight car washing center, Charkhari Rd, Rath Purab, Uttar Pradesh 210431">
              CarLight car washing center, Charkhari Rd, Rath Purab, Uttar
              Pradesh 210431
            </option>
          </select>
        </label>

       {searchtime? (<div>
          <p className="mb-3">Free Time Slots </p>
          <div className="flex ">
            <button
              className={`bg-red-300 rounded-full px-5 font-semibold mr-3 ${
                !isDisabled
                  ? 'opacity-100 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={isDisabled}
            >
              7:00
            </button>
            <button
              className={`bg-red-300 rounded-full px-5 font-semibold mr-3 ${
                !isDisabled
                  ? 'opacity-100 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={isDisabled}
            >
              7:30
            </button>
            <button
              className={`bg-red-300 rounded-full px-5 font-semibold mr-3 ${
                !isDisabled
                  ? 'opacity-100 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={isDisabled}
            >
              8:00
            </button>
            <button
              className={`bg-red-300 rounded-full px-5 font-semibold mr-3 ${
                !isDisabled
                  ? 'opacity-100 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={isDisabled}
            >
              8:30
            </button>
          </div>
        </div>):""} 

        <button
          type="submit"
          className="mt-6 rounded-[8px] bg-yellow-50 py-[9px] px-[12px] font-medium text-gray-900 duration-500"
        >
          Find Time
        </button>
      </form>
    </div>
  );
}
