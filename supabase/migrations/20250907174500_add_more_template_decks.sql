-- Add more comprehensive template decks with flashcards
-- This migration adds additional template decks including Business English

-- More English Template Decks
INSERT INTO template_decks (id, name, description, language, difficulty_level, flashcard_count, tags, cover_image_url, is_active, created_by, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', 'Business English', 'Essential business vocabulary and phrases', 'en', 3, 15, ARRAY['business', 'professional', 'intermediate'], 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'English Phrasal Verbs', 'Common phrasal verbs used in daily conversation', 'en', 4, 20, ARRAY['phrasal', 'verbs', 'advanced'], 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop', true, 'system', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'Travel English', 'Useful phrases for traveling', 'en', 2, 12, ARRAY['travel', 'vacation', 'intermediate'], 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop', true, 'system', NOW(), NOW());

-- BUSINESS ENGLISH FLASHCARDS
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440010', 'Meeting', 'A formal gathering of people to discuss business', 1, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440010', 'Deadline', 'The latest time or date by which something should be completed', 2, 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440010', 'Presentation', 'A formal talk about a particular topic', 3, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440010', 'Budget', 'An estimate of income and expenditure', 4, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440010', 'Contract', 'A written or spoken agreement', 5, 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440010', 'Revenue', 'Income generated from business operations', 6, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440010', 'Client', 'A person or organization using the services', 7, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440010', 'Proposal', 'A formal suggestion or plan', 8, 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440010', 'Invoice', 'A bill for goods or services provided', 9, 'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440010', 'Profit', 'Financial gain from business operations', 10, 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440010', 'Strategy', 'A plan of action designed to achieve goals', 11, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440010', 'Networking', 'Building professional relationships', 12, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440010', 'Partnership', 'A business relationship between two parties', 13, 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440010', 'Investment', 'Money committed to gain financial returns', 14, 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440010', 'Market Research', 'Gathering information about market conditions', 15, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', NOW(), NOW());

-- PHRASAL VERBS FLASHCARDS
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440011', 'Give up', 'To stop trying or quit', 1, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440011', 'Look after', 'To take care of someone or something', 2, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440011', 'Put off', 'To postpone or delay', 3, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440011', 'Turn on', 'To start or activate something', 4, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440011', 'Get along', 'To have a good relationship with someone', 5, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440011', 'Run out of', 'To use up all of something', 6, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440011', 'Break down', 'To stop working (machine) or become emotional', 7, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440011', 'Set up', 'To establish or arrange something', 8, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440011', 'Come across', 'To find or encounter by chance', 9, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440011', 'Pick up', 'To collect or learn something quickly', 10, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440011', 'Call off', 'To cancel something', 11, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440011', 'Fill in', 'To complete a form or substitute for someone', 12, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440011', 'Work out', 'To exercise or solve a problem', 13, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440011', 'Take off', 'To remove or become successful quickly', 14, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440011', 'Bring up', 'To raise or mention a topic', 15, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440011', 'Go through', 'To experience or examine carefully', 16, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440011', 'Make up', 'To invent a story or reconcile after an argument', 17, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440011', 'Show up', 'To appear or arrive', 18, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440011', 'Cut down', 'To reduce the amount of something', 19, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440219', '550e8400-e29b-41d4-a716-446655440011', 'Look forward to', 'To anticipate with pleasure', 20, NOW(), NOW());

-- TRAVEL ENGLISH FLASHCARDS
INSERT INTO template_flashcards (id, template_deck_id, front_text, back_text, position, front_image_url, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440012', 'Airport', 'A place where planes take off and land', 1, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440012', 'Hotel', 'A place providing accommodation for travelers', 2, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440012', 'Passport', 'Official document for international travel', 3, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440012', 'Ticket', 'A document allowing travel or entry', 4, 'https://images.unsplash.com/photo-1544077960-604201fe74bc?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440012', 'Luggage', 'Suitcases and bags for travel', 5, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440012', 'Restaurant', 'A place where meals are served', 6, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440012', 'Taxi', 'A vehicle for hire with driver', 7, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440307', '550e8400-e29b-41d4-a716-446655440012', 'Map', 'A drawing showing geographical features', 8, 'https://images.unsplash.com/photo-1597149960988-aa56d20a6e36?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440308', '550e8400-e29b-41d4-a716-446655440012', 'Currency', 'The money used in a particular country', 9, 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440012', 'Tourist', 'A person visiting a place for pleasure', 10, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440012', 'Souvenir', 'A memento of a visit to a place', 11, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440311', '550e8400-e29b-41d4-a716-446655440012', 'Vacation', 'A period of leisure away from work', 12, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', NOW(), NOW());