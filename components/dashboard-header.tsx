interface DashboardHeaderProps {
  heading: string
  description?: string
}

export function DashboardHeader({ heading, description }: DashboardHeaderProps) {
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

