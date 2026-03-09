
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 animate-in fade-in slide-in-from-left-2 duration-500">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={12} className="text-slate-300" />}
          <button
            onClick={item.onClick}
            disabled={!item.onClick}
            className={`flex items-center gap-1.5 transition-colors ${
              item.onClick ? 'hover:text-blue-600 cursor-pointer' : 'cursor-default'
            } ${index === items.length - 1 ? 'text-slate-600' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
