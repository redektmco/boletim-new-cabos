import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">Edição não encontrada</h1>
      <p className="mt-3 text-ink-2">O link pode estar incorreto ou a edição ainda não foi publicada.</p>
      <Link href="/" className="mt-8 rounded-full bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-700">
        Ver a última edição
      </Link>
    </div>
  );
}
