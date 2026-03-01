import Image, { ImageProps } from "next/image"

type RoundedImageProps = ImageProps & {
  radius?: "sm" | "md" | "lg" | "xl" | "full"
}

const radiusMap = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
}

export default function RoundedImage({
  radius = "lg",
  style,
  ...props
}: RoundedImageProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: radiusMap[radius],
        overflow: "hidden",
      }}
    >
      <Image
        {...props}
        fill
        style={{ objectFit: "cover", ...style }}
      />
    </div>
  )
}