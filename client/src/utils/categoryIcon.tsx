import {
  Utensils,
  ShoppingBag,
  Film,
  Car,
  GraduationCap,
  Home,
  Plane,
  HeartPulse,
  Tag
} from 'lucide-react';

export const renderCategoryIcon = (iconName?: string, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'utensils':
      return <Utensils className={className} />;
    case 'shopping-bag':
      return <ShoppingBag className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'graduation-cap':
      return <GraduationCap className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'plane':
      return <Plane className={className} />;
    case 'hospital':
      return <HeartPulse className={className} />;
    default:
      return <Tag className={className} />;
  }
};
