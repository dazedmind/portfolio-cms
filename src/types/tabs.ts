/**
 * Type definitions for the tab system
 */

export type TabName = 
  | 'manage-profile'
  | 'manage-projects'
  | 'manage-employment'
  | 'manage-access'
  | 'manage-prompt';

export type ConnectionSpeed = 'slow' | 'medium' | 'fast';

export interface TabState {
  visitedTabs: TabName[];
  activeTab: TabName;
  connectionSpeed: ConnectionSpeed;
}

export interface TabManagerHook {
  activeTab: TabName;
  switchTab: (tabName: TabName) => void;
  preloadTab: (tabName: TabName) => void;
  cancelPreload: () => void;
  shouldMount: (tabName: TabName) => boolean;
  connectionSpeed: ConnectionSpeed;
  visitedTabs: Set<TabName>;
}

export interface TabComponentProps {
  handleOpenSidebar: () => void;
}

