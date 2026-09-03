/** The name is real text in the served HTML; a CSS-only crossfade resolves it from mono to display once. */
export function NameResolve({ name }: { name: string }) {
  return (
    <h1 className="name-resolve font-display text-display font-medium text-ink">
      <span aria-hidden="true" className="name-mono">
        {name}
      </span>
      <span className="name-display">{name}</span>
    </h1>
  );
}
