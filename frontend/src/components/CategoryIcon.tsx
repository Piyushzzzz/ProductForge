import React from 'react';
import {
  Cloud,
  Server,
  Terminal,
  Layout,
  Puzzle,
  Box,
  Sparkles,
  Cpu,
  Shield,
  Globe,
  Zap,
  Database,
  Code,
  Layers,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  iconName?: string | null;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  cloud: Cloud,
  server: Server,
  terminal: Terminal,
  layout: Layout,
  puzzle: Puzzle,
  box: Box,
  sparkles: Sparkles,
  cpu: Cpu,
  shield: Shield,
  globe: Globe,
  zap: Zap,
  database: Database,
  code: Code,
  layers: Layers
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, ...props }) => {
  const normalized = (iconName || '').toLowerCase().trim();
  const IconComponent = ICON_MAP[normalized] || Layers;
  return <IconComponent {...props} />;
};
