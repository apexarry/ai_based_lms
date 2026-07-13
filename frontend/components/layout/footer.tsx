export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-4 md:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} DESIDOC, Defence Research &amp; Development
          Organisation. For authorised personnel only.
        </p>
        <div className="flex items-center gap-4">
          <span>v2.4.1</span>
          <span className="hidden sm:inline">Classification: Restricted</span>
          <a href="#" className="transition-colors hover:text-foreground">
            Help
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  )
}
