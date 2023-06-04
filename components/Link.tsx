import { JSX } from "preact";

export function Link(
  props: JSX.HTMLAttributes<HTMLAnchorElement> & { href: string },
) {
  const isExternalLink = props.href.startsWith("https://") ||
    props.href.startsWith("http://");
  return (
    <a
      {...props}
      target={isExternalLink ? "_blank" : "_self"}
      class="text-blue-600 hover:text-blue-400 dark:(text-blue-300 hover:text-blue-200) hover:underline"
    >
      {props.children ?? props.href}
    </a>
  );
}
