type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
