import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/project/$id/changelog')({
  component: ProjectChangeLogPage,
})

function ProjectChangeLogPage() {
  const { id } = Route.useParams()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            to="/project/$id"
            params={{ id }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Project
          </Link>
          <h1 className="text-2xl font-bold">Change Log</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>Change Log for Project ID: <strong>{id}</strong></p>
          <p className="mt-2">ProjectChangeLog page placeholder — Phase 3 will port the full component</p>
        </div>
      </main>
    </div>
  )
}
