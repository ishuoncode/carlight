"use client"
import React from 'react'
import { useSelector } from 'react-redux'

export default function CartCount() {
    const cartItems = useSelector((store)=>store.cart)
  return (
    <span className='relative bottom-[12px] right-[14px] bg-red-300 rounded-full w-[18px] h-[18px] text-[12px]'>{cartItems.length}</span>
  )
}
