import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import { getDocBySlug, getAllDocSlugs, getAdjacentPages } from "@/lib/content"
import { mdxComponents } from "@/app/_components/mdx-components"
import { extractHeadings } from "@/lib/toc"
import { TableOfContents } from "@/app/_components/table-of-contents"
import { CopyPageButton } from "@/app/_components/copy-page-button"
import { PageNavigation } from "@/app/_components/page-navigation"

const DEFAULT_SLUG = ["introduction"]

type PageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export async function generateStaticParams() {
  return [{ slug: [] }, ...getAllDocSlugs().map((slug) => ({ slug }))]
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const resolvedSlug = slug ?? DEFAULT_SLUG

  const doc = getDocBySlug(resolvedSlug)
  if (!doc) return { title: "Documentation" }

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const resolvedSlug = slug ?? DEFAULT_SLUG

  const doc = getDocBySlug(resolvedSlug)

  if (!doc) {
    notFound()
  }

  const currentHref = slug ? `/${slug.join("/")}` : "/"
  const { prev, next } = getAdjacentPages(currentHref)
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
        <PageNavigation prev={prev} next={next} />
      </article>
      {headings.length > 0 && (
        <aside className="hidden xl:block">
          <TableOfContents headings={headings} />
        </aside>
      )}
    </div>
  )
}
