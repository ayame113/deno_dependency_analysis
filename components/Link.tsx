import { JSX } from "preact";

export function Link(
  props: JSX.HTMLAttributes<HTMLAnchorElement> & { href: string },
) {
  const isExternalLink = props.href.startsWith("https://") ||
    props.href.startsWith("http://");
  return (
    <a {...props} target={isExternalLink ? "_blank" : "_self"} class="">
      {props.children ?? props.href}
    </a>
  );
}
