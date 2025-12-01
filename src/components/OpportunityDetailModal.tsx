import { Opportunity } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, Package, AlertCircle } from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OpportunityDetailModal = ({ opportunity, open, onOpenChange }: OpportunityDetailModalProps) => {
  const { getStageName } = useData();

  if (!opportunity) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{opportunity.description}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Opportunity Number: {opportunity.id}</p>
            </div>
            {opportunity.isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Urgent
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Financials</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-2xl font-bold">
                  ${opportunity.estimateRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Probability: {opportunity.probabilityOfClosingId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Timeline</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Entered:</span> {formatDate(opportunity.enterDate)}
                </p>
                {opportunity.estimateDeliveryMonth && opportunity.estimateDeliveryYear && (
                  <p className="text-sm">
                    <span className="font-medium">Delivery:</span> {opportunity.estimateDeliveryMonth}/{opportunity.estimateDeliveryYear}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Customer Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium">{opportunity.customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stage:</span>
                <p className="font-medium">{getStageName(opportunity.stageId)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <p className="font-medium">{opportunity.contactName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{opportunity.contactPhone}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{opportunity.contactEmail}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Address:</span>
                <p className="font-medium">
                  {opportunity.customerAddress}, {opportunity.customerCity}, {opportunity.customerState} {opportunity.customerZipCode}
                </p>
              </div>
            </div>
          </div>

          {opportunity.productGroups && opportunity.productGroups.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <h4 className="font-semibold">Equipment/Products</h4>
                </div>
                <div className="space-y-3">
                  {opportunity.productGroups.map((group, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-4">
                      {group.products.map((product, prodIdx) => (
                        <div key={prodIdx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {product.makeId} {product.baseModelId} - {product.description}
                            </p>
                            {product.isPrimary && (
                              <Badge variant="outline">Primary</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <p>Qty: {product.quantity}</p>
                            <p>Age: {product.age} years</p>
                            <p>Hours: {product.hours.toLocaleString()}</p>
                          </div>
                          <p className="text-sm">
                            Duration: {product.rentDuration} months @ ${product.unitPrice.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-muted-foreground">Stock #: {product.stockNumber}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div>
              <span>Case ID:</span> {opportunity.cmCaseId}
            </div>
            <div>
              <span>Work Order:</span> {opportunity.workOrderId}
            </div>
            <div>
              <span>Division:</span> {opportunity.divisionId}
            </div>
            <div>
              <span>Classification:</span> {opportunity.classificationId}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
