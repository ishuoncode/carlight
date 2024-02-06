import Image from 'next/image';
import React from 'react';
import ShopCard from './shopCard';


export default function index() {
  const carproducts = [
    {
      id:1,
      images: '/images/autocare/shop_06-550x550.jpg',
      heading: 'Tire with brake unit',
      description:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem ...',
      price: '5000',
      title:"car1"
    },
    {
      id:2,
      images: '/images/autocare/shop_09-550x550.jpg',
      heading: 'Reusable Filter For Conditioner',
      description:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem ...',
      price: '5000',
      title:"car2"
    },
    {
      id:3,
      images: '/images/autocare/shop_06-550x550.jpg',
      heading: 'Tire with brake unit',
      description:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem ...',
      price: '5000',
      title:"car3"
    },
    {
      id:4,
      images: '/images/autocare/shop_06-550x550.jpg',
      heading: 'Tire with brake unit',
      description:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem ...',
      price: '5000',
      title:"car4"
    },
  ];

 

  return (
    <div>
      <div className=" px-[2rem]">
        <Image
          height={500}
          width={500}
          src="/images/inner_HEADER.jpg" // Replace with the actual path to your image
          alt="Car Wash"
          loading="lazy"
          className="w-full h-[350px] rounded-xl "
        />

        <div className="bg-[#F2F2F2] h-[64px] mt-[50px] w-full rounded-[8px] bg-clip-borde flex justify-between px-[1rem] p-[20px] ">
          <p className="text-sm ">Our Products</p>
          <div className="flex ">
            <p className="">Sort by:</p>
            <form action="" className="pl-[10px] ">
              <select
                name="sortingOptions"
                className="rounded-xl px-[5px] py-[2px]"
              >
                <option value="default">Default sorting</option>
                <option value="popularity">Sort by popularity</option>
                <option value="averageRating">Sort by average rating</option>
                <option value="latest">Sort by latest</option>
                <option value="highToLow">Sort by high to low</option>
                <option value="lowToHigh">Sort by low to high</option>
              </select>
            </form>
          </div>
        </div>
      </div>
      <div className="flex mt-[50px] px-[2rem] ">
        <div className="w-[30%] px-[2rem] flex-col  bg-[#f2f2f2]">
          <div className="flex">
            <input
              type="search"
              placeholder="Search..."
              className="mt-[2rem] rounded-xl pl-[5px] h-[2.5rem] w-full"
            />
            <Image
              src="/search.svg"
              height={500}
              width={500}
              alt="searcg svg"
              className="h-[2.5rem] w-[30px] mt-[2rem]  rounded-full"
            />
          </div>
          <p className="mb-[10px] text-center mt-[2rem]  font-bold  text-xl uppercase">
            categories
          </p>
          <hr className="mb-[1rem]" />
          <ul className="leading-loose mb-[10px]">
            <li>
              <span className="text-[#209FDC] font">&rsaquo;</span> Autocare
            </li>
            <li>
              <span className="text-[#209FDC]">&rsaquo;</span> Automatic washing
            </li>
            <li>
              <span className="text-[#209FDC]">&rsaquo;</span> Car repairing
            </li>
            <li>
              <span className="text-[#209FDC]">&rsaquo;</span> Car washing
            </li>
            <li>
              <span className="text-[#209FDC]">&rsaquo;</span> Contactless
            </li>
          </ul>
        </div>

        <div className="grid mxs:grid-cols-2 md:grid-cols-3 gap-4 px-[2rem] bg-[#FFFFFF] py-[1rem]">
          {carproducts.map((item, i) => (
          <ShopCard item={item} key={i}/>
          ))}
        </div>
      </div>
    </div>
  );
}
