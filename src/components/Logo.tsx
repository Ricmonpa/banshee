import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Use "dark" on void/navy backgrounds so the logo appears cream/gold */
  variant?: 'default' | 'dark'
}

const sizeMap = {
  sm: { width: 120, height: 40 },
  md: { width: 180, height: 60 },
  lg: { width: 240, height: 80 },
  xl: { width: 320, height: 100 }
}

export default function Logo({ size = 'md', className = '', variant = 'default' }: LogoProps) {
  const dimensions = sizeMap[size]
  const isDark = variant === 'dark'

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/banshee-logo.svg"
        alt="Banshee"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className={isDark ? 'opacity-90' : ''}
        style={isDark ? { filter: 'brightness(0) invert(1) sepia(0.2) saturate(3) hue-rotate(10deg)' } : undefined}
      />
    </div>
  )
}
