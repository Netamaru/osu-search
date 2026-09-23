import { SearchBackLink } from "@/components/search-back-link";

export default function NotFound() {
  return (
    <div className="column flex flex-col gap-4 px-5 py-16 md:px-10">
      <p className="label">404</p>
      <h1 className="display text-5xl">
        Nothing here<span className="text-accent">.</span>
      </h1>
      <SearchBackLink className="label hover:text-fg">Back to search</SearchBackLink>
    </div>
  );
}
