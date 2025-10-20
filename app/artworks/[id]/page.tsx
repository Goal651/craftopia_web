"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArtworkImage } from "@/components/ui/artwork-image"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { sampleArtworks } from "@/lib/data"
import { ArrowLeft, Heart, Share2, ShoppingCart, Check } from "lucide-react"

export default function ArtworkDetailPage() {
  const params = useParams()
  const { dispatch } = useCart()
  const { toast } = useToast()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const artwork = sampleArtworks.find((a) => a.id === params.id)

  if (!artwork) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
        <p className="text-muted-foreground mb-8">The artwork you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/artworks">Browse All Artworks</Link>
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: artwork })
    toast({
      title: "Added to cart",
      description: `${artwork.title} has been added to your cart.`,
    })
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${artwork.title} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
    })
  }

  const relatedArtworks = sampleArtworks
    .filter((a) => a.id !== artwork.id && (a.category === artwork.category || a.artist === artwork.artist))
    .slice(0, 4)

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/artworks" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Artworks
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <ArtworkImage
                src={artwork.images[selectedImageIndex]?.includes('/images/') ? undefined : artwork.images[selectedImageIndex]}
                alt={artwork.title}
                title={artwork.title}
                category={artwork.category}
                width={600}
                height={600}
                className="w-full h-full"
                priority
              />
            </div>
            {artwork.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {artwork.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative overflow-hidden rounded-md border-2 ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <ArtworkImage
                      src={image?.includes('/images/') ? undefined : image}
                      alt={`${artwork.title} view ${index + 1}`}
                      title={`${artwork.title} ${index + 1}`}
                      category={artwork.category}
                      width={150}
                      height={150}
                      className="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary" className="capitalize">
                    {artwork.category}
                  </Badge>
                  <h1 className="text-3xl font-bold">{artwork.title}</h1>
                  <p className="text-xl text-muted-foreground">by {artwork.artist}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleWishlist}>
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-3xl font-bold">${artwork.price.toLocaleString()}</div>

              <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
            </div>

            <Separator />

            {/* Artwork Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Artwork Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {artwork.dimensions && (
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <div className="font-medium">{artwork.dimensions}</div>
                  </div>
                )}
                {artwork.medium && (
                  <div>
                    <span className="text-muted-foreground">Medium:</span>
                    <div className="font-medium">{artwork.medium}</div>
                  </div>
                )}
                {artwork.year && (
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <div className="font-medium">{artwork.year}</div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <div className="font-medium capitalize">{artwork.category}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {artwork.inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">In Stock ({artwork.stockQuantity} available)</span>
                </>
              ) : (
                <span className="text-sm text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={!artwork.inStock}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="lg">
                  Buy Now
                </Button>
                <Button variant="outline" size="lg">
                  Make Offer
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">Shipping Information</h4>
                  <p className="text-muted-foreground">
                    Free shipping on orders over $500. Standard delivery takes 5-7 business days. Artwork will be
                    carefully packaged and insured.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Related Artworks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArtworks.map((relatedArtwork) => (
                <Card key={relatedArtwork.id} className="group overflow-hidden">
                  <div className="relative aspect-square overflow-hidden">
                    <ArtworkImage
                      src={relatedArtwork.images[0]?.includes('/images/') ? undefined : relatedArtwork.images[0]}
                      alt={relatedArtwork.title}
                      title={relatedArtwork.title}
                      category={relatedArtwork.category}
                      width={300}
                      height={300}
                      className="w-full h-full transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-1">{relatedArtwork.title}</h3>
                      <p className="text-sm text-muted-foreground">by {relatedArtwork.artist}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">${relatedArtwork.price.toLocaleString()}</span>
                        <Button size="sm" asChild>
                          <Link href={`/artworks/${relatedArtwork.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
