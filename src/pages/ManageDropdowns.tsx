import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type DropdownType = 'projectStatus' | 'subcontractorRole';

interface DropdownOption {
  id: string;
  label: string;
  description?: string;
}

// Initial dropdown data
const initialDropdowns: Record<DropdownType, DropdownOption[]> = {
  projectStatus: [
    { id: 'Active', label: 'Active', description: 'Currently in progress' },
    { id: 'Planning', label: 'Planning', description: 'In planning phase' },
    { id: 'Completed', label: 'Completed', description: 'Project finished' },
    { id: 'On Hold', label: 'On Hold', description: 'Temporarily paused' },
  ],
  subcontractorRole: [
    { id: 'GC', label: 'GC', description: 'General Contractor' },
    { id: 'SUB-EXC', label: 'SUB-EXC', description: 'Subcontractor - Excavation' },
    { id: 'SUB-PAV', label: 'SUB-PAV', description: 'Subcontractor - Paving' },
    { id: 'SUB-ELEC', label: 'SUB-ELEC', description: 'Subcontractor - Electrical' },
    { id: 'SUB-MECH', label: 'SUB-MECH', description: 'Subcontractor - Mechanical' },
    { id: 'SUB-SPEC', label: 'SUB-SPEC', description: 'Subcontractor - Specialized' },
    { id: 'SUB-STEEL', label: 'SUB-STEEL', description: 'Subcontractor - Steel' },
  ],
};

const ManageDropdowns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedDropdown, setSelectedDropdown] = useState<DropdownType | null>(null);
  const [dropdowns, setDropdowns] = useState<Record<DropdownType, DropdownOption[]>>(initialDropdowns);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<DropdownOption[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: DropdownOption | null }>({
    open: false,
    item: null,
  });
  const [newItem, setNewItem] = useState<{ id: string; label: string; description: string }>({
    id: '',
    label: '',
    description: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const dropdownOptions: { key: DropdownType; label: string }[] = [
    { key: 'projectStatus', label: 'Project Status' },
    { key: 'subcontractorRole', label: 'Subcontractor Role' },
  ];

  const handleSelectDropdown = (key: DropdownType) => {
    setSelectedDropdown(key);
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleStartEdit = () => {
    if (selectedDropdown) {
      setEditedValues([...dropdowns[selectedDropdown]]);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedValues([]);
  };

  const handleSaveEdit = () => {
    if (selectedDropdown) {
      setDropdowns(prev => ({
        ...prev,
        [selectedDropdown]: editedValues,
      }));
      setIsEditing(false);
      toast({
        title: 'Changes saved',
        description: 'Dropdown values have been updated.',
      });
    }
  };

  const handleEditValue = (index: number, field: keyof DropdownOption, value: string) => {
    setEditedValues(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteClick = (item: DropdownOption) => {
    setDeleteConfirm({ open: true, item });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.item && selectedDropdown) {
      if (isEditing) {
        setEditedValues(prev => prev.filter(v => v.id !== deleteConfirm.item!.id));
      } else {
        setDropdowns(prev => ({
          ...prev,
          [selectedDropdown]: prev[selectedDropdown].filter(v => v.id !== deleteConfirm.item!.id),
        }));
      }
      toast({
        title: 'Item deleted',
        description: `"${deleteConfirm.item.label}" has been removed.`,
      });
    }
    setDeleteConfirm({ open: false, item: null });
  };

  const handleAddItem = () => {
    if (!newItem.id || !newItem.label) {
      toast({
        title: 'Missing fields',
        description: 'ID and Label are required.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedDropdown) {
      const currentValues = isEditing ? editedValues : dropdowns[selectedDropdown];
      if (currentValues.some(v => v.id === newItem.id)) {
        toast({
          title: 'Duplicate ID',
          description: 'An item with this ID already exists.',
          variant: 'destructive',
        });
        return;
      }

      const newOption: DropdownOption = {
        id: newItem.id,
        label: newItem.label,
        description: newItem.description || undefined,
      };

      if (isEditing) {
        setEditedValues(prev => [...prev, newOption]);
      } else {
        setDropdowns(prev => ({
          ...prev,
          [selectedDropdown]: [...prev[selectedDropdown], newOption],
        }));
      }

      setNewItem({ id: '', label: '', description: '' });
      setShowAddForm(false);
      toast({
        title: 'Item added',
        description: `"${newItem.label}" has been added.`,
      });
    }
  };

  const currentValues = selectedDropdown
    ? isEditing
      ? editedValues
      : dropdowns[selectedDropdown]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Manage Dropdowns</h1>
              <p className="text-sm text-muted-foreground">Configure dropdown values used in the application</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Dropdown Selection */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Dropdowns</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {dropdownOptions.map(option => (
                  <Button
                    key={option.key}
                    variant={selectedDropdown === option.key ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleSelectDropdown(option.key)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <Card className="md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {selectedDropdown
                  ? dropdownOptions.find(o => o.key === selectedDropdown)?.label + ' Values'
                  : 'Select a Dropdown'}
              </CardTitle>
              {selectedDropdown && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleStartEdit}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedDropdown ? (
                <>
                  {showAddForm && !isEditing && (
                    <div className="mb-4 p-4 border rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Add New Item</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="ID"
                          value={newItem.id}
                          onChange={e => setNewItem(prev => ({ ...prev, id: e.target.value }))}
                        />
                        <Input
                          placeholder="Label"
                          value={newItem.label}
                          onChange={e => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={newItem.description}
                          onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={handleAddItem}>
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAddForm(false);
                            setNewItem({ id: '', label: '', description: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentValues.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedValues[index]?.id || ''}
                                onChange={e => handleEditValue(index, 'id', e.target.value)}
                                className="h-8"
                              />
                            ) : (
                              item.id
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedValues[index]?.label || ''}
                                onChange={e => handleEditValue(index, 'label', e.target.value)}
                                className="h-8"
                              />
                            ) : (
                              item.label
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedValues[index]?.description || ''}
                                onChange={e => handleEditValue(index, 'description', e.target.value)}
                                className="h-8"
                              />
                            ) : (
                              item.description || '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {currentValues.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No values configured
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {isEditing && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Add New Item</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="ID"
                          value={newItem.id}
                          onChange={e => setNewItem(prev => ({ ...prev, id: e.target.value }))}
                        />
                        <Input
                          placeholder="Label"
                          value={newItem.label}
                          onChange={e => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={newItem.description}
                          onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={handleAddItem}>
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a dropdown from the list to view and edit its values
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={open => setDeleteConfirm({ open, item: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm.item?.label}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageDropdowns;
