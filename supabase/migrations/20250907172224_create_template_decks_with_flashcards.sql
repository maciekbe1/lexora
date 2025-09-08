-- Create template decks with flashcards and Unsplash images
-- This migration creates predefined learning decks for multiple languages

-- English Basics Decks
INSERT INTO template_decks (id, name, description, language, difficulty_level, flashcard_count, tags, cover_image_url, is_active, created_by, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'English Basics - Animals', 'Learn basic animal names in English', 'en', 1, 10, ARRAY['basics', 'animals', 'beginner'], 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'English Basics - Colors', 'Learn basic colors in English', 'en', 1, 8, ARRAY['basics', 'colors', 'beginner'], 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'English Basics - Food', 'Learn basic food names in English', 'en', 1, 12, ARRAY['basics', 'food', 'beginner'], 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Podstawy Polskiego - Zwierzęta', 'Naucz się podstawowych nazw zwierząt po polsku', 'pl', 1, 10, ARRAY['podstawy', 'zwierzęta', 'początkujący'], 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Español Básico - Animales', 'Aprende nombres básicos de animales en español', 'es', 1, 10, ARRAY['básico', 'animales', 'principiante'], 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop', true, 'system', NOW(), NOW());

-- ENGLISH ANIMALS FLASHCARDS
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cat', 'A small domesticated carnivorous mammal', 1, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Dog', 'A domesticated carnivorous mammal', 2, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Bird', 'A warm-blooded egg-laying vertebrate with feathers', 3, 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Fish', 'A limbless cold-blooded vertebrate animal with gills', 4, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Horse', 'A large plant-eating domesticated mammal', 5, 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Cow', 'A large domesticated ungulate mammal', 6, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'Elephant', 'A large mammal with a trunk', 7, 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Lion', 'A large tawny-colored cat that lives in Africa', 8, 'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'Bear', 'A large heavy mammal that walks on the soles of its feet', 9, 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Rabbit', 'A small mammal with long ears and a short tail', 10, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop', NOW(), NOW());

-- ENGLISH COLORS FLASHCARDS  
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Red', 'The color of blood or fire', 1, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Blue', 'The color of the sky or sea', 2, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'Green', 'The color of grass or leaves', 3, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'Yellow', 'The color of the sun or lemons', 4, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'Orange', 'The color between red and yellow', 5, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&sat=-100&hue=30', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440002', 'Purple', 'The color between red and blue', 6, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&sat=-100&hue=270', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440002', 'Black', 'The darkest color', 7, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&sat=-100&bright=-50', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440002', 'White', 'The lightest color', 8, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&sat=-100&bright=50', NOW(), NOW());

-- ENGLISH FOOD FLASHCARDS
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440003', 'Apple', 'A round fruit with red or green skin', 1, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', 'Banana', 'A long curved yellow fruit', 2, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', 'Orange', 'A round citrus fruit', 3, 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'Bread', 'A staple food made from flour and water', 4, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440003', 'Milk', 'A white liquid produced by mammals', 5, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440003', 'Egg', 'An oval object laid by birds', 6, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'Cheese', 'A dairy product made from milk', 7, 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440003', 'Meat', 'The flesh of an animal used as food', 8, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440003', 'Rice', 'Grains used as a staple food', 9, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440003', 'Water', 'A transparent liquid essential for life', 10, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440003', 'Coffee', 'A hot drink made from coffee beans', 11, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 'Tea', 'A hot drink made by infusing leaves', 12, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop', NOW(), NOW());

-- POLISH ANIMALS FLASHCARDS
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440004', 'Kot', 'Mały udomowiony ssak mięsożerny', 1, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440004', 'Pies', 'Udomowiony ssak mięsożerny', 2, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440004', 'Ptak', 'Ciepłokrwisty kręgowiec składający jaja z piórami', 3, 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440004', 'Ryba', 'Zimnokrwisty kręgowiec bez kończyn z skrzelami', 4, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440004', 'Koń', 'Duży udomowiony ssak roślinożerny', 5, 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440004', 'Krowa', 'Duży udomowiony ssak kopytny', 6, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440004', 'Słoń', 'Duży ssak z trąbą', 7, 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440004', 'Lew', 'Duży płowy kot żyjący w Afryce', 8, 'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440004', 'Niedźwiedź', 'Duży ciężki ssak chodzący na podeszwach', 9, 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440004', 'Królik', 'Mały ssak z długimi uszami i krótkim ogonem', 10, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop', NOW(), NOW());

-- SPANISH ANIMALS FLASHCARDS
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440005', 'Gato', 'Un pequeño mamífero carnívoro domesticado', 1, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440005', 'Perro', 'Un mamífero carnívoro domesticado', 2, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440005', 'Pájaro', 'Un vertebrado de sangre caliente que pone huevos con plumas', 3, 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440005', 'Pez', 'Un vertebrado de sangre fría sin extremidades con branquias', 4, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440005', 'Caballo', 'Un mamífero grande domesticado que come plantas', 5, 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440005', 'Vaca', 'Un mamífero ungulado grande domesticado', 6, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440005', 'Elefante', 'Un mamífero grande con trompa', 7, 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440005', 'León', 'Un gato grande de color leonado que vive en África', 8, 'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440005', 'Oso', 'Un mamífero grande y pesado que camina sobre las plantas de los pies', 9, 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440005', 'Conejo', 'Un mamífero pequeño con orejas largas y cola corta', 10, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop', NOW(), NOW());