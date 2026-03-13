interface NumberBallProps {
  number: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'hot' | 'cold' | 'highlight'
  animated?: boolean
  delay?: number
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-lg',
}

const VARIANT_MAP = {
  default: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-200',
  hot: 'bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-md shadow-red-200',
  cold: 'bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-md shadow-blue-200',
  highlight: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 shadow-md shadow-amber-200',
}

export default function NumberBall({
  number,
  size = 'md',
  variant = 'default',
  animated = false,
  delay = 0,
}: NumberBallProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-bold
        ${SIZE_MAP[size]}
        ${VARIANT_MAP[variant]}
        ${animated ? 'animate-ball-pop' : ''}
      `}
      style={animated ? { animationDelay: `${delay}ms` } : undefined}
    >
      {number}
    </span>
  )
}
