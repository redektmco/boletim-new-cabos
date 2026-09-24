import {
  Cable,
  CloudLightning,
  DollarSign,
  Factory,
  Globe,
  Landmark,
  Newspaper,
  Percent,
  Pickaxe,
  Scale,
  Ship,
  Warehouse,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TopicIcon as TopicIconName } from "@/lib/bulletin/schema";

export const TOPIC_ICONS: Record<TopicIconName, LucideIcon> = {
  cobre: Cable,
  estoque: Warehouse,
  china: Factory,
  eua: Landmark,
  dolar: DollarSign,
  juros: Percent,
  producao: Pickaxe,
  oferta: Ship,
  economia: Globe,
  geopolitica: Scale,
  energia: Zap,
  clima: CloudLightning,
  outro: Newspaper,
};

export function TopicIcon({ name, className }: { name: TopicIconName; className?: string }) {
  const Icon = TOPIC_ICONS[name] ?? Newspaper;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />;
}
