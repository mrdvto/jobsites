import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

export const JobSiteTable = () => {
  const navigate = useNavigate();
  const { getFilteredSites, getSalesRepName, calculateSiteRevenue } = useData();
  const filteredSites = getFilteredSites();

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Site Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Sales Rep</TableHead>
            <TableHead>Primary Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No job sites found matching the current filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredSites.map(site => (
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
