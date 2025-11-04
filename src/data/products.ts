export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
  description: string;
  specifications: {
    [key: string]: string;
  };
}

export const products: Product[] = [
  {
    id: 'drill-001',
    name: 'Cordless Drill 18V',
    price: 129.99,
    image: 'https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'power-tools',
    brand: 'PowerPro',
    stock: 15,
    description: 'Professional grade cordless drill with 18V lithium-ion battery. Perfect for drilling through wood, metal, and plastic. Includes two batteries and a carrying case.',
    specifications: {
      'Voltage': '18V',
      'Battery Type': 'Lithium-ion',
      'Max Torque': '65 Nm',
      'Weight': '1.8 kg',
      'Warranty': '2 years',
      'Chuck Size': '13mm'
    }
  },
  {
    id: 'drill-002',
    name: 'Hammer Drill 20V Max',
    price: 189.99,
    image: 'https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'power-tools',
    brand: 'BuildMaster',
    stock: 8,
    description: 'Heavy-duty hammer drill for masonry and concrete work. Features variable speed control and comfortable grip.',
    specifications: {
      'Voltage': '20V',
      'Battery Type': 'Lithium-ion',
      'Max Torque': '80 Nm',
      'Weight': '2.2 kg',
      'Warranty': '3 years',
      'Chuck Size': '13mm'
    }
  },
  {
    id: 'saw-001',
    name: 'Circular Saw 1500W',
    price: 149.99,
    image: 'https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'power-tools',
    brand: 'CutPro',
    stock: 12,
    description: 'Powerful circular saw with laser guide for precision cuts. Ideal for cutting wood, plywood, and MDF.',
    specifications: {
      'Power': '1500W',
      'Blade Diameter': '190mm',
      'Max Cutting Depth': '65mm',
      'Weight': '4.5 kg',
      'Warranty': '2 years',
      'Speed': '5500 RPM'
    }
  },
  {
    id: 'wire-001',
    name: 'Electrical Wire 2.5mm² (100m)',
    price: 45.99,
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'electrical',
    brand: 'SafeWire',
    stock: 50,
    description: 'High-quality copper electrical wire suitable for residential and commercial installations.',
    specifications: {
      'Cross Section': '2.5mm²',
      'Length': '100m',
      'Material': 'Copper',
      'Insulation': 'PVC',
      'Max Current': '25A',
      'Color': 'Red'
    }
  },
  {
    id: 'switch-001',
    name: 'Light Switch Double',
    price: 8.99,
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'electrical',
    brand: 'ElectroPlus',
    stock: 120,
    description: 'Modern double light switch with white finish. Easy to install and durable.',
    specifications: {
      'Type': 'Double Switch',
      'Voltage': '230V',
      'Current': '10A',
      'Color': 'White',
      'Material': 'Plastic',
      'Warranty': '1 year'
    }
  },
  {
    id: 'paint-001',
    name: 'Interior Wall Paint White 5L',
    price: 34.99,
    image: 'https://images.pexels.com/photos/1440504/pexels-photo-1440504.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'paint',
    brand: 'ColorMax',
    stock: 45,
    description: 'Premium quality washable interior wall paint. Low odor, quick drying, and excellent coverage.',
    specifications: {
      'Volume': '5 Liters',
      'Color': 'Pure White',
      'Finish': 'Matt',
      'Coverage': '50-60 m²',
      'Drying Time': '2-4 hours',
      'Application': 'Brush/Roller'
    }
  },
  {
    id: 'paint-002',
    name: 'Exterior Paint Gray 10L',
    price: 79.99,
    image: 'https://images.pexels.com/photos/1440504/pexels-photo-1440504.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'paint',
    brand: 'WeatherShield',
    stock: 20,
    description: 'Weather-resistant exterior paint with UV protection. Perfect for walls, fences, and outdoor structures.',
    specifications: {
      'Volume': '10 Liters',
      'Color': 'Storm Gray',
      'Finish': 'Satin',
      'Coverage': '100-120 m²',
      'Drying Time': '4-6 hours',
      'Weather Resistance': 'Excellent'
    }
  },
  {
    id: 'pipe-001',
    name: 'PVC Pipe 50mm x 3m',
    price: 12.99,
    image: 'https://images.pexels.com/photos/8486920/pexels-photo-8486920.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'plumbing',
    brand: 'FlowPro',
    stock: 80,
    description: 'Durable PVC pipe for water supply and drainage systems. Easy to cut and install.',
    specifications: {
      'Diameter': '50mm',
      'Length': '3 meters',
      'Material': 'PVC',
      'Pressure Rating': '10 bar',
      'Color': 'Gray',
      'Standard': 'ISO 1452'
    }
  },
  {
    id: 'faucet-001',
    name: 'Kitchen Faucet Single Handle',
    price: 89.99,
    image: 'https://images.pexels.com/photos/8486920/pexels-photo-8486920.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'plumbing',
    brand: 'AquaFlow',
    stock: 18,
    description: 'Modern chrome kitchen faucet with swivel spout and ceramic disc cartridge for drip-free performance.',
    specifications: {
      'Type': 'Single Handle',
      'Finish': 'Chrome',
      'Spout Height': '220mm',
      'Spout Reach': '210mm',
      'Connection': '1/2" BSP',
      'Warranty': '5 years'
    }
  },
  {
    id: 'garden-001',
    name: 'Garden Hose 30m',
    price: 39.99,
    image: 'https://images.pexels.com/photos/2132240/pexels-photo-2132240.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'garden',
    brand: 'GreenCare',
    stock: 35,
    description: 'Flexible and durable garden hose with brass fittings. Resistant to kinking and UV damage.',
    specifications: {
      'Length': '30 meters',
      'Diameter': '1/2"',
      'Material': 'Reinforced PVC',
      'Fittings': 'Brass',
      'Max Pressure': '8 bar',
      'Color': 'Green'
    }
  },
  {
    id: 'garden-002',
    name: 'Pruning Shears Professional',
    price: 24.99,
    image: 'https://images.pexels.com/photos/2132240/pexels-photo-2132240.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'garden',
    brand: 'GardenMaster',
    stock: 42,
    description: 'Sharp stainless steel pruning shears with ergonomic handle. Perfect for trimming bushes and small branches.',
    specifications: {
      'Blade Material': 'Stainless Steel',
      'Max Cut Diameter': '20mm',
      'Length': '200mm',
      'Weight': '220g',
      'Handle': 'Non-slip rubber',
      'Warranty': '2 years'
    }
  },
  {
    id: 'hardware-001',
    name: 'Wood Screws Box (200 pcs)',
    price: 9.99,
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'hardware',
    brand: 'FixIt',
    stock: 150,
    description: 'Box of 200 galvanized wood screws. Ideal for general woodworking projects.',
    specifications: {
      'Size': '4mm x 40mm',
      'Quantity': '200 pieces',
      'Material': 'Steel',
      'Finish': 'Galvanized',
      'Head Type': 'Countersunk',
      'Drive Type': 'Phillips'
    }
  }
];
