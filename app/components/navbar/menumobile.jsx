'use client';
import React, { useState, useEffect } from 'react';
import { IoMenuSharp, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, useSession, getProviders ,signOut} from 'next-auth/react';

export default function MenuMobile() {
  const { data: session } = useSession();
  const [providers, setProviders] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    // Toggle body scrolling
    document.body.classList.toggle('overflow-hidden');
  };

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  return (
    <>
      {session?.user ? (
        <div className="mr-5">
          <IoMenuSharp
            className="cursor-pointer w-10 h-7"
            onClick={toggleMenu}
          />
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed top-0 left-0 w-full h-full bg-gray-200 flex flex-col z-10 overflow-y-auto"
              >
                <div className="flex items-center justify-center mt-8">
                  <Image
                    src={session?.user.image}
                    width={200}
                    height={200}
                    className="rounded-full"
                    alt="profile"
                  />
                  <IoClose
                    className="absolute top-5 right-4 cursor-pointer h-6 w-6"
                    onClick={toggleMenu}
                  />
                </div>
                <div className="grid grid-rows-7 gap-3 mt-[20%] px-5 py-2">
                  <p>
                    <Link href="/profile" onClick={toggleMenu}>
                      Profile
                    </Link>
                  </p>
                  <hr />
                  <p className="">
                    <Link href="/#home" onClick={() => setShowMenu(!showMenu)}>
                      Home
                    </Link>
                  </p>{' '}
                  <hr />
                  <p className="">
                    <Link
                      href="/#booking"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      Booking
                    </Link>
                  </p>{' '}
                  <hr />
                  <p className="">
                    <Link
                      href="/#services"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      Service
                    </Link>
                  </p>{' '}
                  <hr />
                  <p className="">
                    <Link href="#" onClick={() => setShowMenu(!showMenu)}>
                      Shop
                    </Link>
                  </p>{' '}
                  <hr />
                  <p className="">
                    <Link
                      href="/#contact"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      {' '}
                      Contact
                    </Link>
                  </p>{' '}
                  <hr />
                  <p className="">
                    {/* <Link
                      href="#"
                      onClick={() => setShowMenu(!showMenu)}
                    > */}
                      {' '}
                      <button type="button" onClick={()=>{
                        setShowMenu(!showMenu)
                        signOut()}}>
                      Logout
                      </button> 
                    {/* </Link> */}
                  </p>{' '}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {providers &&
            Object.values(providers).map(provider => (
              <button
                type="button"
                key={provider.name}
                onClick={() => signIn(provider.id)}
                className="mr-5 cursor-pointer border-2 px-5 py-1 hover:bg-gray-300 duration-300"
              >
                Login
              </button>
            ))}
        </>
      )}
    </>
  );
}
