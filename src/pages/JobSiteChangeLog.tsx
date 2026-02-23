import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ArrowLeft, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ChangeLogEntry } from '@/types';

const CATEGORIES = ['All', 'Site', 'Opportunity', 'Company', 'Activity', 'Note', 'Equipment'] as const;

const categoryColors: Record<string, string> = {
  Site: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Opportunity: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Company: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Activity: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Note: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  Equipment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const ExpandableRow = ({ entry, changedByName }: { entry: ChangeLogEntry; changedByName: string }) => {
  const [open, setOpen] = useState(false);
  const hasDetails = entry.details && Object.keys(entry.details).length > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <TableRow className={hasDetails ? 'cursor-pointer' : ''}>
        <TableCell className="whitespace-nowrap">
          {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
        </TableCell>
        <TableCell>{changedByName}</TableCell>
        <TableCell>
          <Badge variant="outline" className={categoryColors[entry.category] || ''}>
            {entry.category}
          </Badge>
        </TableCell>
        <TableCell className="flex items-center gap-1">
          {hasDetails && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
          )}
          {entry.summary}
        </TableCell>
      </TableRow>
      {hasDetails && (
        <CollapsibleContent asChild>
          <tr>
            <td colSpan={4} className="px-4 pb-3 pt-0">
              <div className="ml-8 p-3 rounded-md bg-muted text-sm">
                <pre className="whitespace-pre-wrap font-mono text-xs">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              </div>
            </td>
          </tr>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

const JobSiteChangeLog = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobSites, getChangeLog, getSalesRepName } = useData();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const siteId = parseInt(id || '0');
  const site = jobSites.find(s => s.id === siteId);
  const entries = getChangeLog(siteId);

  const filtered = activeCategory === 'All'
    ? entries
    : entries.filter(e => e.category === activeCategory);

  // Sort newest first
  const sorted = [...filtered].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (!site) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job Site Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to List</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate(`/site/${siteId}`)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
          <h1 className="text-3xl font-bold">{site.name}</h1>
          <p className="text-muted-foreground mt-1">Change Log</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="p-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-40" />
              <p className="text-lg font-medium">No changes recorded yet</p>
              <p className="text-sm">Changes to this job site and its associated records will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date/Time</TableHead>
                  <TableHead className="w-[160px]">Changed By</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map(entry => (
                  <ExpandableRow
                    key={entry.id}
                    entry={entry}
                    changedByName={getSalesRepName(entry.changedById)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
};

export default JobSiteChangeLog;
