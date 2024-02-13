'use client';
import React, { useEffect, useState } from 'react';
import { VscDashboard, VscSignOut } from 'react-icons/vsc';
import { AiOutlineCaretDown, AiOutlineCaretUp } from 'react-icons/ai';
import Link from 'next/link';
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';
import Image from 'next/image';

export default function Menuweb() {
  const { data: session } = useSession();
  const [providers, setProviders] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  return (
    <>
      {session?.user ? (
        <div
          className="relative mr-[2px] lg:block hidden"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-x-1">
            <Image
              src={session?.user.image}
              width={30}
              height={30}
              className="rounded-full"
              alt="profile"
            />

            {open ? (
              <AiOutlineCaretUp className="text-sm text-richblack-100" />
            ) : (
              <AiOutlineCaretDown className="text-sm text-richblack-100" />
            )}
          </div>
          {open && (
            <div className="absolute top-[118%] right-0 z-[1000] divide-y-[1px] divide-richblack-700 overflow-hidden rounded-md border-[1px] bg-[#cccccc] cursor-pointer lg:block hidden">
              <Link href="/dashboard">
                {' '}
                {/* Use 'href' instead of 'to' */}
           
                <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px]  hover:text-richblack-25">
                  <VscDashboard className="text-lg" />
                  
                  Dashboard
                </div>

              </Link>
              <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
                <VscSignOut className="text-lg"  />
                <button type="button" onClick={signOut}>
                  {' '}
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {providers &&
            Object.values(providers).map(provider => (
              <button
                type="button"
                key={provider.name}
                onClick={() => signIn(provider.id)}
                className="mr-5 cursor-pointer border-2 px-5 py-1 hover:bg-[#cccccc] duration-300 lg:block hidden"
              >
                Login
              </button>
            ))}
        </>
      )}
    </>
  );
}
