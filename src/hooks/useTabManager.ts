import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConnectionSpeed } from '@/types/tabs';

interface TabState {
  visitedTabs: string[];
  activeTab: string;
  connectionSpeed: ConnectionSpeed;
}

export const useTabManager = (initialTab: string) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([initialTab]));
  const [connectionSpeed, setConnectionSpeed] = useState<ConnectionSpeed>('medium');
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect connection speed
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateSpeed = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setConnectionSpeed('fast');
        } else if (effectiveType === '3g') {
          setConnectionSpeed('medium');
        } else {
          setConnectionSpeed('slow');
        }
      };
      
      updateSpeed();
      connection.addEventListener('change', updateSpeed);
      return () => connection.removeEventListener('change', updateSpeed);
    }
  }, []);

  // Save state to sessionStorage
  useEffect(() => {
    const state: TabState = {
      visitedTabs: Array.from(visitedTabs) as any,
      activeTab,
      connectionSpeed,
    };
    sessionStorage.setItem('tabState', JSON.stringify(state));
  }, [visitedTabs, activeTab, connectionSpeed]);

  // Restore state from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('tabState');
    if (saved) {
      try {
        const state = JSON.parse(saved) as any;
        if (state.visitedTabs) {
          setVisitedTabs(new Set(state.visitedTabs));
        }
        if (state.activeTab) {
          setActiveTab(state.activeTab);
        }
      } catch (error) {
        console.error('Failed to restore tab state:', error);
      }
    }
  }, []);

  const switchTab = useCallback((tabName: string) => {
    setActiveTab(tabName);
    setVisitedTabs(prev => new Set([...prev, tabName]));
  }, []);

  const preloadTab = useCallback((tabName: string) => {
    if (connectionSpeed === 'slow') return; // Don't preload on slow connections
    
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    preloadTimeoutRef.current = setTimeout(() => {
      setVisitedTabs(prev => new Set([...prev, tabName]));
    }, connectionSpeed === 'fast' ? 300 : 800);
  }, [connectionSpeed]);

  const cancelPreload = useCallback(() => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
  }, []);

  const shouldMount = useCallback((tabName: string) => {
    return visitedTabs.has(tabName);
  }, [visitedTabs]);

  return {
    activeTab,
    switchTab,
    preloadTab,
    cancelPreload,
    shouldMount,
    connectionSpeed,
    visitedTabs,
  };
};

