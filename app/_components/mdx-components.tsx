import type { MDXComponents } from "mdx/types"
import { slugify } from "@/lib/toc"
import { CodeBlock } from "./code-block"
import { ApiPlayground } from "@/components/api-playground/api-playground"

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mb-4 text-3xl font-bold tracking-tight" {...props} />
  ),
  h2: ({ children, ...props }) => (
    <h2
      id={slugify(String(children))}
      className="mt-10 mb-4 scroll-mt-6 border-b pb-2 text-2xl font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      id={slugify(String(children))}
      className="mt-8 mb-3 scroll-mt-6 text-xl font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: (props) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold tracking-tight" {...props} />
  ),
  p: (props) => <p className="leading-7 [&:not(:first-child)]:mt-4" {...props} />,
  a: (props) => (
    <a
      className="text-primary underline underline-offset-4 hover:opacity-80"
      {...props}
    />
  ),
  ul: (props) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
  ol: (props) => <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-primary/30 bg-muted/50 my-4 rounded-r-lg border-l-4 py-3 pr-4 pl-4 italic"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: (props) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b" {...props} />,
  tbody: (props) => <tbody className="divide-y" {...props} />,
  tr: (props) => <tr className="border-border even:bg-muted/40" {...props} />,
  th: (props) => (
    <th
      className="text-muted-foreground px-4 py-2 text-left font-medium"
      {...props}
    />
  ),
  td: (props) => <td className="px-4 py-2" {...props} />,
  pre: (props) => <CodeBlock {...props} />,
  code: (props: React.ComponentProps<"code"> & { "data-language"?: string }) => {
    const isBlock = !!props["data-language"]
    if (!isBlock) {
      return (
        <code
          className="bg-muted rounded px-1.5 py-0.5 text-sm font-medium"
          {...props}
        />
      )
    }
    return <code {...props} />
  },
  strong: (props) => <strong className="font-semibold" {...props} />,
  ApiPlayground,
}
