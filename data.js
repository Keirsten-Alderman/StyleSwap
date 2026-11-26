// Fictional sample inventory for the StyleSwap student prototype.
const STARTUP = {
  name: "StyleSwap",
  tagline: "Rent it, Swap it, Love it",
  pitch: "Borrow a little confidence, swap something you love, and find your next favorite outfit right here on campus."
};

const LISTINGS = [
  { id: 1, name: "The Sunday Trench", category: "Outerwear", description: "Soft, oversized and perfect for a rainy coffee run.", type: "Rental", size: "M", price: 6, owner: "Jamie", emoji: "🧥", image: "images/listings/sunday-trench.jpg", art: "lilac" },
  { id: 2, name: "Cherry Knit", category: "Tops", description: "A cozy little red cardigan with vintage buttons.", type: "Swap", size: "S", price: null, owner: "Morgan", emoji: "🧶", image: "images/listings/cherry-knit.jpg", art: "rose" },
  { id: 3, name: "After Hours Dress", category: "Dresses", description: "A satin slip dress made for a night worth remembering.", type: "Rental", size: "S", price: 8, owner: "Avery", emoji: "👗", image: "images/listings/after-hours-dress.jpg", art: "peach" },
  { id: 4, name: "Good Day Denim", category: "Bottoms", description: "Broken-in straight-leg jeans with plenty of life left.", type: "Swap", size: "M", price: null, owner: "Riley", emoji: "👖", image: "images/listings/good-day-denim.jpg", art: "sky" },
  { id: 5, name: "Tiny Treasure Bag", category: "Accessories", description: "A tiny beaded bag that makes every outfit a little happier.", type: "Rental", size: "One size", price: 4, owner: "Casey", emoji: "👜", image: "images/listings/tiny-treasure-bag.jpg", art: "butter" },
  { id: 6, name: "Cloud Nine Sneakers", category: "Shoes", description: "Comfy white sneakers, cleaned up and ready to roam.", type: "Rental", size: "M", price: 5, owner: "Quinn", emoji: "👟", image: "images/listings/cloud-nine-sneakers.jpg", art: "sage" },
  { id: 7, name: "Sunday Market Blazer", category: "Outerwear", description: "A relaxed-fit blazer that means business (or brunch).", type: "Swap", size: "L", price: null, owner: "Taylor", emoji: "🧥", image: "images/listings/sunday-market-blazer.jpg", art: "butter" },
  { id: 8, name: "Little Wildflower Top", category: "Tops", description: "A light, floral top for sunny walks between classes.", type: "Rental", size: "XS", price: 4, owner: "Jordan", emoji: "👚", image: "images/listings/little-wildflower-top.jpg", art: "rose" },
  { id: 9, name: "Weekend Wrap", category: "Dresses", description: "A breezy wrap dress that can go from day to dinner.", type: "Swap", size: "M", price: null, owner: "Sam", emoji: "👗", image: "images/listings/weekend-wrap.jpg", art: "lilac" },
  { id: 10, name: "Golden Hour Scarf", category: "Accessories", description: "A soft, sunny scarf that's been on many adventures.", type: "Rental", size: "One size", price: 3, owner: "Drew", emoji: "🧣", image: "images/listings/golden-hour-scarf.jpg", art: "peach" },
  { id: 11, name: "Campus Classic Loafers", category: "Shoes", description: "Polished loafers for presentations and everywhere after.", type: "Rental", size: "S", price: 6, owner: "Blair", emoji: "👞", image: "images/listings/campus-classic-loafers.jpg", art: "sky" },
  { id: 12, name: "The Comfy Cord", category: "Bottoms", description: "Soft corduroy trousers with a high waist and roomy pockets.", type: "Swap", size: "L", price: null, owner: "Emery", emoji: "👖", image: "images/listings/comfy-cord.jpg", art: "sage" }
];
