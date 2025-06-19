import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Order.css';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

const Order: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string>('');
    
    const { addOrder } = useOrders();
    const { user } = useAuth();

    // Menu items with Euro pricing
    const menuItems: MenuItem[] = [
        // Starters
        { id: '1', name: 'Burrata with Heirloom Tomatoes', description: 'Creamy burrata, heirloom tomatoes, aged balsamic, and basil oil.', price: 12.50, category: 'Starters' },
        { id: '2', name: 'Beef Carpaccio', description: 'Angus beef slices with truffle oil, arugula, parmesan shavings.', price: 15.20, category: 'Starters' },
        { id: '3', name: 'Foie Gras Torchon', description: 'House-cured foie gras with toasted brioche and fig compote.', price: 19.60, category: 'Starters' },
        { id: '4', name: 'Lobster Bisque', description: 'Velvety lobster bisque finished with cognac cream.', price: 16.90, category: 'Starters' },
        
        // Steaks
        { id: '5', name: 'Dry-Aged Ribeye', description: '45-day aged ribeye grilled to perfection, bone marrow jus.', price: 64.20, category: 'Steaks' },
        { id: '6', name: 'Wagyu Tenderloin', description: 'Japanese A5 wagyu with black garlic glaze and pomme purée.', price: 87.30, category: 'Steaks' },
        { id: '7', name: 'Roasted Duck Breast', description: 'Honey-lavender glazed duck with parsnip purée and baby carrots.', price: 48.10, category: 'Steaks' },
        { id: '8', name: 'Pan-Seared Sea Bass', description: 'Chilean sea bass on a bed of saffron risotto.', price: 56.20, category: 'Steaks' },
        { id: '9', name: 'Truffle Tagliatelle', description: 'Handmade pasta in a parmesan cream sauce with shaved black truffle.', price: 39.20, category: 'Steaks' },
        
        // Sides
        { id: '10', name: 'Truffle Mac & Cheese', description: 'Creamy mac and cheese with black truffle and gruyere.', price: 14.30, category: 'Sides' },
        { id: '11', name: 'Roasted Asparagus', description: 'Fresh asparagus with lemon zest and parmesan.', price: 10.70, category: 'Sides' },
        { id: '12', name: 'Garlic Mashed Potatoes', description: 'Creamy yukon gold potatoes with roasted garlic.', price: 8.90, category: 'Sides' },
        { id: '13', name: 'Grilled Vegetables', description: 'Seasonal vegetables grilled with herbs and olive oil.', price: 12.50, category: 'Sides' },
        
        // Desserts
        { id: '14', name: 'Vanilla Bean Panna Cotta', description: 'Silky panna cotta with passionfruit and edible gold.', price: 12.50, category: 'Desserts' },
        { id: '15', name: '72% Dark Chocolate Fondant', description: 'Molten-centered cake with Madagascar vanilla ice cream.', price: 14.30, category: 'Desserts' },
        { id: '16', name: 'Lemon Basil Tart', description: 'Zesty lemon tart with basil meringue and shortcrust pastry.', price: 10.70, category: 'Desserts' },
        { id: '17', name: 'Tiramisu Classico', description: 'Espresso-soaked ladyfingers layered with mascarpone.', price: 11.60, category: 'Desserts' },
        
        // Wines
        { id: '18', name: 'Château Margaux 2015', description: 'Full-bodied Bordeaux red, aged oak finish.', price: 133.80, category: 'Wines' },
        { id: '19', name: 'Dom Pérignon Vintage 2012', description: 'Fine champagne with brioche notes and bright acidity.', price: 107.00, category: 'Wines' },
        { id: '20', name: 'Caymus Cabernet Sauvignon', description: 'Rich Napa Valley cabernet with dark fruit flavors.', price: 75.80, category: 'Wines' },
        { id: '21', name: 'Sancerre Loire Valley', description: 'Crisp white wine with citrus and mineral notes.', price: 58.00, category: 'Wines' },
        
        // Drinks
        { id: '22', name: 'Still Mineral Water', description: 'Sparkling or still, sourced from the French Alps.', price: 5.40, category: 'Drinks' },
        { id: '23', name: 'Sommelier\'s Pairing Flight', description: 'Three curated glasses to match your tasting menu.', price: 40.10, category: 'Drinks' },
        { id: '24', name: 'Craft Coffee', description: 'Freshly brewed single-origin coffee.', price: 7.10, category: 'Drinks' },
        { id: '25', name: 'Herbal Tea Selection', description: 'Premium selection of organic herbal teas.', price: 6.20, category: 'Drinks' }
    ];

    const categories = ['Starters', 'Steaks', 'Sides', 'Desserts', 'Wines', 'Drinks'];

    const addToCart = (item: MenuItem, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                );
            } else {
                return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity }];
            }
        });
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const removeFromCart = (id: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const handlePlaceOrder = async () => {
        if (cart.length > 0) {
            try {
                // Save the order to context and backend
                const orderId = await addOrder(cart, getTotalPrice());
                setLastOrderId(orderId);
                setShowConfirmation(true);
            } catch (error) {
                console.error('Error placing order:', error);
                // Could add error handling UI here
            }
        }
    };

    const closeConfirmation = () => {
        setShowConfirmation(false);
        setCart([]); // Clear cart after order
        setLastOrderId('');
    };

    return (
        <div className="order-page">
            <section className="order-section">
                <div className="order-container">
                    <div className="order-header">
                        <h1 className="order-title">Order Online</h1>
                        <p className="order-subtitle">
                            Enjoy Steakz's premium dining experience delivered to your door.
                        </p>
                        {!user && (
                            <div className="login-prompt">
                                <p>Please <a href="/login">log in</a> to save your order history</p>
                            </div>
                        )}
                    </div>

                    <div className="menu-content">
                        {categories.map(category => (
                            <div key={category} className="menu-category">
                                <h3 className="category-title">{category}</h3>
                                <div className="menu-grid">
                                    {menuItems
                                        .filter(item => item.category === category)
                                        .map(item => (
                                            <MenuItemCard
                                                key={item.id}
                                                item={item}
                                                onAddToCart={addToCart}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    {cart.length > 0 && (
                        <div className="order-summary-section">
                            <div className="order-summary-card">
                                <div className="summary-header">
                                    <h3 className="summary-title">Your Order</h3>
                                    <span className="summary-count">{getTotalItems()} items</span>
                                </div>
                                
                                <div className="cart-items-list">
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-item-row">
                                            <div className="cart-item-details">
                                                <h4 className="cart-item-name">{item.name}</h4>
                                                <span className="cart-item-price">€{item.price.toFixed(2)} each</span>
                                            </div>
                                            <div className="cart-item-controls">
                                                <div className="quantity-controls">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="qty-control-btn"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="quantity-display">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="qty-control-btn"
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="item-subtotal">€{(item.price * item.quantity).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="order-summary-footer">
                                    <div className="total-section">
                                        <div className="total-row total-final">
                                            <span className="total-label">Total:</span>
                                            <span className="total-amount">€{getTotalPrice().toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handlePlaceOrder} 
                                        className="place-order-button"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="modal-overlay" onClick={closeConfirmation}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Order Confirmed!</h3>
                        <p className="modal-message">
                            Thank you for your order! Your delicious meal from Steakz will be prepared with care.
                        </p>
                        <div className="order-details">
                            <p><strong>Order ID:</strong> <span>{lastOrderId}</span></p>
                            <p><strong>Items:</strong> <span>{getTotalItems()}</span></p>
                            <p><strong>Total:</strong> <span>€{getTotalPrice().toFixed(2)}</span></p>
                            <p><strong>Estimated Delivery:</strong> <span>45-60 minutes</span></p>
                        </div>
                        <button onClick={closeConfirmation} className="modal-close-btn">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Menu Item Card Component
interface MenuItemCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        onAddToCart(item, quantity);
        setQuantity(1);
    };

    return (
        <div className="menu-card">
            <h4 className="menu-item-title">{item.name}</h4>
            <p className="menu-desc">{item.description}</p>
            <p className="menu-price">€{item.price.toFixed(2)}</p>
            
            <div className="card-controls">
                <div className="quantity-selector">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="qty-btn"
                    >
                        −
                    </button>
                    <span className="quantity">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="qty-btn"
                    >
                        +
                    </button>
                </div>
                <button onClick={handleAddToCart} className="add-to-cart-btn">
                    Add to Order
                </button>
            </div>
        </div>
    );
};

export default Order;