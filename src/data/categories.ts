export interface Category {
  id: string;
  name: string;
  image: string;
  subcategories?: string[];
}

export const categories: Category[] = [
  {
    id: 'power-tools',
    name: 'Power Tools',
    image: 'https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=400',
    subcategories: ['Drills', 'Saws', 'Sanders', 'Grinders']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
    subcategories: ['Wiring', 'Switches', 'Light Fixtures', 'Circuit Breakers']
  },
  {
    id: 'paint',
    name: 'Paint & Supplies',
    image: 'https://images.pexels.com/photos/1440504/pexels-photo-1440504.jpeg?auto=compress&cs=tinysrgb&w=400',
    subcategories: ['Interior Paint', 'Exterior Paint', 'Brushes', 'Rollers']
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    image: 'https://images.pexels.com/photos/8486920/pexels-photo-8486920.jpeg?auto=compress&cs=tinysrgb&w=400',
    subcategories: ['Pipes', 'Fittings', 'Faucets', 'Toilets']
  },
  {
    id: 'garden',
    name: 'Garden & Outdoor',
    image: 'https://images.pexels.com/photos/2132240/pexels-photo-2132240.jpeg?auto=compress&cs=tinysrgb&w=400',
    subcategories: ['Garden Tools', 'Lawn Care', 'Outdoor Lighting', 'BBQ']
  },
  {
    id: 'hardware',
    name: 'Hardware',
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=400',
    subcategories: ['Screws', 'Nails', 'Bolts', 'Hinges']
  }
];
