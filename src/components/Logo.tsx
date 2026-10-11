interface LogoProps {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 36, showText = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="rounded-lg flex items-center justify-center shrink-0"
        style={{ width: size, height: size, backgroundColor: '#D6E6F3' }}
      >
        <img
          src="/logo-icon.png"
          alt="OdiPrep logo"
          className="object-contain"
          style={{ width: size * 0.82, height: size * 0.82 }}
        />
      </span>
      {showText && (
        <span className="font-bold text-lg text-gray-900">
          Odi<span className="text-blue-600">Prep</span>
        </span>
      )}
    </span>
  )
}