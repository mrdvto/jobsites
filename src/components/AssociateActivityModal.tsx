import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/types';

interface AssociateActivityModalProps {
  siteId: number;
  currentActivityIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssociateActivityModal = ({ 
  siteId, 
  currentActivityIds, 
  open, 
  onOpenChange 
}: AssociateActivityModalProps) => {
  const { jobSites, getSalesRepName, addActivity } = useData();
  const [selectedActivity, setSelectedActivity] = useState<{ activity: Activity; sourceSiteId: number } | null>(null);

  // Get all activities from other job sites that aren't already on this site
  const availableActivities: { activity: Activity; sourceSiteName: string; sourceSiteId: number }[] = [];
  
  jobSites.forEach(site => {
    if (site.id !== siteId && site.activities) {
      site.activities.forEach(activity => {
        // Check if an activity with same description isn't already on current site
        if (!currentActivityIds.includes(activity.id)) {
          availableActivities.push({
            activity,
            sourceSiteName: site.name,
            sourceSiteId: site.id
          });
        }
      });
    }
  });

  const handleAssociate = () => {
    if (selectedActivity) {
      // Copy the activity to the current site (creates a new activity with same data)
      addActivity(siteId, {
        assigneeId: selectedActivity.activity.assigneeId,
        activityType: selectedActivity.activity.activityType,
        date: selectedActivity.activity.date,
        description: selectedActivity.activity.description
      });
      setSelectedActivity(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Associate Existing Activity</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {availableActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No available activities to associate.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Source Job Site</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableActivities.map(({ activity, sourceSiteName, sourceSiteId }) => (
                  <TableRow 
                    key={`${sourceSiteId}-${activity.id}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedActivity({ activity, sourceSiteId })}
                  >
                    <TableCell>
                      <input 
                        type="radio" 
                        checked={selectedActivity?.activity.id === activity.id && selectedActivity?.sourceSiteId === sourceSiteId}
                        onChange={() => setSelectedActivity({ activity, sourceSiteId })}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={sourceSiteName}>
                      {sourceSiteName}
                    </TableCell>
                    <TableCell className="font-medium">{getSalesRepName(activity.assigneeId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.activityType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(activity.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={activity.description}>
                      {activity.description}
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
          <Button onClick={handleAssociate} disabled={!selectedActivity}>
            Associate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
