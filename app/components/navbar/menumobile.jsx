"use client";
import React, { useState } from "react";
import { IoMenuSharp ,IoClose  } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function MenuMobile() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      <IoMenuSharp className="cursor-pointer w-10 h-7" onClick={toggleMenu} />

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full shadow bg-[#f8f8f8] flex-col z-10 "
          >
            <div className="flex items-center justify-center mt-8">
              <Image
                src="/images/profile.jpg"
                width={1000}
                height={1000}
                loading="lazy"
                alt="logo"
                className="rounded-full h-[25%] w-[25%] object-cover "
              />
            <IoClose className="absolute top-5 right-4 cursor-pointer h-6 w-6 " onClick={()=>setShowMenu(!showMenu)}   />
            </div>
            <div className=" grid grid-rows-7 gap-3 mt-[20%] px-5 py-2">
              <p className="">Profile</p><hr />
              <p className="">Home</p> <hr />
              <p className="">Booking</p> <hr />
              <p className="">Service</p> <hr />
              <p className="">Shop</p> <hr />
              <p className="">Contact</p> <hr />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
