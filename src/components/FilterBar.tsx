import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

export const FilterBar = () => {
  const { filters, setFilters, salesReps, jobSites } = useData();

  // Sort sales reps alphabetically by lastname
  const sortedSalesReps = [...salesReps].sort((a, b) => 
    a.lastname.localeCompare(b.lastname)
  );

  // Get unique statuses from job sites
  const uniqueStatuses = Array.from(new Set(jobSites.map(site => site.statusId))).sort();

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salesRep">Sales Rep</Label>
          <Select 
            value={filters.salesRepId || "all"} 
            onValueChange={(value) => setFilters({ ...filters, salesRepId: value === "all" ? "" : value })}
          >
            <SelectTrigger id="salesRep">
              <SelectValue placeholder="All Sales Reps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sales Reps</SelectItem>
              {sortedSalesReps.map(rep => (
                <SelectItem key={rep.salesrepid} value={rep.salesrepid.toString()}>
                  {rep.lastname}, {rep.firstname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="division">Division</Label>
          <Select 
            value={filters.division || "all"} 
            onValueChange={(value) => setFilters({ ...filters, division: value === "all" ? "" : value })}
          >
            <SelectTrigger id="division">
              <SelectValue placeholder="All Divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              <SelectItem value="E">E</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gc">General Contractor</Label>
          <Input
            id="gc"
            placeholder="Search GC name..."
            value={filters.generalContractor}
            onChange={(e) => setFilters({ ...filters, generalContractor: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="opacity-0">PAR</Label>
          <div className="flex items-center space-x-2 h-10">
            <Checkbox 
              id="parStatus"
              checked={filters.showBehindPAR}
              onCheckedChange={(checked) => 
                setFilters({ ...filters, showBehindPAR: checked as boolean })
              }
            />
            <Label 
              htmlFor="parStatus" 
              className="text-sm font-normal cursor-pointer"
            >
              Show 'Behind on PAR' only
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
};
