import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/project/$id')({
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { id } = Route.useParams()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Project Detail</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>Project ID: <strong>{id}</strong></p>
          <p className="mt-2">ProjectDetail page placeholder — Phase 3 will port the full component</p>
          <Link
            to="/project/$id/changelog"
            params={{ id }}
            className="mt-4 inline-block text-primary hover:underline"
          >
            View Change Log →
          </Link>
        </div>
      </main>
    </div>
  )
}
