const { db } = require('../config/database');

const sampleProducts = [
  {
    name: "Wireless Noise-Canceling Headphones",
    category: "Electronics",
    price: 199.99,
    original_price: 249.99,
    rating: 4.8,
    reviews_count: 142,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear acoustic clarity for music lovers and professionals.",
    stock: 35,
    badge: "Sale"
  },
  {
    name: "Minimalist Ergonomic Smartwatch",
    category: "Electronics",
    price: 149.50,
    original_price: 179.99,
    rating: 4.7,
    reviews_count: 98,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    description: "Sleek all-day health tracker featuring heart rate monitoring, sleep analysis, AMOLED display, and 7-day battery standby.",
    stock: 42,
    badge: "Hot"
  },
  {
    name: "Classic Chronograph Leather Watch",
    category: "Accessories",
    price: 129.00,
    original_price: 160.00,
    rating: 4.9,
    reviews_count: 76,
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted genuine leather timepiece with Japanese quartz movement, sapphire glass, and 50m water resistance.",
    stock: 20,
    badge: "Featured"
  },
  {
    name: "Retro Mechanical Keyboard",
    category: "Electronics",
    price: 119.99,
    original_price: 139.99,
    rating: 4.6,
    reviews_count: 115,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    description: "Custom mechanical keyboard with tactile brown switches, wireless Bluetooth connectivity, and soft RGB backlighting.",
    stock: 18,
    badge: "New"
  },
  {
    name: "Vintage Canvas Urban Backpack",
    category: "Fashion",
    price: 69.99,
    original_price: 89.99,
    rating: 4.5,
    reviews_count: 64,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    description: "Durable water-resistant canvas backpack with dedicated 15.6-inch laptop compartment, leather straps, and multiple organizer pockets.",
    stock: 50,
    badge: "Popular"
  },
  {
    name: "Handcrafted Ceramic Pour-Over Set",
    category: "Home & Living",
    price: 45.00,
    original_price: 55.00,
    rating: 4.8,
    reviews_count: 53,
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    description: "Artisan matte ceramic dripper and heat-resistant glass carafe designed for brewing the ultimate single-origin cup of coffee.",
    stock: 30,
    badge: "Best Seller"
  },
  {
    name: "Premium Polarized Sunglasses",
    category: "Accessories",
    price: 79.00,
    original_price: 99.00,
    rating: 4.6,
    reviews_count: 82,
    image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    description: "Timeless aviator styling with 100% UV400 polarized lenses and lightweight stainless steel frames for all-day comfort.",
    stock: 25,
    badge: "Sale"
  },
  {
    name: "Cozy Cotton Knit Hoodie",
    category: "Fashion",
    price: 54.95,
    original_price: 69.95,
    rating: 4.7,
    reviews_count: 90,
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    description: "Ultra-soft 100% organic brushed cotton pullover hoodie designed with relaxed tailoring and ribbed cuffs.",
    stock: 60,
    badge: "Trending"
  },
  {
    name: "Portable Bluetooth Travel Speaker",
    category: "Electronics",
    price: 89.99,
    original_price: 109.99,
    rating: 4.7,
    reviews_count: 130,
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    description: "Compact IP67 waterproof speaker with 360-degree deep bass sound, 20-hour playback, and built-in lanyard for outdoor adventures.",
    stock: 40,
    badge: "Hot"
  },
  {
    name: "Aroma Ultrasonic Essential Oil Diffuser",
    category: "Home & Living",
    price: 39.99,
    original_price: 49.99,
    rating: 4.5,
    reviews_count: 47,
    image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    description: "Whisper-quiet ceramic aromatherapy diffuser with ambient warm LED lighting, automatic shut-off, and mist timer settings.",
    stock: 35,
    badge: "New"
  },
  {
    name: "Heritage Denim Trucker Jacket",
    category: "Fashion",
    price: 89.00,
    original_price: 115.00,
    rating: 4.8,
    reviews_count: 71,
    image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    description: "Rugged vintage wash denim jacket made from heavy-weight raw selvedge cotton with brass button detailing.",
    stock: 22,
    badge: "Featured"
  },
  {
    name: "Stainless Steel Insulated Water Bottle",
    category: "Home & Living",
    price: 29.50,
    original_price: 35.00,
    rating: 4.9,
    reviews_count: 160,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    description: "Double-walled vacuum insulated 750ml flask keeping drinks ice cold for 24 hours or steaming hot for 12 hours.",
    stock: 80,
    badge: "Best Seller"
  }
];

function seedProductsIfEmpty() {
  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error("Error checking products table:", err.message);
      return;
    }
    if (row.count === 0) {
      console.log("Seeding initial products into database...");
      const stmt = db.prepare(`
        INSERT INTO products (name, category, price, original_price, rating, reviews_count, image_url, description, stock, badge)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleProducts.forEach((p) => {
        stmt.run(
          p.name,
          p.category,
          p.price,
          p.original_price,
          p.rating,
          p.reviews_count,
          p.image_url,
          p.description,
          p.stock,
          p.badge
        );
      });
      stmt.finalize();
      console.log(`Seeded ${sampleProducts.length} products successfully.`);
    } else {
      console.log(`Products table already contains ${row.count} items.`);
    }
  });
}

module.exports = { seedProductsIfEmpty };
