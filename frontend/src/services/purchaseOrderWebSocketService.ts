/**
 * Purchase Order WebSocket Service
 * 
 * This service handles real-time notifications for purchase order status changes.
 * Connect to WebSocket server to receive updates when owner approves/rejects orders.
 */

export interface POStatusChangeNotification {
  orderId: string
  previousStatus: string
  newStatus: 'approved' | 'rejected'
  changedBy: string // Owner who made the change
  changedAt: string // ISO timestamp
  ownerComment?: string
  rejectionReason?: string
}

type StatusChangeCallback = (notification: POStatusChangeNotification) => void

class PurchaseOrderWebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private callbacks: Set<StatusChangeCallback> = new Set()
  private isIntentionallyClosed = false

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('[PO WebSocket] Already connected')
      return
    }

    try {
      // Connect realistically
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws'
      const token = localStorage.getItem('access_token')
      
      this.socket = new WebSocket(`${wsUrl}?token=${token}`)
      
      this.socket.onopen = this.handleOpen.bind(this)
      this.socket.onmessage = this.handleMessage.bind(this)
      this.socket.onerror = this.handleError.bind(this)
      this.socket.onclose = this.handleClose.bind(this)
      
    } catch (error) {
      console.error('[PO WebSocket] Connection error:', error)
      this.attemptReconnect()
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.isIntentionallyClosed = true
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.callbacks.clear()
    console.log('[PO WebSocket] Disconnected')
  }

  /**
   * Subscribe to status change notifications
   * @param callback Function to call when status changes
   * @returns Unsubscribe function
   */
  onStatusChange(callback: StatusChangeCallback): () => void {
    this.callbacks.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen() {
    console.log('[PO WebSocket] Connected')
    this.reconnectAttempts = 0
    
    // Subscribe to purchase order status changes
    this.send({
      type: 'subscribe',
      channel: 'purchase_orders.status_changes'
    })
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data)
      
      if (message.type === 'purchase_order.status_changed') {
        const notification: POStatusChangeNotification = {
          orderId: message.data.orderId,
          previousStatus: message.data.previousStatus,
          newStatus: message.data.newStatus,
          changedBy: message.data.changedBy,
          changedAt: message.data.changedAt,
          ownerComment: message.data.ownerComment,
          rejectionReason: message.data.rejectionReason
        }
        
        // Notify all subscribers
        this.callbacks.forEach(callback => {
          try {
            callback(notification)
          } catch (error) {
            console.error('[PO WebSocket] Error in callback:', error)
          }
        })
      }
    } catch (error) {
      console.error('[PO WebSocket] Error parsing message:', error)
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(error: Event) {
    console.error('[PO WebSocket] Error:', error)
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose() {
    console.log('[PO WebSocket] Connection closed')
    this.socket = null
    
    if (!this.isIntentionallyClosed) {
      this.attemptReconnect()
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[PO WebSocket] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`[PO WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    
    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay)
  }

  /**
   * Send message to WebSocket server
   */
  private send(data: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('[PO WebSocket] Cannot send message: not connected')
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
export const poWebSocketService = new PurchaseOrderWebSocketService()

/**
 * React Hook for using Purchase Order WebSocket notifications
 * 
 * Usage example:
 * ```tsx
 * import { usePOStatusNotifications } from './services/purchaseOrderWebSocketService'
 * 
 * function MyComponent() {
 *   usePOStatusNotifications((notification) => {
 *     console.log('Status changed:', notification)
 *     // Update UI, show toast, etc.
 *   })
 * }
 * ```
 */
export function usePOStatusNotifications(callback: StatusChangeCallback) {
  // This is a placeholder hook structure
  // Actual implementation will be in a separate hooks file
  // when backend is ready
  
  // useEffect(() => {
  //   poWebSocketService.connect()
  //   const unsubscribe = poWebSocketService.onStatusChange(callback)
  //   
  //   return () => {
  //     unsubscribe()
  //   }
  // }, [callback])
  
  console.log('[usePOStatusNotifications] MOCK: Hook not implemented yet', callback)
}
