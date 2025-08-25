import * as React from 'react';

export function Alert({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="alert" className={`rounded-md border p-4 ${className}`} {...props} />;
}

export function AlertTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props} />;
}

export function AlertDescription({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`text-sm text-muted-foreground ${className}`} {...props} />;
}
