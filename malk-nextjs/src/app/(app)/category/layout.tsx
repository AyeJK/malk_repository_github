// Dynamic metadata for category pages is handled in '[slug]/page-metadata.ts'.

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
}
