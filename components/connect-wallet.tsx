"use client"

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState, useCallback } from 'react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = useCallback(async () => {
    try {
      const connector = connectors[0]
      if (connector) {
        await connect({ connector })
        toast({
          title: "Connected",
          description: "Wallet connected successfully!",
        })
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: "Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }, [connect, connectors, toast])

  const handleDisconnect = useCallback(() => {
    disconnect()
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully!",
    })
  }, [disconnect, toast])

  if (!mounted) {
    return <Button disabled>Loading...</Button>
  }

  return (
    <Button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isLoading}
      variant={isConnected ? "outline" : "default"}
    >
      {isLoading ? "Connecting..." : isConnected ? "Disconnect" : "Connect Wallet"}
    </Button>
  )
} 