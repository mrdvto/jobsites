import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { JobSite } from '@/types';

type SortColumn = 'name' | 'address' | 'salesRep' | 'contact' | 'status' | 'revenue';
type SortDirection = 'asc' | 'desc' | null;

export const JobSiteTable = () => {
  const navigate = useNavigate();
  const { getFilteredSites, getSalesRepName, calculateSiteRevenue } = useData();
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredSites = getFilteredSites();

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedSites = [...filteredSites].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    let comparison = 0;

    switch (sortColumn) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'address':
        comparison = `${a.address.city}, ${a.address.state}`.localeCompare(
          `${b.address.city}, ${b.address.state}`
        );
        break;
      case 'salesRep':
        comparison = getSalesRepName(a.salesRepId).localeCompare(getSalesRepName(b.salesRepId));
        break;
      case 'contact':
        comparison = a.projectPrimaryContact.name.localeCompare(b.projectPrimaryContact.name);
        break;
      case 'status':
        comparison = a.statusId.localeCompare(b.statusId);
        break;
      case 'revenue':
        comparison = calculateSiteRevenue(a) - calculateSiteRevenue(b);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Site Name
                <SortIcon column="name" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('address')}
            >
              <div className="flex items-center">
                Address
                <SortIcon column="address" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('salesRep')}
            >
              <div className="flex items-center">
                Sales Rep
                <SortIcon column="salesRep" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('contact')}
            >
              <div className="flex items-center">
                Primary Contact
                <SortIcon column="contact" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Status
                <SortIcon column="status" />
              </div>
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer select-none group hover:bg-muted/50"
              onClick={() => handleSort('revenue')}
            >
              <div className="flex items-center justify-end">
                Revenue
                <SortIcon column="revenue" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No job sites found matching the current filters.
              </TableCell>
            </TableRow>
          ) : (
            sortedSites.map(site => (
              <TableRow 
                key={site.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/site/${site.id}`)}
              >
                <TableCell className="font-medium">{site.name}</TableCell>
                <TableCell>{site.address.city}, {site.address.state}</TableCell>
                <TableCell>{getSalesRepName(site.salesRepId)}</TableCell>
                <TableCell>{site.projectPrimaryContact.name}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.statusId === 'Active' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : site.statusId === 'Planning'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {site.statusId}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${calculateSiteRevenue(site).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
