import type { Metadata } from 'next';
export function constructMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title, description }
  };
}
