import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/dropdowns')({
  component: ManageDropdownsPage,
})

function ManageDropdownsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            ← Back to Projects
          </Link>
          <h1 className="text-2xl font-bold">Manage Dropdowns</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          ManageDropdowns page placeholder — Phase 3 will port the full component
        </div>
      </main>
    </div>
  )
}
