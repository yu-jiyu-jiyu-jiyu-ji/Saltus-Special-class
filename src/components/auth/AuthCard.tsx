import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Saltus 特進
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
      {footer ? <div className="mt-6 border-t border-slate-100 pt-6">{footer}</div> : null}
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-sky-700 hover:text-sky-800">
      {children}
    </Link>
  );
}

export function AuthNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      {children}
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {message}
    </div>
  );
}

export function AuthField({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export const authInputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export const authButtonClassName =
  "inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";
