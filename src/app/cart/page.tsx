"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { items, cartTotal, updateQuantity, removeFromCart } = useCart()
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity)
  }

  const handleRemoveItem = (id: string) => {
    removeFromCart(id)
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your cart.',
    })
  }

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true)
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Invalid coupon',
        description: 'The coupon code you entered is invalid or expired.',
        variant: 'destructive',
      })
      setIsApplyingCoupon(false)
    }, 1000)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
        <p className="mb-8 text-gray-600">Your cart is currently empty.</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      \
