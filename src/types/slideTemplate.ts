export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layout: 'full-image' | 'split' | 'text-heavy' | 'minimal' | 'grid' | 'centered';
  imagePosition?: 'left' | 'right' | 'top' | 'bottom' | 'background' | 'center';
  contentAlignment?: 'left' | 'center' | 'right';
  contentBoxScale?: number;
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'full-image',
    name: 'Full Image',
    description: 'Large background image with overlaid text',
    thumbnail: '🖼️',
    layout: 'full-image',
    imagePosition: 'background',
    contentAlignment: 'center',
    contentBoxScale: 100,
    fontSize: 24,
  },
  {
    id: 'split-left',
    name: 'Split Left',
    description: 'Image on left, content on right',
    thumbnail: '⬅️',
    layout: 'split',
    imagePosition: 'left',
    contentAlignment: 'left',
    contentBoxScale: 100,
    fontSize: 20,
  },
  {
    id: 'split-right',
    name: 'Split Right',
    description: 'Content on left, image on right',
    thumbnail: '➡️',
    layout: 'split',
    imagePosition: 'right',
    contentAlignment: 'left',
    contentBoxScale: 100,
    fontSize: 20,
  },
  {
    id: 'text-heavy',
    name: 'Text Focus',
    description: 'Large text area with small image',
    thumbnail: '📝',
    layout: 'text-heavy',
    imagePosition: 'top',
    contentAlignment: 'left',
    contentBoxScale: 120,
    fontSize: 18,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean centered design with minimal elements',
    thumbnail: '✨',
    layout: 'minimal',
    imagePosition: 'center',
    contentAlignment: 'center',
    contentBoxScale: 80,
    fontSize: 28,
  },
  {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Multiple content boxes in grid format',
    thumbnail: '⊞',
    layout: 'grid',
    imagePosition: 'top',
    contentAlignment: 'center',
    contentBoxScale: 90,
    fontSize: 16,
  },
  {
    id: 'centered',
    name: 'Centered',
    description: 'Image and text centered vertically',
    thumbnail: '⊡',
    layout: 'centered',
    imagePosition: 'center',
    contentAlignment: 'center',
    contentBoxScale: 100,
    fontSize: 22,
  },
];
