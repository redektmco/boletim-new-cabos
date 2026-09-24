import Link from "next/link";
import { listPublished } from "@/lib/bulletins";

export const revalidate = 300;

export default async function HomePage() {
  const all = await listPublished();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {all.map((b) => (
        <p key={b.id}>
          <Link href={`/boletim/${b.slug}`}>{b.headline}</Link>
        </p>
      ))}
    </div>
  );
}
