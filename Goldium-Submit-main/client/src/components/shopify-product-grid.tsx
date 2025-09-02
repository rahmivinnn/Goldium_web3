import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  variants: Array<{
    id: string;
    title: string;
    price: string;
  }>;
}

interface ShopifyProductGridProps {
  onAddToCart?: (productId: string, variantId: string) => void;
}

export function ShopifyProductGrid({ onAddToCart }: ShopifyProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<{ productId: string; variantId: string; quantity: number }>>([]);
  const { toast } = useToast();

  // Mock Shopify products for demo
  const mockProducts: Product[] = [
    {
      id: 'nft-1',
      title: 'CryptoPunk #7804',
      description: 'Rare alien CryptoPunk with cap and pipe - Digital collectible',
      price: '420.69 ETH',
      image: 'https://www.larvalabs.com/public/images/cryptopunks/punk7804.png',
      variants: [
        { id: 'var-1', title: 'Original', price: '420.69 ETH' },
        { id: 'var-2', title: 'Fractionalized', price: '0.042 ETH' }
      ]
    },
    {
      id: 'nft-2',
      title: 'Bored Ape #8817',
      description: 'Golden fur Bored Ape with laser eyes - BAYC collection',
      price: '152.7 ETH',
      image: 'https://img.seadn.io/files/0c2d8d8e0b8b4c4b4b4b4b4b4b4b4b4b.png?fit=max&w=600',
      variants: [
        { id: 'var-3', title: 'Original', price: '152.7 ETH' },
        { id: 'var-4', title: 'Commercial Rights', price: '200.0 ETH' }
      ]
    },
    {
      id: 'nft-3',
      title: 'Azuki #9605',
      description: 'Anime-style avatar with rare traits - The Garden access',
      price: '11.5 ETH',
      image: 'https://ikzttp.mypinata.cloud/ipfs/QmQFkLSQysj94s5GvTHPyzTxrawwtjgiiYS2TBLgrvw8CW/9605.png',
      variants: [
        { id: 'var-5', title: 'Standard', price: '11.5 ETH' },
        { id: 'var-6', title: 'With Utilities', price: '15.0 ETH' }
      ]
    },
    {
      id: 'nft-4',
      title: 'Moonbird #2642',
      description: 'Pixelated owl NFT with nesting rewards - PROOF Collective',
      price: '25.8 ETH',
      image: 'https://live---metadata-5covpqijaa-uc.a.run.app/images/2642',
      variants: [
        { id: 'var-7', title: 'Nested', price: '25.8 ETH' },
        { id: 'var-8', title: 'Unnested', price: '22.5 ETH' }
      ]
    },
    {
      id: 'nft-5',
      title: 'Doodle #6914',
      description: 'Hand-drawn pastel character with vibrant accessories',
      price: '8.2 ETH',
      image: 'https://ipfs.io/ipfs/QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS/6914',
      variants: [
        { id: 'var-9', title: 'Original', price: '8.2 ETH' },
        { id: 'var-10', title: 'Animated', price: '12.0 ETH' }
      ]
    }
  ];

  useEffect(() => {
    // Simulate Shopify API call
    const fetchProducts = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(mockProducts);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (productId: string, variantId: string) => {
    const existingItem = cart.find(item => item.productId === productId && item.variantId === variantId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId, variantId, quantity: 1 }]);
    }

    const product = products.find(p => p.id === productId);
    const variant = product?.variants.find(v => v.id === variantId);
    
    toast({
      title: "Added to Cart",
      description: `${product?.title} (${variant?.title}) added to cart`,
    });

    onAddToCart?.(productId, variantId);
  };

  if (loading) {
    return (
      <Card className="bg-galaxy-card border-galaxy-purple/30">
        <CardContent className="p-8 text-center">
          <div className="text-galaxy-bright">Loading products from Shopify...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-galaxy-card border-galaxy-purple/30">
        <CardHeader>
          <CardTitle className="text-galaxy-bright flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">🛒</span>
              Lighting Store
            </span>
            <Badge variant="outline" className="text-galaxy-accent border-galaxy-purple/30">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="bg-galaxy-secondary border-galaxy-purple/20">
                <CardContent className="p-4 space-y-3">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-32 object-cover rounded-md bg-galaxy-accent/10"
                  />
                  <div>
                    <h3 className="font-semibold text-galaxy-bright text-sm">{product.title}</h3>
                    <p className="text-xs text-galaxy-accent mt-1">{product.description}</p>
                    <div className="text-galaxy-bright font-bold mt-2">{product.price}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <select className="w-full bg-galaxy-button border border-galaxy-purple/30 rounded text-galaxy-bright text-xs p-2">
                      {product.variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.title} - {variant.price}
                        </option>
                      ))}
                    </select>
                    
                    <Button 
                      size="sm"
                      className="w-full bg-blue-gradient hover:opacity-90 text-white"
                      onClick={() => handleAddToCart(product.id, product.variants[0].id)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}