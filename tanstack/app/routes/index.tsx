import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: ProjectListPage,
})

function ProjectListPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Project list placeholder — Phase 3 will port the full component</p>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          ProjectList + KPICard + ProjectTable will render here
        </div>
      </main>
    </div>
  )
}
