import Image from 'next/image'

// public/logo.png is 1787×767 with a transparent background.
const LOGO_RATIO = 1787 / 767

/**
 * The HMWorkshop logo. The file itself is never edited: the light theme shows
 * it as is, the dark theme paints the same shape in the brand brown
 * (`--primary`) by using the PNG as a mask.
 */
export function BrandLogo({ className = 'h-10' }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} style={{ aspectRatio: LOGO_RATIO }}>
      <Image
        src='/logo.png'
        alt='HMWorkshop'
        width={240}
        height={103}
        className='h-full w-auto dark:invisible'
      />
      <span
        aria-hidden='true'
        className='absolute inset-0 hidden dark:block bg-primary'
        style={{
          maskImage: 'url(/logo.png)',
          WebkitMaskImage: 'url(/logo.png)',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat'
        }}
      />
    </span>
  )
}
