"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  Users,
  Boxes,
  Layers,
  TrendingUp,
  TrendingDown,
  Shield,
  ShoppingCart,
  Banknote,
  Settings,
  UserCog,
  CreditCard,
  Barcode,
  Percent,
  Package,
  Truck,
  Receipt,
  Printer,
  FileText,
  PieChart,
  BarChart3,
  Tag,
  Calculator,
  FileSpreadsheet,
  Database,
  Hash,
  Link2,
  Sliders,
  XCircle,
  Printer as PrinterIcon,
  FileBarChart,
  Network,
  Award,
  PackageCheck,
  DollarSign,
  type LucideIcon
} from "lucide-react";

// Type Definitions
type IconType = LucideIcon;

interface MenuItem {
  label: string;
  route: string;
  icon: IconType;
  permissions?: string[]; // For future RBAC implementation
  children?: MenuItem[]; // For nested menu items
}

interface MenuGroup {
  icon: IconType;
  items: MenuItem[];
  title?: string; // Optional custom title
}

type GroupedSection = {
  type: "grouped";
  groups: Record<string, MenuGroup>;
  icon?: IconType; // Optional section icon
}

type FlatSection = {
  type: "flat";
  items: MenuItem[];
  icon?: IconType; // Optional section icon
}

type SidebarSection = GroupedSection | FlatSection;

interface SidebarMenu {
  [key: string]: SidebarSection;
}

interface SidebarConfig {
  collapsedWidth: string;
  expandedWidth: string;
  transitionDuration: number;
  showTooltips: boolean;
  defaultSection: string;
}

interface SidebarContextType {
  // State
  currentSection: string;
  setCurrentSection: (section: string) => void;
  expandedNodes: Record<string, boolean>;
  toggleNode: (key: string) => void;
  menuData: SidebarMenu;
  sidebarConfig: SidebarConfig;
  sidebarCollapsed: boolean;

  // Actions
  toggleSidebar: () => void;
  updateSidebarConfig: (config: Partial<SidebarConfig>) => void;
  expandAll: () => void;
  collapseAll: () => void;
  searchMenu: (query: string) => MenuItem[];

  // Derived
  isMobile: boolean;
  activeRoute: string;
  setActiveRoute: (route: string) => void;
}

// Constants
const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";
const EXPANDED_NODES_KEY = "sidebar-expanded-nodes";
const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  collapsedWidth: "64px",
  expandedWidth: "260px",
  transitionDuration: 300,
  showTooltips: true,
  defaultSection: "Master",
};

// Create context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Custom hook for using sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

// Menu data configuration
const createMenuData = (): SidebarMenu => ({
  Master: {
    type: "grouped",
    groups: {
      Users: {
        icon: UserCog,
        items: [
          { label: "Designation", route: "/dashboard/Master/Users/Designation", icon: Building2 },
          { label: "Employee", route: "/dashboard/Master/Users/Employee", icon: Users },
          { label: "Operator", route: "/dashboard/Master/Users/Operator", icon: UserCog },
          // { label: "System Assigning", route: "/dashboard/Master/Users/SystemAssigning", icon: Settings },
          { label: "Company", route: "/dashboard/Master/Users/Company", icon: Building2 },
          { label: "AccountHead", route: "/dashboard/Master/Users/AccountHead", icon: Users },
        ],
      },
      Object: {
        icon: Package,
        items: [
          { label: "Product", route: "/dashboard/Master/Objects/Product", icon: Package },
          // { label: "CreditCard", route: "/dashboard/Master/Object/CreditCard", icon: CreditCard },
          // { label: "OrionBarCode", route: "/dashboard/Master/Object/OrionBarCode", icon: Barcode },
          // { label: "RateUpdation", route: "/dashboard/Master/Object/RateUpdation", icon: TrendingUp },
          // { label: "SubProduct", route: "/dashboard/Master/Object/SubProducts", icon: PackageCheck },
          // { label: "Vendor", route: "/dashboard/Master/Object/Vendor", icon: Truck },
        ],
      },
      Utility: {
        icon: Sliders,
        items: [
          { label: "TAX Master", route: "/dashboard/Master/Utilities/TaxMaster", icon: Percent },
          { label: "HSN Master", route: "/dashboard/Master/Utilities/HSNMaster", icon: Hash },
          { label: "HSN TAX Master", route: "/dashboard/Master/Utilities/HSNTaxMaster", icon: Calculator },
          { label: "HSN Link Product", route: "/dashboard/Master/Utilities/HSNLinkProduct", icon: Link2 },
          // { label: "Print Settings", route: "/dashboard/Master/Utilities/PrintSettings", icon: Printer },
        ],
      },
    },
  },
  Stock: {
    type: "flat",
    icon: Database,
    items: [
      // { label: "Invoice", route: "/dashboard/Stock/Invoice", icon: Receipt },
      // { label: "Non-Tag Generation", route: "/dashboard/Stock/Non-TagGeneration", icon: FileText },
      // { label: "Tag Generation", route: "/dashboard/Stock/TagGeneration", icon: Tag },
      // { label: "Tag Print", route: "/dashboard/Stock/TagPrint", icon: PrinterIcon },
    ],
  },
  Billing: {
    type: "flat",
    icon: DollarSign,
    items: [
      // { label: "Bill Cancel", route: "/dashboard/Billing/BillCancel", icon: XCircle },
      // { label: "Bill Print", route: "/dashboard/Billing/BillPrint", icon: PrinterIcon },
      // { label: "Sales", route: "/dashboard/Billing/Sales", icon: TrendingUp },
    ],
  },
  Reports: {
    type: "flat",
    icon: FileBarChart,
    items: [
      // { label: "Bill Cancel Report", route: "/dashboard/Reports/BillCancelReport", icon: FileSpreadsheet },
      // { label: "Nodewise Collection Report", route: "/dashboard/Reports/NodewiseCollection", icon: Network },
      // { label: "Privilege Report", route: "/dashboard/Reports/PrivilegeReport", icon: Award },
      // { label: "Productwise Sales Report", route: "/dashboard/Reports/ProductwiseSales", icon: BarChart3 },
      // { label: "Productwise Stock Report", route: "/dashboard/Reports/ProductwiseStock", icon: PieChart },
    ],
  },
});

// Provider component
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  // State
  const [menuData] = useState<SidebarMenu>(createMenuData);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig>(DEFAULT_SIDEBAR_CONFIG);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeRoute, setActiveRoute] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Initialize from localStorage and set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load sidebar state
    const savedCollapsedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const savedExpandedNodes = localStorage.getItem(EXPANDED_NODES_KEY);

    setSidebarCollapsed(savedCollapsedState === "true");
    setCurrentSection(DEFAULT_SIDEBAR_CONFIG.defaultSection);

    if (savedExpandedNodes) {
      try {
        setExpandedNodes(JSON.parse(savedExpandedNodes));
      } catch {
        setExpandedNodes({});
      }
    }

    // Check mobile view
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Set active route based on current path
    if (typeof window !== 'undefined') {
      setActiveRoute(window.location.pathname);
    }

    setIsInitialized(true);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save expanded nodes to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(EXPANDED_NODES_KEY, JSON.stringify(expandedNodes));
    }
  }, [expandedNodes, isInitialized]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Memoized callbacks
  const toggleNode = useCallback((key: string) => {
    setExpandedNodes(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      return newState;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, newState.toString());
      }
      return newState;
    });
  }, []);

  const updateSidebarConfig = useCallback((config: Partial<SidebarConfig>) => {
    setSidebarConfig(prev => ({ ...prev, ...config }));
  }, []);

  const expandAll = useCallback(() => {
    const allNodes: Record<string, boolean> = {};
    Object.keys(menuData).forEach(section => {
      const sectionData = menuData[section];
      if (sectionData.type === "grouped") {
        Object.keys(sectionData.groups).forEach(group => {
          allNodes[`${section}-${group}`] = true;
        });
      }
    });
    setExpandedNodes(allNodes);
  }, [menuData]);

  const collapseAll = useCallback(() => {
    setExpandedNodes({});
  }, []);

  const searchMenu = useCallback((query: string): MenuItem[] => {
    if (!query.trim()) return [];

    const results: MenuItem[] = [];
    const searchTerm = query.toLowerCase();

    Object.entries(menuData).forEach(([section, sectionData]) => {
      if (sectionData.type === "flat") {
        sectionData.items.forEach(item => {
          if (item.label.toLowerCase().includes(searchTerm)) {
            results.push(item);
          }
        });
      } else {
        Object.values(sectionData.groups).forEach(group => {
          group.items.forEach(item => {
            if (item.label.toLowerCase().includes(searchTerm)) {
              results.push(item);
            }
          });
        });
      }
    });

    return results;
  }, [menuData]);

  // Memoized context value
  const contextValue = useMemo<SidebarContextType>(() => ({
    // State
    currentSection,
    setCurrentSection,
    expandedNodes,
    toggleNode,
    menuData,
    sidebarConfig,
    sidebarCollapsed,

    // Actions
    toggleSidebar,
    updateSidebarConfig,
    expandAll,
    collapseAll,
    searchMenu,

    // Derived
    isMobile,
    activeRoute,
    setActiveRoute,
  }), [
    currentSection,
    expandedNodes,
    menuData,
    sidebarConfig,
    sidebarCollapsed,
    toggleNode,
    toggleSidebar,
    updateSidebarConfig,
    expandAll,
    collapseAll,
    searchMenu,
    isMobile,
    activeRoute,
  ]);

  // Don't render children until initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

// Optional: Add HOC for protecting routes based on permissions
export const withSidebarProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions?: string[]
) => {
  return function WithSidebarProtection(props: P) {
    const { menuData } = useSidebar();

    return <WrappedComponent {...props} />;
  };
};