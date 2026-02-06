import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AssociateOpportunityModalProps {
  siteId: number;
  currentOpportunityIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssociateOpportunityModal = ({ 
  siteId, 
  currentOpportunityIds, 
  open, 
  onOpenChange 
}: AssociateOpportunityModalProps) => {
  const { opportunities, getStageName, addOpportunityToSite } = useData();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const availableOpportunities = opportunities.filter(
    opp => !currentOpportunityIds.includes(opp.id)
  );

  const handleAssociate = () => {
    if (selectedId) {
      addOpportunityToSite(siteId, selectedId);
      setSelectedId(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Associate Existing Opportunity</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {availableOpportunities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No available opportunities to associate.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableOpportunities.map(opp => (
                  <TableRow 
                    key={opp.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedId(opp.id)}
                  >
                    <TableCell>
                      <input 
                        type="radio" 
                        checked={selectedId === opp.id}
                        onChange={() => setSelectedId(opp.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{opp.id}</TableCell>
                    <TableCell>{opp.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{opp.divisionId}</Badge>
                    </TableCell>
                    <TableCell>{opp.customerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getStageName(opp.stageId)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${opp.estimateRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssociate} disabled={!selectedId}>
            Associate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
