'use client';

interface ProductCardProps {
  name: string;
  price: number;
  image?: string;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
}

export default function ProductCard({ name, price, image, isNew, isSale, originalPrice }: ProductCardProps) {

  return (
    <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">New</span>
          )}
          {isSale && (
            <span className="px-2 py-1 bg-pink-500 text-white text-xs font-medium rounded">Sale</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-medium text-sm mb-2 truncate">{name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-gray-600 text-sm line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button className="bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
