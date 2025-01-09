interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export const Label = ({ children, className }: LabelProps) => {
  const classes = className ? `font-medium text-sm mb-1 ${className}` : 'font-medium text-sm mb-1';

  return <div className={classes}>{children}</div>;
}
