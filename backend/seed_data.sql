-- ============================================================
-- seed_data.sql  -  FanFinity Database Seed Data
-- Inserts categories and products for:
--   • Movies        (category_id = 4)
--   • Series        (category_id = 5)
--   • Movies&Series (category_id = 9 — combined parent category)
-- Run AFTER schema.sql
-- ============================================================

BEGIN;

-- ============================================================
-- CATEGORIES
-- ============================================================
-- Top-level categories
INSERT INTO categories (category_id, category_name, parent_id) VALUES
    (1,  'Anime',          NULL),
    (2,  'Games',          NULL),
    (3,  'K-Pop',          NULL),
    (4,  'Movies',         NULL),
    (5,  'Series',         NULL),
    (6,  'Music',          NULL),
    (7,  'Pop',            NULL),
    (9,  'Movies & Series',NULL);   -- combined umbrella category

-- ============================================================
-- PRODUCTS — MOVIES  (category_id = 4)
-- ============================================================

INSERT INTO products (product_id, product_name, category_id, short_description, specifications, ideal_for, price, mrp, stock_quantity, image_url, is_active) VALUES

(401,
 'Marvel Avengers Assemble Framed Poster',
 4,
 'High-resolution A3 movie poster in a premium matte black frame. Ready to hang straight out of the box. Features the iconic Avengers Assemble artwork from the MCU.',
 'Size: A3 (29.7 x 42 cm) | Frame: Matte Black | Print: 180 GSM glossy paper | Mounting: Keyhole bracket included',
 'Marvel fans, MCU collectors, home theatre décor, gifting',
 1299.00, 1799.00, 20,
 'images/products/movies/1.jpg',
 TRUE),

(402,
 'Batman Dark Knight Heat-Reactive Mug',
 4,
 'Magic mug that reveals the Batman logo when hot liquid is added. Completely plain black when cold — a subtle daily-use collectible for Dark Knight fans.',
 'Capacity: 350 ml | Effect: Heat-reactive print (reveals logo above 45 °C) | Material: Ceramic | Care: Hand wash only | Colour: Black',
 'Batman fans, DC collectors, office use, gifting',
 749.00, 1099.00, 35,
 'images/products/movies/2.jpg',
 TRUE),

(403,
 'Harry Potter Hogwarts Acceptance Letter Replica',
 4,
 'Screen-accurate replica of the Hogwarts acceptance letter. Printed on aged parchment paper with an authentic-style red wax seal and a green envelope with hand-addressed styling.',
 'Paper: Aged parchment, A4 tri-fold | Seal: Red wax, Hogwarts crest | Envelope: Green with address typography | Pack: Comes in protective sleeve',
 'Harry Potter fans, collectors, cosplay props, gifting',
 599.00, 899.00, 45,
 'images/products/movies/3.jpg',
 TRUE),

(404,
 'Iron Man Arc Reactor Prop Replica',
 4,
 'Light-up arc reactor prop replica inspired by the MCU Iron Man suit. Features a steady LED glow effect, perfect for cosplay, desk display, or as a statement piece.',
 'Diameter: 8 cm | Depth: 2.5 cm | Power: 3x AAA batteries (included) | Light: White LED glow | Material: ABS plastic shell',
 'Iron Man fans, cosplay, MCU collectors, desk display',
 1499.00, 2099.00, 18,
 'images/products/movies/4.jpg',
 TRUE),

(405,
 'The Dark Knight Joker Playing Cards',
 4,
 'Custom-designed playing card deck with Joker-themed artwork inspired by The Dark Knight. Full standard deck with casino-grade finish.',
 'Cards: 54 (52 standard + 2 Joker cards) | Size: Standard poker (63 x 88 mm) | Material: Casino-grade linen finish paper | Packaging: Tuck box with Joker artwork',
 'DC fans, card game enthusiasts, collectors, gifting',
 399.00, 599.00, 60,
 'images/products/movies/5.jpg',
 TRUE);


-- ============================================================
-- PRODUCTS — SERIES  (category_id = 5)
-- ============================================================

INSERT INTO products (product_id, product_name, category_id, short_description, specifications, ideal_for, price, mrp, stock_quantity, image_url, is_active) VALUES

(501,
 'Stranger Things Hawkins Lab Mug',
 5,
 'Official Stranger Things ceramic mug featuring the Hawkins National Laboratory logo. A perfect companion for your morning Upside-Down adventures.',
 'Capacity: 350 ml | Design: Hawkins National Laboratory logo | Material: Ceramic | Care: Microwave and dishwasher safe | Colour: Off-white with red print',
 'Stranger Things fans, Netflix fans, home and office use, gifting',
 599.00, 899.00, 35,
 'images/products/series/1.jpg',
 TRUE),

(502,
 'Breaking Bad Los Pollos Hermanos T-Shirt',
 5,
 'High-quality unisex regular-fit tee with the iconic Los Pollos Hermanos restaurant logo from Breaking Bad. A must-have for any fan of the series.',
 'Fabric: 100% Cotton, 180 GSM | Fit: Unisex regular fit | Sizes: S, M, L, XL, XXL | Print: Screen-printed Los Pollos Hermanos logo | Colour: White',
 'Breaking Bad fans, streetwear, casual gifting',
 899.00, 1299.00, 40,
 'images/products/series/2.jpg',
 TRUE),

(503,
 'Game of Thrones House Stark Wall Art',
 5,
 'Laser-cut MDF wall art of the House Stark direwolf sigil from Game of Thrones. A stunning piece for any fan''s room or gaming den.',
 'Size: 30 x 30 cm | Thickness: 6 mm | Material: MDF, laser-cut, natural finish | Mounting: Keyhole slot on reverse | Colour: Natural wood',
 'Game of Thrones fans, home décor, gifting',
 1499.00, 2099.00, 18,
 'images/products/series/3.jpg',
 TRUE),

(504,
 'Friends Central Perk Coffee Mug',
 5,
 'Classic Friends TV show Central Perk café mug. Perfect for your morning coffee, a nostalgic display piece, or as a gift for any Friends fan.',
 'Capacity: 350 ml | Design: Central Perk logo | Material: Ceramic | Care: Dishwasher safe | Colour: White with brown/green print',
 'Friends fans, TV series enthusiasts, home and office use, gifting',
 549.00, 799.00, 55,
 'images/products/series/4.jpg',
 TRUE),

(505,
 'The Office Dunder Mifflin Canvas Tote Bag',
 5,
 'Spacious eco-friendly canvas tote bag with the Dunder Mifflin Paper Company logo from The Office. Ideal for daily use or as a quirky fan gift.',
 'Size: 38 x 42 cm | Handle drop: 30 cm | Material: Canvas cotton, 12 oz | Print: Screen-printed Dunder Mifflin logo | Colour: Natural canvas with black print',
 'The Office fans, daily carry, eco-conscious shoppers, gifting',
 499.00, 799.00, 42,
 'images/products/series/5.jpg',
 TRUE);


-- ============================================================
-- PRODUCTS — MOVIES & SERIES  (category_id = 9)
-- Combined category: cross-listed fan merchandise that spans
-- both cinematic releases and TV/streaming series universes.
-- ============================================================

INSERT INTO products (product_id, product_name, category_id, short_description, specifications, ideal_for, price, mrp, stock_quantity, image_url, is_active) VALUES

(901,
 'Marvel Universe Collector Enamel Pin Set (Movies + Series)',
 9,
 'Set of 8 hard enamel collector pins covering iconic characters from both MCU movies and Disney+ series — including Iron Man, Thor, Loki, Wanda, and more.',
 'Contents: 8 hard enamel pins | Size: 3–4 cm each | Finish: Gold plated with black nickel details | Clasp: Rubber butterfly | Packaging: Illustrated collector card backing',
 'MCU fans, pin collectors, cosplay accessories, gifting',
 1199.00, 1699.00, 30,
 'images/products/movies/1.jpg',
 TRUE),

(902,
 'Breaking Bad & Better Call Saul Double-Sided Poster',
 9,
 'Premium double-sided A2 poster featuring Breaking Bad on one side and Better Call Saul on the other. Printed on 200 GSM matte art paper for rich colour reproduction.',
 'Size: A2 (42 x 59.4 cm) | Sides: Double-sided print | Material: 200 GSM matte art paper | Packaging: Rolled in protective tube | Colour: Full colour',
 'Breaking Bad fans, Better Call Saul fans, home décor, gifting',
 799.00, 1199.00, 25,
 'images/products/series/2.jpg',
 TRUE),

(903,
 'Harry Potter & Fantastic Beasts Washi Tape Set',
 9,
 'Set of 6 decorative washi tapes featuring artwork from both the Harry Potter film series and the Fantastic Beasts spin-off films. Perfect for journaling, scrapbooking, and decorating.',
 'Contents: 6 washi tape rolls | Width: 15 mm each | Length: 5 m per roll | Design: Mix of HP and Fantastic Beasts characters and motifs | Material: Japanese washi paper',
 'Harry Potter fans, journaling enthusiasts, crafters, gifting',
 549.00, 849.00, 50,
 'images/products/movies/3.jpg',
 TRUE),

(904,
 'DC Universe Framed Art Print Set — Movies & Series',
 9,
 'Set of 3 premium A4 art prints from the DC universe covering films and series: The Dark Knight, Aquaman, and Peacemaker. Each is framed in a slim black frame.',
 'Contents: 3 framed A4 prints | Size: A4 (21 x 29.7 cm) each | Frame: Slim matte black | Print: 180 GSM gloss | Mounting: Keyhole bracket per frame',
 'DC fans, home theatre décor, collectors, gifting',
 1799.00, 2499.00, 15,
 'images/products/movies/1.jpg',
 TRUE),

(905,
 'Stranger Things x Netflix Fan Bundle — Mug + Poster + Patch',
 9,
 'All-in-one fan bundle combining the Stranger Things Hawkins Lab mug, a Stranger Things Season 4 A3 poster, and an embroidered Demogorgon iron-on patch. Packaged in a gift box.',
 'Bundle contents: 1x Hawkins Lab ceramic mug (350 ml) | 1x A3 Season 4 poster (180 GSM gloss) | 1x Embroidered Demogorgon patch (8 cm) | Packaging: Printed gift box',
 'Stranger Things fans, complete gifting solution, collectors',
 1499.00, 2199.00, 20,
 'images/products/series/1.jpg',
 TRUE),

(906,
 'Game of Thrones + House of the Dragon Sigil Sticker Pack',
 9,
 'Pack of 20 premium vinyl stickers featuring house sigils, quotes, and iconic imagery from both Game of Thrones and its prequel series House of the Dragon.',
 'Contents: 20 vinyl stickers | Sizes: Various, 4–9 cm | Material: Waterproof vinyl, UV-resistant | Application: Suitable for laptops, water bottles, notebooks | Finish: Gloss and matte mix',
 'GoT fans, House of the Dragon fans, laptop decoration, gifting',
 399.00, 599.00, 70,
 'images/products/series/3.jpg',
 TRUE),

(907,
 'The Office + Parks & Recreation Combo Mug Set',
 9,
 'Set of 2 ceramic mugs — one with the Dunder Mifflin logo (The Office) and one with the Pawnee City seal (Parks & Recreation). The ultimate NBC comedy fan gift.',
 'Contents: 2 ceramic mugs | Capacity: 350 ml each | Design: Dunder Mifflin + Pawnee City Seal | Care: Dishwasher safe | Packaging: Pair gift box',
 'The Office fans, Parks and Rec fans, combo gifting, office desk',
 999.00, 1499.00, 28,
 'images/products/series/4.jpg',
 TRUE),

(908,
 'MCU Phase 1–3 Timeline Infographic Poster',
 9,
 'Detailed illustrated timeline poster covering all MCU Phase 1 to Phase 3 films and their interconnected storylines. A collector-grade display piece for any Marvel fan.',
 'Size: A1 (59.4 x 84.1 cm) | Material: 200 GSM matte art paper | Design: Illustrated chronological timeline with key story beats | Packaging: Rolled in protective tube',
 'MCU fans, home theatre décor, collectors, gifting',
 999.00, 1499.00, 22,
 'images/products/movies/1.jpg',
 TRUE);


-- ============================================================
-- PRODUCT KEYWORDS — MOVIES (category_id = 4)
-- ============================================================

INSERT INTO product_keywords (product_id, keyword) VALUES
-- 401 Avengers Poster
(401, 'marvel'), (401, 'avengers'), (401, 'mcu'), (401, 'poster'), (401, 'framed'), (401, 'superhero'), (401, 'wall art'),
-- 402 Batman Mug
(402, 'batman'), (402, 'dark knight'), (402, 'dc'), (402, 'mug'), (402, 'heat reactive'), (402, 'magic mug'), (402, 'superhero'),
-- 403 HP Letter
(403, 'harry potter'), (403, 'hogwarts'), (403, 'letter'), (403, 'replica'), (403, 'prop'), (403, 'parchment'), (403, 'wax seal'),
-- 404 Arc Reactor
(404, 'iron man'), (404, 'arc reactor'), (404, 'marvel'), (404, 'mcu'), (404, 'prop'), (404, 'led'), (404, 'cosplay'),
-- 405 Joker Cards
(405, 'joker'), (405, 'batman'), (405, 'dark knight'), (405, 'playing cards'), (405, 'dc'), (405, 'card game'), (405, 'collectible');


-- ============================================================
-- PRODUCT KEYWORDS — SERIES (category_id = 5)
-- ============================================================

INSERT INTO product_keywords (product_id, keyword) VALUES
-- 501 Stranger Things Mug
(501, 'stranger things'), (501, 'hawkins'), (501, 'netflix'), (501, 'mug'), (501, 'sci-fi'), (501, 'tv series'), (501, 'upside down'),
-- 502 BB T-Shirt
(502, 'breaking bad'), (502, 'los pollos hermanos'), (502, 't-shirt'), (502, 'tshirt'), (502, 'amc'), (502, 'tv series'), (502, 'heisenberg'),
-- 503 GoT Wall Art
(503, 'game of thrones'), (503, 'house stark'), (503, 'direwolf'), (503, 'wall art'), (503, 'laser cut'), (503, 'hbo'), (503, 'got'),
-- 504 Friends Mug
(504, 'friends'), (504, 'central perk'), (504, 'mug'), (504, 'tv series'), (504, 'coffee'), (504, 'nbc'), (504, 'sitcom'),
-- 505 The Office Tote
(505, 'the office'), (505, 'dunder mifflin'), (505, 'tote bag'), (505, 'canvas'), (505, 'nbc'), (505, 'sitcom'), (505, 'eco friendly');


-- ============================================================
-- PRODUCT KEYWORDS — MOVIES & SERIES (category_id = 9)
-- ============================================================

INSERT INTO product_keywords (product_id, keyword) VALUES
-- 901 MCU Pin Set
(901, 'marvel'), (901, 'mcu'), (901, 'enamel pin'), (901, 'loki'), (901, 'wanda'), (901, 'iron man'), (901, 'disney+'), (901, 'avengers'),
-- 902 BB + BCS Poster
(902, 'breaking bad'), (902, 'better call saul'), (902, 'poster'), (902, 'amc'), (902, 'double sided'), (902, 'saul goodman'), (902, 'heisenberg'),
-- 903 HP Washi Tape
(903, 'harry potter'), (903, 'fantastic beasts'), (903, 'washi tape'), (903, 'journaling'), (903, 'scrapbook'), (903, 'craft'), (903, 'hogwarts'),
-- 904 DC Framed Set
(904, 'dc'), (904, 'dark knight'), (904, 'aquaman'), (904, 'peacemaker'), (904, 'framed print'), (904, 'wall art'), (904, 'dceu'),
-- 905 ST Bundle
(905, 'stranger things'), (905, 'bundle'), (905, 'gift set'), (905, 'netflix'), (905, 'mug'), (905, 'poster'), (905, 'demogorgon'),
-- 906 GoT + HotD Stickers
(906, 'game of thrones'), (906, 'house of the dragon'), (906, 'sticker pack'), (906, 'vinyl sticker'), (906, 'hbo'), (906, 'got'), (906, 'targaryen'),
-- 907 Office + Parks Mugs
(907, 'the office'), (907, 'parks and recreation'), (907, 'mug set'), (907, 'dunder mifflin'), (907, 'pawnee'), (907, 'nbc'), (907, 'combo gift'),
-- 908 MCU Timeline Poster
(908, 'marvel'), (908, 'mcu'), (908, 'timeline'), (908, 'phase 1'), (908, 'phase 2'), (908, 'phase 3'), (908, 'poster'), (908, 'infographic');


-- ============================================================
-- PRODUCT METRICS
-- ============================================================

INSERT INTO product_metrics (product_id, avg_rating, review_count) VALUES
-- Movies
(401, 4.6, 720),
(402, 4.5, 890),
(403, 4.8, 2100),
(404, 4.7, 650),
(405, 4.4, 980),
-- Series
(501, 4.5, 1100),
(502, 4.6, 760),
(503, 4.7, 540),
(504, 4.6, 2300),
(505, 4.4, 890),
-- Movies & Series
(901, 4.7, 410),
(902, 4.6, 290),
(903, 4.5, 360),
(904, 4.8, 180),
(905, 4.7, 520),
(906, 4.5, 640),
(907, 4.6, 310),
(908, 4.8, 470);

COMMIT;
