import React from "react";

export default function menuItems({ items }) {
  return (
    <>
      {items.map((element,i) => (
        <p key={i} className="hover:scale-125 duration-300 cursor-pointer text-center hidden lg:block ">{element}</p>
      ))}
    </>
  );
}
