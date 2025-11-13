import {
  ShoppingBag,
  Package,
  FileText,
  Heart,
  User,
  MessageCircle,
  Megaphone,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { icon: ShoppingBag, label: 'Boutique', onClick: () => {} },
    { icon: Package, label: 'Mes Commandes & Factures', onClick: () => {} },
    { icon: FileText, label: 'Réclamations & Réparations', onClick: () => {} },
    { icon: Heart, label: 'Liste de souhaits', onClick: () => {} },
    { icon: User, label: 'Mon Profil', onClick: () => {} },
    { icon: MessageCircle, label: 'Support / Discutez avec nous', onClick: () => {} },
    { icon: Megaphone, label: 'Promotions & Actualités', onClick: () => {} }
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-green-600 shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-green-500">
            <div>
              <h2 className="text-xl font-bold text-white">Quincaillerie</h2>
              <p className="text-sm text-green-100">Votre Partenaire Bricolage</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-700 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className="w-full flex items-center gap-4 px-6 py-4 text-white hover:bg-green-700 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-green-500">
            <p className="text-sm text-green-100 text-center">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
