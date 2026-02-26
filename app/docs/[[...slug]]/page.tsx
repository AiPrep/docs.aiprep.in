import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import { getDocBySlug, getAllDocSlugs } from "@/lib/content"
import { mdxComponents } from "@/app/docs/_components/mdx-components"
import { extractHeadings } from "@/lib/toc"
import { TableOfContents } from "@/app/docs/_components/table-of-contents"
import { CopyPageButton } from "@/app/docs/_components/copy-page-button"

type DocsPageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: DocsPageProps) {
  const { slug } = await params
  if (!slug) return { title: "Documentation" }

  const doc = getDocBySlug(slug)
  if (!doc) return { title: "Documentation" }

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params

  if (!slug) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold">Documentation</h1>
        <p className="text-muted-foreground">
          Welcome to the docs. Pick a page from the sidebar to get started.
        </p>
      </section>
    )
  }

  const doc = getDocBySlug(slug)

  if (!doc) {
    notFound()
  }

  const headings = extractHeadings(doc.content)

  const pageComponents = {
    ...mdxComponents,
    h1: () => null,
  }

  return (
    <div className="mx-auto flex max-w-5xl gap-10">
      <article className="min-w-0 max-w-3xl flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {doc.frontmatter.title}
          </h1>
          <CopyPageButton content={doc.content} />
        </div>
        <MDXRemote
          source={doc.content}
          components={pageComponents}
          options={{
            mdxOptions: {
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: { dark: "github-dark", light: "github-light" },
                    defaultColor: false,
                    keepBackground: false,
                  },
                ],
              ],
            },
          }}
        />
      </article>
      {headings.length > 0 && (
        <aside className="hidden xl:block">
          <TableOfContents headings={headings} />
        </aside>
      )}
    </div>
  )
}
