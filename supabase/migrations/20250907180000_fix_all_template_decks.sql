-- Complete fix for all template decks and flashcards
-- This migration cleans up and recreates all template content

-- 1. Clean up old data
DELETE FROM template_flashcards;
DELETE FROM template_decks;

-- 2. Create proper template decks
INSERT INTO template_decks (id, name, description, language, difficulty_level, flashcard_count, tags, cover_image_url, is_active, created_by, created_at, updated_at)
VALUES 
  -- English decks
  ('550e8400-e29b-41d4-a716-446655440001', 'English Basics - Animals', 'Learn basic animal names in English with Polish translations', 'en', 1, 10, ARRAY['basics', 'animals', 'beginner'], 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'English Basics - Colors', 'Learn basic colors in English with Polish translations', 'en', 1, 8, ARRAY['basics', 'colors', 'beginner'], 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'English Basics - Food', 'Learn basic food names in English with Polish translations', 'en', 1, 12, ARRAY['basics', 'food', 'beginner'], 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440010', 'Business English', 'Essential business vocabulary and phrases', 'en', 3, 15, ARRAY['business', 'professional', 'intermediate'], 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'English Phrasal Verbs', 'Common phrasal verbs used in daily conversation', 'en', 4, 20, ARRAY['phrasal', 'verbs', 'advanced'], 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'Travel English', 'Useful phrases for traveling', 'en', 2, 12, ARRAY['travel', 'vacation', 'intermediate'], 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  
  -- Polish decks
  ('550e8400-e29b-41d4-a716-446655440004', 'Podstawy Polskiego - Zwierzęta', 'Naucz się podstawowych nazw zwierząt po polsku', 'pl', 1, 10, ARRAY['podstawy', 'zwierzęta', 'początkujący'], 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  
  -- Spanish decks  
  ('550e8400-e29b-41d4-a716-446655440005', 'Español Básico - Animales', 'Aprende nombres básicos de animales en español', 'es', 1, 10, ARRAY['básico', 'animales', 'principiante'], 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop', true, 'system', NOW(), NOW());

-- 3. Create flashcards with CORRECT translations

-- ENGLISH ANIMALS (EN → PL)
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cat', 'Kot', 1, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Dog', 'Pies', 2, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Bird', 'Ptak', 3, 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Fish', 'Ryba', 4, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Horse', 'Koń', 5, 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Cow', 'Krowa', 6, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'Elephant', 'Słoń', 7, 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Lion', 'Lew', 8, 'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'Bear', 'Niedźwiedź', 9, 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Rabbit', 'Królik', 10, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop', NOW(), NOW());

-- ENGLISH COLORS (EN → PL)
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Red', 'Czerwony', 1, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Blue', 'Niebieski', 2, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'Green', 'Zielony', 3, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'Yellow', 'Żółty', 4, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'Orange', 'Pomarańczowy', 5, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440002', 'Purple', 'Fioletowy', 6, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440002', 'Black', 'Czarny', 7, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440002', 'White', 'Biały', 8, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW());

-- ENGLISH FOOD (EN → PL)
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440003', 'Apple', 'Jabłko', 1, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', 'Banana', 'Banan', 2, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', 'Orange', 'Pomarańcza', 3, 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'Bread', 'Chleb', 4, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440003', 'Milk', 'Mleko', 5, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440003', 'Egg', 'Jajko', 6, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'Cheese', 'Ser', 7, 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440003', 'Meat', 'Mięso', 8, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440003', 'Rice', 'Ryż', 9, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440003', 'Water', 'Woda', 10, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440003', 'Coffee', 'Kawa', 11, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 'Tea', 'Herbata', 12, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop', NOW(), NOW());

-- BUSINESS ENGLISH (EN → PL)
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440010', 'Meeting', 'Spotkanie', 1, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440010', 'Deadline', 'Termin', 2, 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440010', 'Presentation', 'Prezentacja', 3, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440010', 'Budget', 'Budżet', 4, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440010', 'Contract', 'Kontrakt', 5, 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440010', 'Revenue', 'Przychód', 6, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440010', 'Client', 'Klient', 7, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440010', 'Proposal', 'Propozycja', 8, 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440010', 'Invoice', 'Faktura', 9, 'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440010', 'Profit', 'Zysk', 10, 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440010', 'Strategy', 'Strategia', 11, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440010', 'Networking', 'Networking', 12, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440010', 'Partnership', 'Partnerstwo', 13, 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440010', 'Investment', 'Inwestycja', 14, 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440010', 'Market Research', 'Badanie rynku', 15, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', NOW(), NOW());

-- PHRASAL VERBS (EN → PL)
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440011', 'Give up', 'Poddać się', 1, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440011', 'Look after', 'Opiekować się', 2, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440011', 'Put off', 'Odkładać', 3, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440011', 'Turn on', 'Włączać', 4, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440011', 'Get along', 'Dogadywać się', 5, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440011', 'Run out of', 'Kończyć się', 6, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440011', 'Break down', 'Zepsuć się', 7, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440011', 'Set up', 'Ustanawiać', 8, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440011', 'Come across', 'Natknąć się', 9, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440011', 'Pick up', 'Podnosić', 10, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440011', 'Call off', 'Odwołać', 11, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440011', 'Fill in', 'Wypełniać', 12, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440011', 'Work out', 'Ćwiczyć', 13, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440011', 'Take off', 'Zdejmować', 14, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440011', 'Bring up', 'Wychowywać', 15, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440011', 'Go through', 'Przechodzić przez', 16, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440011', 'Make up', 'Wymyślać', 17, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440011', 'Show up', 'Pojawić się', 18, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440011', 'Cut down', 'Zmniejszać', 19, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440219', '550e8400-e29b-41d4-a716-446655440011', 'Look forward to', 'Oczekiwać', 20, NOW(), NOW());

-- TRAVEL ENGLISH (EN → PL)
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440012', 'Airport', 'Lotnisko', 1, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440012', 'Hotel', 'Hotel', 2, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440012', 'Passport', 'Paszport', 3, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440012', 'Ticket', 'Bilet', 4, 'https://images.unsplash.com/photo-1544077960-604201fe74bc?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440012', 'Luggage', 'Bagaż', 5, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440012', 'Restaurant', 'Restauracja', 6, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440012', 'Taxi', 'Taksówka', 7, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440307', '550e8400-e29b-41d4-a716-446655440012', 'Map', 'Mapa', 8, 'https://images.unsplash.com/photo-1597149960988-aa56d20a6e36?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440308', '550e8400-e29b-41d4-a716-446655440012', 'Currency', 'Waluta', 9, 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440012', 'Tourist', 'Turysta', 10, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440012', 'Souvenir', 'Pamiątka', 11, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440311', '550e8400-e29b-41d4-a716-446655440012', 'Vacation', 'Wakacje', 12, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', NOW(), NOW());