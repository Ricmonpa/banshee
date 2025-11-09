import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: { width: 120, height: 40 },
  md: { width: 180, height: 60 },
  lg: { width: 240, height: 80 },
  xl: { width: 320, height: 100 }
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const dimensions = sizeMap[size]
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/banshee-logo.svg"
        alt="BANSHEE"
        width={dimensions.width}
        height={dimensions.height}
        priority
      />
    </div>
  )
}
