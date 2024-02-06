'use client';
import Image from 'next/image';
import React from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  decrementQty,
  incrementQty,
  removeFromCart,
} from '../redux/slices/cartSlice';

function CheckoutPage() {
  const cartItems = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const totalAmount = cartItems
    .reduce((acc, currentItem) => {
      return acc + currentItem.price * currentItem.qty;
    }, 0)
    .toFixed(2);

  function handleItemDelete(cartId) {
    dispatch(removeFromCart(cartId));
    toast.success('Delete successfully!');
  }
  function handleIncrementQty(cartId) {
    dispatch(incrementQty(cartId));
    toast.success('increased successfully!');
  }
  function handleDecrementQty(cartId) {
    dispatch(decrementQty(cartId));
    toast.success('decreased successfully!');
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between">
          {/* Left side - Cart Items */}

          <div className="w-2/3 pr-8">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            <ul>
              {cartItems.length > 0 ? (
                cartItems.map(item => (
                  <li key={item.id} className="">
                    <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-md shadow-md">
                      <Image
                        src={item.images}
                        alt={item.title}
                        height={500}
                        width={500}
                        className="w-16 h-16 object-cover rounded-md"
                        loading='lazy'
                      />
                      <div className=" w-[50%] mx-2 text-center">
                        <p>{item.title}</p>
                      </div>
                      <span className="text-gray-600">₹{item.price}</span>
                      <div className="    ">
                        <div className=" text-center items-center  w-full  ">
                          <button
                            className="text-gray-600 hover:text-blue-600 mr-2 focus:outline-none cursor-pointer text-[25px] font-semibold  hover:text-blue-500"
                            onClick={() => {
                              handleDecrementQty(item.id);
                            }}
                          >
                            -
                          </button>
                          <span className="text-gray-600">Qty: {item.qty}</span>
                          <button
                            className="text-gray-600 hover:text-blue-600 mr-2 focus:outline-none cursor-pointer text-[25px] font-semibold  hover:text-blue-500 ml-2"
                            onClick={() => {
                              handleIncrementQty(item.id);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <Image
                        src="/delete.svg"
                        width={500}
                        height={500}
                        alt="delete button"
                        onClick={() => {
                          handleItemDelete(item.id);
                        }}
                        className="w-[25px] h-[25px]  cursor-pointer"
                        loading='lazy'
                      />
                    </div>
                  </li>
                ))
              ) : (
                <p>No Cart Items</p>
              )}
            </ul>
            <div className="border-t mt-6 pt-4">
              <span className="font-bold text-xl">Total:</span>
              <span className="ml-2 text-xl">₹{totalAmount}</span>
            </div>
          </div>

          {/* Right side - Checkout Form */}
          <div className="w-1/3 bg-white p-8 shadow-md rounded-md">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  className="mt-1 p-2 w-full border rounded-md"
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="card"
                  className="block text-sm font-medium text-gray-700"
                >
                  Credit Card
                </label>
                <input
                  type="text"
                  id="card"
                  name="card"
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
