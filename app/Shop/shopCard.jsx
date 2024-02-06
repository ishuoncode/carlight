'use client';
import Image from 'next/image';
import React from 'react';
import Star from './Star';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ShopCard({ item }) {
    const dispatch = useDispatch()

  const stars = 3.5;
  const review = 50;

  function handleAddItemToCart(){
    dispatch(addToCart(item))
    toast.success('Added successfully!')
  }


  return (
    <div className="text-center transition-transform transform hover:scale-105 shadow-lg px-[5px] pb-[1rem] bg-[#FFFFFF] rounded-lg ">
      <Image
        src={`${item.images}`}
        height={500}
        width={500}
        alt="autocare"
        loading="lazy"
      />
      <Star star={stars} reviews={review} />
      <p className="text-center font-bold text-xl mb-[5px]">{item.heading}</p>
      <p className="font-normal text-lg pb-[1rem]">{item.description}</p>
      <p className="font-semibold text-lg pb-[1rem]">₹ {item.price}</p>
      <button
        onClick={() => handleAddItemToCart()}
        className="uppercase border-2 rounded-3xl px-5 py-2 text-[#209FDC] border-[#209FDC] mt-5 hover:text-white hover:bg-[#209FDC] "
      >
        Add to cart
      </button>
    </div>
  );
}
