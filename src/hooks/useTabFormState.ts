import { useEffect, useRef } from 'react';

/**
 * Custom hook for preserving form state in sessionStorage
 * Useful for preserving critical form data when switching tabs
 * 
 * @param tabName - Unique identifier for the tab
 * @param formState - Current form state to preserve
 * @param enabled - Whether to enable state preservation (default: true)
 */
export const useTabFormState = <T extends Record<string, any>>(
  tabName: string,
  formState: T,
  enabled: boolean = true
) => {
  const storageKey = `tab_form_${tabName}`;
  const isInitialMount = useRef(true);

  // Restore state on mount
  useEffect(() => {
    if (!enabled || !isInitialMount.current) return;
    
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if the saved state is recent (within last hour)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
          return parsed.state;
        }
      }
    } catch (error) {
      console.error('Failed to restore form state:', error);
    }
    
    isInitialMount.current = false;
  }, [enabled, storageKey]);

  // Save state on changes
  useEffect(() => {
    if (!enabled || isInitialMount.current) return;

    // Debounce saving to avoid excessive writes
    const timeoutId = setTimeout(() => {
      try {
        const toSave = {
          state: formState,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(storageKey, JSON.stringify(toSave));
      } catch (error) {
        console.error('Failed to save form state:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formState, enabled, storageKey]);

  // Clear saved state
  const clearSavedState = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear form state:', error);
    }
  };

  return { clearSavedState };
};

