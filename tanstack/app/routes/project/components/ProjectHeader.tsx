import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, History } from 'lucide-react';
import { useStatusColors, STATUS_COLORS } from '@/hooks/useStatusColors';
import type { Project } from '@/types';

interface ProjectHeaderProps {
  project: Project;
  onStatusChange: (status: string) => void;
}

export function ProjectHeader({ project, onStatusChange }: ProjectHeaderProps) {
  const navigate = useNavigate();
  const { statusColors, getStatusColorClasses } = useStatusColors();
  const statusOptions = Object.keys(statusColors);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Select value={project.statusId} onValueChange={onStatusChange}>
            <SelectTrigger
              className={`w-auto h-7 text-xs font-medium rounded-full border-0 ${getStatusColorClasses(project.statusId)}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => {
                const colorId = statusColors[status];
                const colorConfig = STATUS_COLORS.find((c) => c.id === colorId);
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colorConfig?.bg || 'bg-muted'}`} />
                      {status}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">ID: {project.id}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({ to: '/project-changelog/$id', params: { id: String(project.id) } })
            }
            className="ml-2"
          >
            <History className="h-4 w-4 mr-1" />
            Change Log
          </Button>
        </div>
      </div>
    </header>
  );
}
