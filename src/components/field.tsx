export function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">
        {label}
        {value && <span className="font-normal text-muted-foreground"> — {value}</span>}
      </p>
      {children}
    </div>
  );
}
