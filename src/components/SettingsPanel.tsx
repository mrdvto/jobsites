import { useState } from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';

export const SettingsPanel = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleManageDropdowns = () => {
    setOpen(false);
    navigate('/settings/dropdowns');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="text-sm font-medium text-muted-foreground px-2 py-1.5">
          Settings
        </div>
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={handleManageDropdowns}
        >
          Manage dropdowns
          <ChevronRight className="h-4 w-4" />
        </Button>
      </PopoverContent>
    </Popover>
  );
};
