import type { SVGProps } from 'react'

/** 3D printer outline icon (frame, print head and a part on the bed), drawn in the lucide style. */
export function Printer3dIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M4 21V3h16v18' />
      <path d='M2 21h20' />
      <path d='M4 8h16' />
      <rect x='9.5' y='6.5' width='5' height='4' rx='0.5' />
      <path d='M11 10.5 12 12l1-1.5' />
      <path d='M7 18h10' />
      <rect x='10' y='14.5' width='4' height='3.5' />
    </svg>
  )
}
