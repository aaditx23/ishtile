import { Button } from "@/components/ui/button";

interface UpdateDateButtonProps {
  onUpdateDate: (date: { day?: number; month: number; year: number }) => void;
  includeDay?: boolean;
  className?: string;
}

export function UpdateDateButton({
  onUpdateDate,
  includeDay = true,
  className,
}: UpdateDateButtonProps) {
  const handleClick = () => {
    const today = new Date();
    onUpdateDate({
      ...(includeDay && { day: today.getDate() }),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className={className}
    >
      Today
    </Button>
  );
}
