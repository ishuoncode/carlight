import Image from 'next/image';
import React from 'react';

export default function Star({ star, reviews }) {
  const fullStars = Math.floor(star); // Number of full stars
  const hasHalfStar = star - fullStars === 0.5; // Check if there's a half star

  const ratingStars = Array.from({ length: 5 }, (elem, index) => {
    if (index < fullStars) {
      return (
        <span key={index} style={{ display: 'inline-block' }}>
          <Image width={25} height={25} alt="full color" src="/star.svg" className='inline-block' loading='lazy'/>
        </span>
      );
    } else if (hasHalfStar && index === fullStars) {
      return (
        <span key={index} style={{ display: 'inline-block' }}>
          <Image width={25} height={25} alt="half color" src="/star1.svg" className='inline-block' loading='lazy'/>
        </span>
      );
    } else {
      return (
        <span key={index} style={{ display: 'inline-block' }}>
          <Image width={25} height={25} alt="empty color" src="/star2.svg" className='inline-block' loading='lazy'/>
        </span>
      );
    }
  });

  return <div className="text-center">{ratingStars}</div>;
}
