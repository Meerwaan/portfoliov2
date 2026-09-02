import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import { mdxComponents } from "@/components/mdx/mdx-components";

/** Compiles an MDX body on the server. Syntax highlighting is baked into the HTML (no client JS). */
export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeShiki,
            {
              themes: { light: "github-light-default", dark: "github-dark-default" },
              defaultColor: false,
              addLanguageClass: true,
            },
          ],
        ],
      },
    },
  });
  return content;
}

export { extractHeadings, slugify, stripMdx } from "./text";
