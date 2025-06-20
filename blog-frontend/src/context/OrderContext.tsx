import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getApiUrl } from '../config/api';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface PlacedOrder {
    id: string;
    userId: string; // This will store user.id
    items: OrderItem[];
    total: number;
    date: string;
    time: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}

interface OrderContextType {
    orders: PlacedOrder[];
    addOrder: (items: OrderItem[], total: number) => Promise<string>;
    getUserOrders: (userIdentifier: string) => PlacedOrder[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};

interface OrderProviderProps {
    children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const [orders, setOrders] = useState<PlacedOrder[]>([]);
    const { user } = useAuth();

    // Load orders from localStorage and backend when user changes
    useEffect(() => {
        const savedOrders = localStorage.getItem('steakz_orders');
        if (savedOrders) {
            try {
                setOrders(JSON.parse(savedOrders));
            } catch (error) {
                console.error('Error loading orders from localStorage:', error);
                setOrders([]);
            }
        }
    }, []);

    // Load orders from backend when user is available
    useEffect(() => {
        const loadUserOrders = async () => {
            if (user?.id) {
                try {
                    const response = await fetch(getApiUrl(`/api/orders/${user.id}`), {
                        headers: {
                            'x-user-id': user.id
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const backendOrders = data.orders.map((order: any) => ({
                            id: order.id,
                            userId: user.id, // Use user.id instead of user.email
                            items: [], // No items since we removed OrderItem
                            total: order.total,
                            date: new Date(order.createdAt).toISOString().split('T')[0],
                            time: new Date(order.createdAt).toTimeString().slice(0, 5),
                            status: (order.status || 'pending').toLowerCase() as 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
                        }));
                        
                        // Merge with local orders (remove duplicates)
                        const localOrders = JSON.parse(localStorage.getItem('steakz_orders') || '[]');
                        const allOrders = [...backendOrders];
                        
                        // Add local orders that aren't in backend
                        localOrders.forEach((localOrder: any) => {
                            if (!backendOrders.find((bo: any) => bo.id === localOrder.id)) {
                                allOrders.push(localOrder);
                            }
                        });
                        
                        setOrders(allOrders);
                    }
                } catch (error) {
                    console.error('Error loading orders from backend:', error);
                }
            }
        };

        loadUserOrders();
    }, [user]);

    // Save orders to localStorage whenever orders change
    useEffect(() => {
        localStorage.setItem('steakz_orders', JSON.stringify(orders));
    }, [orders]);

    const addOrder = async (items: OrderItem[], total: number): Promise<string> => {
        const now = new Date();
        const orderId = `ORD-${Date.now()}`;
        
        console.log('🍽️ Creating order:', { orderId, items, total, user: user?.id });
        
        const newOrder: PlacedOrder = {
            id: orderId,
            userId: user?.id || 'guest', // Use user.id instead of email
            items,
            total,
            date: now.toISOString().split('T')[0], // YYYY-MM-DD format
            time: now.toTimeString().slice(0, 5), // HH:MM format
            status: 'pending' // Start as pending instead of delivered
        };

        // Add to local state first for immediate UI update
        setOrders(prevOrders => [newOrder, ...prevOrders]);

        // Send to backend API
        try {
            if (user?.id) {
                console.log('👤 User authenticated, sending to backend:', user.id);
                
                // Map frontend item names to backend numeric IDs
                const menuItemMap: { [key: string]: string } = {
                    // Starters
                    'Burrata with Heirloom Tomatoes': '1',
                    'Beef Carpaccio': '2',
                    'Foie Gras Torchon': '3',
                    'Lobster Bisque': '4',
                    
                    // Steaks
                    'Dry-Aged Ribeye': '5',
                    'Wagyu Tenderloin': '6',
                    'Roasted Duck Breast': '7',
                    'Pan-Seared Sea Bass': '8',
                    'Truffle Tagliatelle': '9',
                    
                    // Sides
                    'Truffle Mac & Cheese': '10',
                    'Roasted Asparagus': '11',
                    'Garlic Mashed Potatoes': '12',
                    'Grilled Vegetables': '13',
                    
                    // Desserts
                    'Vanilla Bean Panna Cotta': '14',
                    '72% Dark Chocolate Fondant': '15',
                    'Lemon Basil Tart': '16',
                    'Tiramisu Classico': '17',
                    
                    // Wines
                    'Château Margaux 2015': '18',
                    'Dom Pérignon Vintage 2012': '19',
                    'Caymus Cabernet Sauvignon': '20',
                    'Sancerre Loire Valley': '21',
                    
                    // Drinks
                    'Still Mineral Water': '22',
                    'Sommelier\'s Pairing Flight': '23',
                    'Craft Coffee': '24',
                    'Herbal Tea Selection': '25'
                };

                const backendItems = items.map(item => {
                    const itemId = menuItemMap[item.name];
                    if (!itemId) {
                        console.error(`❌ Item "${item.name}" not found in menu mapping!`);
                        return { itemId: '1', quantity: item.quantity }; // Default to first item
                    }
                    console.log(`✅ Mapped "${item.name}" to itemId: ${itemId}`);
                    return { itemId, quantity: item.quantity };
                });

                const requestBody = {
                    userId: user.id,
                    items: backendItems,
                    total: total
                };
                
                console.log('📤 Sending to backend:', {
                    url: getApiUrl('/api/order'),
                    method: 'POST',
                    headers: { 'x-user-id': user.id },
                    body: requestBody
                });

                const response = await fetch(getApiUrl('/api/order'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': user.id
                    },
                    body: JSON.stringify(requestBody),
                });

                console.log('📨 Backend response status:', response.status);
                
                if (response.ok) {
                    const backendOrder = await response.json();
                    console.log('✅ Order saved to backend successfully:', backendOrder);
                    
                    // Update the order with the backend ID
                    setOrders(prevOrders => 
                        prevOrders.map(order => 
                            order.id === orderId 
                                ? { ...order, id: backendOrder.order.id }
                                : order
                        )
                    );
                } else {
                    const errorText = await response.text();
                    console.error('❌ Failed to save order to backend:', {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText
                    });
                    // Keep the order in frontend state even if backend fails
                }
            } else {
                console.log('⚠️ No user authenticated - order saved locally only');
            }
        } catch (error) {
            console.error('💥 Error sending order to backend:', error);
            // Keep the order in frontend state even if backend fails
        }

        console.log('✅ Order process completed, returning orderId:', orderId);
        return orderId;
    };

    const getUserOrders = (userIdentifier: string): PlacedOrder[] => {
        return orders.filter(order => order.userId === userIdentifier);
    };

    return (
        <OrderContext.Provider value={{
            orders,
            addOrder,
            getUserOrders
        }}>
            {children}
        </OrderContext.Provider>
    );
};