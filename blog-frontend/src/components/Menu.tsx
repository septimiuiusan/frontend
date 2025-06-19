import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Menu.css';

const Menu: React.FC = () => {
    return (
        <section className="menu-section" id="menu">
            <div className="menu-container">
                <h2 className="menu-main-title">Culinary Excellence</h2>
                
                {/* Starters Section */}
                <div className="menu-category">
                    <h3 className="category-title">Starters</h3>
                    <div className="menu-grid">
                        <div className="menu-card">
                            <h4 className="menu-item-title">Burrata with Heirloom Tomatoes</h4>
                            <p className="menu-desc">Creamy burrata, heirloom tomatoes, aged balsamic, and basil oil.</p>
                            <p className="menu-price">$14.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Beef Carpaccio</h4>
                            <p className="menu-desc">Angus beef slices with truffle oil, arugula, parmesan shavings.</p>
                            <p className="menu-price">$17.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Foie Gras Torchon</h4>
                            <p className="menu-desc">House-cured foie gras with toasted brioche and fig compote.</p>
                            <p className="menu-price">$22.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Lobster Bisque</h4>
                            <p className="menu-desc">Velvety lobster bisque finished with cognac cream.</p>
                            <p className="menu-price">$19.00</p>
                        </div>
                    </div>
                </div>

                {/* Main Courses Section */}
                <div className="menu-category">
                    <h3 className="category-title">Main Courses</h3>
                    <div className="menu-grid">
                        <div className="menu-card">
                            <h4 className="menu-item-title">Dry-Aged Ribeye</h4>
                            <p className="menu-desc">45-day aged ribeye grilled to perfection, bone marrow jus.</p>
                            <p className="menu-price">$72.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Wagyu Tenderloin</h4>
                            <p className="menu-desc">Japanese A5 wagyu with black garlic glaze and pomme purée.</p>
                            <p className="menu-price">$98.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Roasted Duck Breast</h4>
                            <p className="menu-desc">Honey-lavender glazed duck with parsnip purée and baby carrots.</p>
                            <p className="menu-price">$54.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Pan-Seared Sea Bass</h4>
                            <p className="menu-desc">Chilean sea bass on a bed of saffron risotto.</p>
                            <p className="menu-price">$63.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Truffle Tagliatelle</h4>
                            <p className="menu-desc">Handmade pasta in a parmesan cream sauce with shaved black truffle.</p>
                            <p className="menu-price">$44.00</p>
                        </div>
                    </div>
                </div>

                {/* Desserts Section */}
                <div className="menu-category">
                    <h3 className="category-title">Desserts</h3>
                    <div className="menu-grid">
                        <div className="menu-card">
                            <h4 className="menu-item-title">Vanilla Bean Panna Cotta</h4>
                            <p className="menu-desc">Silky panna cotta with passionfruit and edible gold.</p>
                            <p className="menu-price">$14.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">72% Dark Chocolate Fondant</h4>
                            <p className="menu-desc">Molten-centered cake with Madagascar vanilla ice cream.</p>
                            <p className="menu-price">$16.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Lemon Basil Tart</h4>
                            <p className="menu-desc">Zesty lemon tart with basil meringue and shortcrust pastry.</p>
                            <p className="menu-price">$12.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Tiramisu Classico</h4>
                            <p className="menu-desc">Espresso-soaked ladyfingers layered with mascarpone.</p>
                            <p className="menu-price">$13.00</p>
                        </div>
                    </div>
                </div>

                {/* Wine & Beverages Section */}
                <div className="menu-category">
                    <h3 className="category-title">Wine & Beverages</h3>
                    <div className="menu-grid">
                        <div className="menu-card">
                            <h4 className="menu-item-title">Château Margaux 2015</h4>
                            <p className="menu-desc">Full-bodied Bordeaux red, aged oak finish.</p>
                            <p className="menu-price">$150/glass</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Dom Pérignon Vintage 2012</h4>
                            <p className="menu-desc">Fine champagne with brioche notes and bright acidity.</p>
                            <p className="menu-price">$120/glass</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Still Mineral Water</h4>
                            <p className="menu-desc">Sparkling or still, sourced from the French Alps.</p>
                            <p className="menu-price">$6.00</p>
                        </div>
                        <div className="menu-card">
                            <h4 className="menu-item-title">Sommelier's Pairing Flight</h4>
                            <p className="menu-desc">Three curated glasses to match your tasting menu.</p>
                            <p className="menu-price">$45.00</p>
                        </div>
                    </div>
                </div>

                {/* Reserve Table Button */}
                <div className="menu-btn-row">
                    <Link to="/reservations" className="menu-btn">Reserve Your Table</Link>
                </div>
            </div>
        </section>
    );
};

export default Menu;