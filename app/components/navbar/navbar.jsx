import React from "react";
import Image from "next/image";
import { SlSocialFacebook } from "react-icons/sl";
import { IoMailOutline, IoCartOutline, IoMenuSharp } from "react-icons/io5";
import MenuItems from "./menuItems";
import Menumobile from "./menumobile";

export default function Navbar() {
 
  return (
    <div className="flex bg-[#f8f8f8] shadow items-center py-2">
      <div>
        <Image
          src="/images/logo3.png"
          width={1000}
          height={1000}
          loading="lazy"
          alt="logo"
          className="mxs:h-16 mxs:w-56 mxs:ml-5 h-8 w-25 ml-3"
        />
      </div>
      <div className="grid grid-cols-5 gap-2 mx-auto w-1/3">
        {/* {!hidden && (
          <MenuItems
            items={["Home", "Booking", "Service", "Shop", "Contact"]}
          />
        )} */}
        <MenuItems items={["Home", "Booking", "Service", "Shop", "Contact"]  } link={["/#home" , "/#booking" , "/#services", "#","/#contact"]}  />
      </div>
      <div className="grid grid-cols-3 gap-5  mr-10 sm:mr-2  sm:gap-1 ">
        <SlSocialFacebook className=" w-10 h-5 cursor-pointer" />
        <IoMailOutline className=" w-10 h-5 cursor-pointer" />
        <IoCartOutline className=" w-10 h-5 cursor-pointer" />
      </div>
      <div className="mr-5 cursor-pointer border-2 px-5 py-1 hover:bg-[#cccccc] duration-300">
        Login
      </div>

      <div className="mr-5 lg:hidden ">
        <Menumobile/>
       
      </div>
    </div>
  );
}
