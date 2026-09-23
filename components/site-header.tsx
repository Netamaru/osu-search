import { ApiClientButton } from "@/components/credentials-provider";
import { SearchBackLink } from "@/components/search-back-link";

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-40">
      <header className="border-b border-line bg-canvas">
        <div className="column flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 md:px-10">
          <SearchBackLink restore={false} className="display shrink-0 text-[1.65rem]">
            osu! <span className="text-accent">Search</span>
          </SearchBackLink>
          <div className="flex items-center">
            <ApiClientButton />
            <span className="mx-4 h-4 w-px bg-line" aria-hidden="true" />
            <a className="label hover:text-fg" href="https://osu.ppy.sh/beatmapsets">
              osu! beatmaps
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}
