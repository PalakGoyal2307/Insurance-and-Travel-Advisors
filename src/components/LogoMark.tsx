import logoImage from '../imports/image.png'

interface Props {
  className?: string
  sizeClassName?: string
}

export default function LogoMark({ className = '', sizeClassName = 'w-16 h-16' }: Props) {
  return (
    <div className={`overflow-hidden ${sizeClassName} ${className}`.trim()}>
      <img src={logoImage} alt="PNP Advisors logo" className="h-14 w-26 object-cover" />
    </div>
  )
}
