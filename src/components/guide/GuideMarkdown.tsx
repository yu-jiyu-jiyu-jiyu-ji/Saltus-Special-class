import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type GuideMarkdownProps = {
  content: string;
};

export function GuideMarkdown({ content }: GuideMarkdownProps) {
  let h2Index = 0;

  return (
    <div className="guide-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 text-2xl font-bold text-slate-900">{children}</h1>
          ),
          h2: ({ children }) => {
            h2Index += 1;
            const id = `section-${h2Index}`;
            return (
              <h2
                id={id}
                className="mb-3 mt-10 scroll-mt-28 border-b border-slate-100 pb-2 text-xl font-bold text-slate-900 first:mt-0"
              >
                {h2Index}. {children}
              </h2>
            );
          },
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-semibold text-slate-900">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-7 text-slate-700 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-6 text-slate-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-6 text-slate-700">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-700">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <figure className="my-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src ?? ""}
                alt={alt ?? "説明画像"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 shadow-sm"
              />
              {alt ? (
                <figcaption className="mt-2 text-center text-xs text-slate-500">
                  {alt}
                </figcaption>
              ) : null}
            </figure>
          ),
          a: ({ href, children }) => {
            const isInternal = href?.startsWith("#");
            return (
              <a
                href={href}
                className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800"
                {...(isInternal ? {} : { target: "_blank", rel: "noreferrer" })}
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="my-8 border-slate-200" />,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 text-left text-slate-600">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-200 px-4 py-2 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-2 text-slate-700">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
