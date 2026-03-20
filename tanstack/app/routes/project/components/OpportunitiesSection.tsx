import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { SortIcon } from '@/components/shared/SortIcon';
import { useSortable } from '@/hooks/useSortable';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { OpportunityDetailModal } from '@/components/OpportunityDetailModal';
import { AssociateOpportunityModal } from '@/components/AssociateOpportunityModal';
import { CreateOpportunityModal } from '@/components/CreateOpportunityModal';
import type { Project, Opportunity } from '@/types';

type OppSortColumn = 'type' | 'description' | 'division' | 'stage' | 'salesRep' | 'estClose' | 'revenue';

interface OpportunitiesSectionProps {
  project: Project;
  opportunities: Opportunity[];
  getSalesRepName: (id: number) => string;
  getStageName: (id: number) => string;
  getStage: (id: number) => { displayorder?: number; phaseid?: number } | undefined;
}

export function OpportunitiesSection({
  project,
  opportunities,
  getSalesRepName,
  getStageName,
  getStage,
}: OpportunitiesSectionProps) {
  const { sortColumn, sortDirection, handleSort } = useSortable<OppSortColumn>({
    defaultColumn: 'stage',
    defaultDirection: 'asc',
  });

  // Filters
  const [filterStage, setFilterStage] = useState<string[]>([]);
  const [filterDivision, setFilterDivision] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterSalesRep, setFilterSalesRep] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState<string[]>([]);
  const [showOpenOnly, setShowOpenOnly] = useState(true);

  // Modals
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAssociate, setShowAssociate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleOpportunityClick = (oppId: number) => {
    const fullOpp = opportunities.find((o) => o.id === oppId);
    if (fullOpp) {
      setSelectedOpportunity(fullOpp);
      setShowDetail(true);
    }
  };

  // Filter
  const filteredOpportunities = project.associatedOpportunities.filter((opp: any) => {
    const stage = getStage(opp.stageId);
    if (showOpenOnly && stage && (stage.phaseid === 3 || stage.phaseid === 4)) return false;
    if (filterStage.length > 0 && !filterStage.includes(String(opp.stageId))) return false;
    if (filterType.length > 0 && !filterType.includes(opp.type)) return false;
    const fullOpp = opportunities.find((o) => o.id === opp.id);
    if (filterDivision.length > 0) {
      if (!fullOpp || !filterDivision.includes(fullOpp.divisionId)) return false;
    }
    if (filterSalesRep.length > 0) {
      if (!fullOpp || !filterSalesRep.includes(getSalesRepName(fullOpp.salesRepId))) return false;
    }
    if (filterCompany.length > 0) {
      if (!fullOpp || !filterCompany.includes(fullOpp.customerName)) return false;
    }
    return true;
  });

  // Unique filter options
  const uniqueStages = [
    ...new Map(
      project.associatedOpportunities.map((o: any) => [o.stageId, getStageName(o.stageId)] as [number, string])
    ).entries(),
  ].sort((a, b) => (a[1] as string).localeCompare(b[1] as string));
  const uniqueTypes = [...new Set<string>(project.associatedOpportunities.map((o: any) => o.type as string))].sort();
  const uniqueDivisions = [
    ...new Set<string>(
      project.associatedOpportunities
        .map((o: any) => opportunities.find((f: any) => f.id === o.id)?.divisionId || '')
        .filter((d: string) => d !== '')
    ),
  ].sort();
  const uniqueSalesReps = [
    ...new Set<string>(
      project.associatedOpportunities
        .map((o: any) => {
          const full = opportunities.find((f: any) => f.id === o.id);
          return full ? getSalesRepName(full.salesRepId) : '';
        })
        .filter((r: string) => r !== '')
    ),
  ].sort();
  const uniqueCompanies = [
    ...new Set<string>(
      project.associatedOpportunities
        .map((o: any) => opportunities.find((f: any) => f.id === o.id)?.customerName || '')
        .filter((c: string) => c !== '')
    ),
  ].sort();

  // Sort
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    let cmp = 0;
    const fullA = opportunities.find((o) => o.id === a.id);
    const fullB = opportunities.find((o) => o.id === b.id);
    switch (sortColumn) {
      case 'type': cmp = (a.type || '').localeCompare(b.type || ''); break;
      case 'description': cmp = (a.description || '').localeCompare(b.description || ''); break;
      case 'division': cmp = (fullA?.divisionId || '').localeCompare(fullB?.divisionId || ''); break;
      case 'stage': cmp = (getStage(a.stageId)?.displayorder ?? 999) - (getStage(b.stageId)?.displayorder ?? 999); break;
      case 'salesRep': cmp = getSalesRepName(fullA?.salesRepId || 0).localeCompare(getSalesRepName(fullB?.salesRepId || 0)); break;
      case 'estClose': {
        const dateA = (fullA?.estimateDeliveryYear || 0) * 100 + (fullA?.estimateDeliveryMonth || 0);
        const dateB = (fullB?.estimateDeliveryYear || 0) * 100 + (fullB?.estimateDeliveryMonth || 0);
        cmp = dateA - dateB;
        break;
      }
      case 'revenue': cmp = (a.revenue || 0) - (b.revenue || 0); break;
    }
    if (cmp === 0) {
      const dateA = (fullA?.estimateDeliveryYear || 0) * 100 + (fullA?.estimateDeliveryMonth || 0);
      const dateB = (fullB?.estimateDeliveryYear || 0) * 100 + (fullB?.estimateDeliveryMonth || 0);
      cmp = dateA - dateB;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Leads & Opportunities</h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
            <Button size="sm" onClick={() => setShowAssociate(true)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Associate Existing
            </Button>
          </div>
        </div>

        {project.associatedOpportunities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No leads or opportunities associated with this project yet.
          </p>
        ) : (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              <MultiSelectFilter
                label="Stages"
                options={uniqueStages.map(([stageId, stageName]) => ({ value: String(stageId), label: stageName as string }))}
                selected={filterStage}
                onSelectionChange={setFilterStage}
                className="w-[160px]"
              />
              <MultiSelectFilter
                label="Divisions"
                options={uniqueDivisions.map((d: string) => ({ value: d, label: d }))}
                selected={filterDivision}
                onSelectionChange={setFilterDivision}
                className="w-[160px]"
              />
              <MultiSelectFilter
                label="Types"
                options={uniqueTypes.map((t: string) => ({ value: t, label: t }))}
                selected={filterType}
                onSelectionChange={setFilterType}
                className="w-[160px]"
              />
              <MultiSelectFilter
                label="Sales Reps"
                options={uniqueSalesReps.map((r: string) => ({ value: r, label: r }))}
                selected={filterSalesRep}
                onSelectionChange={setFilterSalesRep}
                className="w-[180px]"
              />
              <MultiSelectFilter
                label="Companies"
                options={uniqueCompanies.map((c: string) => ({ value: c, label: c }))}
                selected={filterCompany}
                onSelectionChange={setFilterCompany}
                className="w-[180px]"
              />
              <div className="flex items-center space-x-2 ml-auto">
                <Switch id="oppShowOpenOnly" checked={showOpenOnly} onCheckedChange={setShowOpenOnly} />
                <Label htmlFor="oppShowOpenOnly" className="text-sm font-normal cursor-pointer">
                  Show Open Only
                </Label>
              </div>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('type')}>
                      <div className="flex items-center">Type<SortIcon active={sortColumn === 'type'} direction={sortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('description')}>
                      <div className="flex items-center">Description<SortIcon active={sortColumn === 'description'} direction={sortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50 hidden lg:table-cell" onClick={() => handleSort('division')}>
                      <div className="flex items-center">Division<SortIcon active={sortColumn === 'division'} direction={sortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('stage')}>
                      <div className="flex items-center">Stage<SortIcon active={sortColumn === 'stage'} direction={sortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50 hidden lg:table-cell" onClick={() => handleSort('salesRep')}>
                      <div className="flex items-center">Sales Rep<SortIcon active={sortColumn === 'salesRep'} direction={sortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('estClose')}>
                      <div className="flex items-center">Est. Close<SortIcon active={sortColumn === 'estClose'} direction={sortDirection} /></div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('revenue')}>
                      <div className="flex items-center justify-end">Est. Revenue<SortIcon active={sortColumn === 'revenue'} direction={sortDirection} /></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOpportunities.map((opp) => {
                    const fullOpp = opportunities.find((o) => o.id === opp.id);
                    return (
                      <TableRow key={opp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpportunityClick(opp.id)}>
                        <TableCell><Badge variant="secondary">{opp.type}</Badge></TableCell>
                        <TableCell>{opp.description}</TableCell>
                        <TableCell className="hidden lg:table-cell"><Badge variant="secondary">{fullOpp?.divisionId || '-'}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{getStageName(opp.stageId)}</Badge></TableCell>
                        <TableCell className="hidden lg:table-cell">{fullOpp ? getSalesRepName(fullOpp.salesRepId) : '-'}</TableCell>
                        <TableCell>
                          {fullOpp?.estimateDeliveryMonth && fullOpp?.estimateDeliveryYear
                            ? `${MONTHS[fullOpp.estimateDeliveryMonth - 1]} ${fullOpp.estimateDeliveryYear}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${opp.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold lg:hidden">Total</TableCell>
                    <TableCell colSpan={6} className="text-right font-bold hidden lg:table-cell">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      ${sortedOpportunities.reduce((sum, o) => sum + (o.revenue || 0), 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </>
        )}
      </Card>

      <OpportunityDetailModal opportunity={selectedOpportunity} open={showDetail} onOpenChange={setShowDetail} />
      <AssociateOpportunityModal
        projectId={project.id}
        currentOpportunityIds={project.associatedOpportunities.map((o) => o.id)}
        open={showAssociate}
        onOpenChange={setShowAssociate}
      />
      <CreateOpportunityModal projectId={project.id} open={showCreate} onOpenChange={setShowCreate} />
    </>
  );
}
