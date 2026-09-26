import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectsGrid({
  sectionName,
  projects,
  username,
}: {
  sectionName: string;
  projects: Project[];
  username: string;
}) {
  if (projects.length === 0) return null;
  return (
    <section>
      <h2 className="eyebrow mb-3">{sectionName}</h2>
      <div className="grid grid-cols-2 gap-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/p/${username}/projects/${project.id}`}
            className="group m-0 block overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-ink/25"
          >
            <div className="aspect-square w-full overflow-hidden bg-paper">
              {project.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-graphite">
                  <i className="fa-regular fa-image text-xl" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-ink">{project.title}</p>
              {(project.status || project.short_description) && (
                <p className="mt-0.5 truncate text-xs text-graphite">
                  {project.status || project.short_description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
