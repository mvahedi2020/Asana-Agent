import { useState, useEffect } from 'react';
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return size;
}
