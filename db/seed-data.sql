SET NAMES utf8mb4;

INSERT INTO manufacturers (manufacturer_name) VALUES
('Intel'),
('AMD'),
('ASUS'),
('MSI'),
('Palit'),
('AsRock'),
('AFOX'),
('Biostar'),
('MAXSUN'),
('G.Skill'),
('SIN?TEX'),
('QUMO'),
('ADATA'),
('Formula'),
('Accord'),
('Chieftec'),
('Ocypus'),
('1STPLAYER'),
('4FAN'),
('FSP'),
('Samsung'),
('Digma'),
('Colorful'),
('ID-COOLING'),
('Thermalright'),
('LIAN LI'),
('JONSBO'),
('ARCTIC'),
('Gigabyte'),
('Kingston'),
('Corsair'),
('Seagate'),
('WD'),
('Noname'),
('Esonic');

INSERT INTO sockets (socket_name) VALUES
('LGA1851'),
('LGA1700'),
('LGA1200'),
('LGA1151v2'),
('LGA1151'),
('LGA1155'),
('LGA1156'),
('LGA775'),
('LGA2011'),
('LGA2011-3'),
('LGA2066'),
('sTR5'),
('AM5'),
('AM4'),
('FM2+');

INSERT INTO memory_types (type_name) VALUES
('DDR4'),
('DDR5'),
('DDR3');

INSERT INTO form_factors (factor_name) VALUES
('EATX'),
('ATX'),
('Micro-ATX'),
('Mini-ITX');

INSERT INTO psu_form_factors (factor_name) VALUES
('ATX'),
('SFX'),
('TFX');

INSERT INTO processors (model, manufacturer_id, socket_id, cores, threads, base_clock, boost_clock, tdp, integrated_gpu, memory_type_id, max_memory, power_consumption) VALUES
('Intel Core i5-12400F', 1, 2, 6, 12, 2.50, 4.40, 65, 0, 1, 128, 117),
('Intel Core i7-12700K', 1, 2, 12, 20, 3.60, 5.00, 125, 1, 1, 128, 190),
('AMD Ryzen 5 5600', 2, 14, 6, 12, 3.50, 4.40, 65, 0, 1, 128, 65),
('AMD Ryzen 7 5800X', 2, 14, 8, 16, 3.80, 4.70, 105, 0, 1, 128, 105),
('Intel Core i3-10100F', 1, 3, 4, 8, 3.60, 4.30, 65, 0, 1, 128, 65),
('AMD Ryzen 5 3400G', 2, 14, 4, 8, 3.70, 4.20, 65, 1, 1, 64, 65),
('Intel Core i3-10105', 1, 3, 4, 8, 3.70, 4.40, 65, 1, 1, 128, 65),
('AMD Athlon 3000G', 2, 14, 2, 4, 3.50, 3.50, 35, 1, 1, 64, 35),
('AMD A6-7480', 2, 15, 2, 2, 3.50, 3.80, 65, 1, 1, 64, 65),
('AMD Athlon X4 950', 2, 15, 4, 4, 3.50, 3.80, 65, 0, 1, 64, 65),
('AMD Athlon X2 450', 2, 15, 2, 2, 3.50, 3.80, 65, 0, 1, 64, 65),
('Intel Xeon E5 2650 V3', 1, 9, 10, 20, 2.30, 3.00, 105, 0, 1, 768, 105),
('Intel Xeon E5 2680 V2', 1, 9, 10, 20, 2.80, 3.60, 115, 0, 1, 768, 115),
('Intel Xeon E5 2667 V4', 1, 10, 8, 16, 3.20, 3.60, 135, 0, 1, 768, 135),
('Intel Core i5-650', 1, 7, 2, 2, 3.20, 3.46, 73, 1, 3, 16, 73);

INSERT INTO motherboards (model, manufacturer_id, socket_id, form_factor_id, chipset, memory_type_id, memory_slots, max_memory, memory_speed_max, sata_ports, m2_slots, pcie_slots, builtin_wifi, builtin_ethernet, integrated_cpu_model, integrated_cpu_description, has_integrated_cooling, cooling_description) VALUES
('MSI A520M-A PRO', 4, 14, 3, 'A520', 1, 4, 128, 4600, 4, 2, 2, 0, 1, NULL, NULL, 0, NULL),
('ASUS PRIME B660M-K D4', 3, 2, 3, 'B660', 1, 4, 128, 5333, 4, 2, 2, 0, 1, NULL, NULL, 0, NULL),
('ASRock B550M-HDV', 6, 14, 3, 'B550', 1, 4, 128, 4733, 4, 2, 2, 0, 1, NULL, NULL, 0, NULL),
('Esonic H55', 35, 7, 3, 'H55', 3, 2, 8, 1333, 4, 0, 1, 0, 1, NULL, NULL, 0, NULL),
('Biostar B760MZ-E PRO', 8, 2, 3, 'B760', 2, 4, 192, 7200, 4, 3, 2, 0, 1, NULL, NULL, 0, NULL),
('Gigabyte B650M D3HP', 29, 13, 3, 'B650', 2, 4, 128, 6400, 4, 2, 2, 0, 1, NULL, NULL, 0, NULL),
('Gigabyte Z790 EAGLE AX', 29, 2, 2, 'Z790', 2, 4, 192, 7600, 6, 4, 3, 1, 1, NULL, NULL, 0, NULL),
('ASRock H510M-HVS R2.0', 6, 3, 3, 'H510', 1, 2, 64, 3200, 4, 1, 1, 0, 1, NULL, NULL, 0, NULL),
('ASRock H610M-HVS', 6, 2, 3, 'H610', 1, 2, 64, 4800, 4, 1, 1, 0, 1, NULL, NULL, 0, NULL),
('MAXSUN Challenger B760M-N D5', 9, 2, 3, 'B760', 2, 4, 192, 7200, 4, 2, 2, 0, 1, NULL, NULL, 0, NULL),
('MAXSUN MS-eSport B650ITX WIFI ICE', 9, 13, 4, 'B650', 2, 2, 64, 6400, 4, 2, 1, 1, 1, NULL, NULL, 0, NULL),
('Gigabyte GA-A320M-H', 29, 14, 3, 'A320', 1, 2, 32, 2666, 4, 1, 1, 0, 1, NULL, NULL, 0, NULL),
('ASRock A320M-HDV R4.0', 6, 14, 3, 'A320', 1, 2, 32, 2666, 4, 0, 1, 0, 1, NULL, NULL, 0, NULL),
('AFOX AFH510-MI-V2', 7, 3, 4, 'H510', 1, 2, 64, 3200, 2, 1, 1, 0, 1, NULL, NULL, 0, NULL),
('X99 LGA 2011-3', 35, 10, 2, 'X99', 1, 4, 64, 2133, 6, 1, 3, 0, 1, NULL, NULL, 0, NULL),
('X79 LGA 2011', 35, 9, 2, 'X79', 3, 4, 32, 1866, 6, 0, 3, 0, 1, NULL, NULL, 0, NULL),
('ASRock J4025-ITX', 6, NULL, 4, 'J4025', 1, 2, 8, 2400, 2, 1, 1, 1, 1, 'Intel Celeron J4025', 'Встроенный процессор: 2 ядра, 2 потока, 2.0-2.9 ГГц, TDP 10W, UHD Graphics 600', 1, 'Пассивное алюминиевое охлаждение'),
('MAXSUN MS-MoDT 12450H ITX', 9, NULL, 4, 'H610', 2, 2, 64, 3200, 4, 2, 1, 1, 1, 'Intel Core i5-12450H', 'Встроенный процессор: 8 ядер (4P+4E), 12 потоков, 2.0-4.4 ГГц, TDP 45W, UHD Graphics', 1, 'Медный радиатор с тепловыми трубками');

INSERT INTO ram (model, manufacturer_id, memory_type_id, capacity, speed, latency, modules_count) VALUES
('G.Skill Aegis 16GB DDR4', 10, 1, 16, 3200, 'CL16', 2),
('Kingston FURY Beast 32GB DDR5', 30, 2, 32, 5600, 'CL36', 2),
('QUMO DDR3 8GB 1333MHz', 12, 3, 8, 1333, 'CL9', 1),
('Digma DDR4 8Gb 2666MHz', 22, 1, 8, 2666, 'CL19', 1),
('NETAC Shadow III 8Gb DDR4-3600', 31, 1, 8, 3600, 'CL18', 1),
('ADATA SO-DIMM DDR4 8GB 2666MHz pc-21300 Premier CL19', 13, 1, 8, 2666, 'CL19', 1),
('Kingston ValueRAM 8GB DDR3-1600 CL11', 30, 3, 8, 1600, 'CL11', 1),
('G.Skill RipjawsX 16GB (2x8GB) DDR3-1866 CL9', 10, 3, 16, 1866, 'CL9', 2),
('X99 Kit DDR4 16GB', 35, 1, 16, 2133, 'CL15', 2),
('X79 Kit DDR3 32GB', 35, 3, 32, 1600, 'CL11', 4),
('X99 Kit DDR4 64GB', 35, 1, 64, 2400, 'CL17', 4),
('X99 Kit DDR4 32GB', 35, 1, 32, 2133, 'CL15', 2);

INSERT INTO graphics_cards (model, manufacturer_id, vram, vram_type, base_clock, boost_clock, power_consumption, recommended_psu, length) VALUES
('Palit GeForce RTX 5070 Infinity 3', 5, 12, 'GDDR6X', 1500, 2610, 250, 650, 304),
('Gigabyte GeForce RTX 3050 OC 6Gb', 29, 6, 'GDDR6', 1552, 1777, 130, 450, 242),
('Asus GeForce GT 730 Silent 2G', 3, 2, 'GDDR5', 902, 902, 25, 300, 145),
('Palit GeForce RTX 5060 Dual', 5, 8, 'GDDR6', 1470, 2460, 170, 550, 243),
('Palit GeForce RTX 5060 Ti Infinity 3', 5, 8, 'GDDR6', 1410, 2535, 160, 550, 272),
('MSI GeForce RTX 5070 VENTUS 3X OC', 4, 12, 'GDDR6X', 1500, 2610, 250, 650, 307),
('SINOTEX Radeon RX 560 NINJA 4G', 11, 4, 'GDDR5', 1175, 1275, 80, 400, 170),
('AFOX Radeon RX580 Gaming 8G', 7, 8, 'GDDR5', 1257, 1340, 185, 500, 235),
('ASRock Intel Arc A380 Challenger ITX OC', 6, 6, 'GDDR6', 2250, 2450, 75, 400, 190),
('NVIDIA GTX 1660 Super 6GB', 35, 6, 'GDDR6', 1530, 1785, 125, 450, 240);

INSERT INTO storage (model, manufacturer_id, type, capacity, interface, read_speed, write_speed) VALUES
('WD Caviar Blue 1TB', 33, 'HDD', 1000, 'SATA3', 150, 150),
('Samsung 870 EVO 500GB', 21, 'SSD', 500, 'SATA3', 560, 530),
('Seagate BarraCuda 2 ТБ', 32, 'HDD', 2000, 'SATA3', 180, 180),
('Digma Run P1 512 ГБ', 22, 'SSD', 512, 'M.2 NVMe', 2400, 1800),
('Kingston A400 240 Гб', 30, 'SSD', 240, 'SATA3', 500, 450),
('Colorful CN600 PRO 256 ГБ', 23, 'SSD', 256, 'M.2 NVMe', 2100, 1500),
('WD Green M.2 240GB', 33, 'SSD', 240, 'M.2 SATA', 545, 465),
('X99 Kit SSD 1TB', 35, 'SSD', 1000, 'M.2 NVMe', 2100, 1500);

INSERT INTO power_supplies (model, manufacturer_id, wattage, efficiency_rating, psu_form_factor_id, modular) VALUES
('Formula KCAS PLUS 1000GM', 14, 1000, '80+ Gold', 1, 1),
('Chieftec COMPACT 550W', 16, 550, '80+ Bronze', 1, 0),
('FSP FSP300 - 50GLV', 20, 300, '80+ Bronze', 3, 0),
('Accord ACC-450W-12', 15, 450, 'None', 1, 0),
('DeepCool PF400 V2', 24, 400, 'None', 1, 0),
('Ocypus Beta P500', 17, 500, 'None', 1, 0),
('1STPLAYER FK, 550W', 18, 550, '80+ Bronze', 1, 0),
('4FAN Volcore FWB500', 19, 500, '80+ White', 1, 0);

INSERT INTO coolers (model, manufacturer_id, type, socket_compatibility, tdp, noise_level, height) VALUES
('ID-COOLING IS-40-XT BLACK', 24, 'Air', 'LGA1700,LGA1200,AM5,AM4', 100, 25.0, 65),
('DeepCool GAMMAXX 200T', 24, 'Air', 'LGA1700,LGA1200,AM4,AM3', 130, 27.6, 130),
('ID-COOLING FX360 TD', 24, 'Liquid', 'LGA1700,LGA1200,AM5,AM4', 350, 28.5, NULL),
('DeepCool CK-11508 PWM', 24, 'Air', 'LGA1700,LGA1200,LGA1151', 95, 26.0, 85),
('ID-COOLING DK-03', 24, 'Air', 'LGA1700,LGA1200,AM5,AM4', 220, 32.0, 158),
('DeepCool GAMMA ARCHER V2', 24, 'Air', 'FM2+,AM4,AM3+,AM3,AM2+,AM2,LGA1151,LGA1150,LGA1155,LGA1156', 100, 26.8, 76),
('ID-COOLING SE-903-XT', 24, 'Air', 'FM2+,AM4,AM3+,AM3,AM2+,AM2,LGA1151,LGA1150,LGA1155,LGA1156,LGA1200,LGA1700', 150, 28.5, 148),
('Thermalright Assassin X 120', 25, 'Air', 'FM2+,AM4,AM3+,AM3,AM2+,AM2,LGA1151,LGA1150,LGA1155,LGA1156,LGA1200,LGA1700', 180, 25.6, 154),
('ARCTIC Alpine 12 CO', 28, 'Air', 'LGA1700,LGA1200,LGA1151', 75, 23.5, 47),
('X79 RGB Cooler', 35, 'Air', 'LGA2011,LGA2011-3', 130, 28.0, 150);

INSERT INTO cases (model, manufacturer_id, form_factor_id, supported_psu_form_factors, max_gpu_length, max_cooler_height, drive_bays_35, drive_bays_25, builtin_psu) VALUES
('Zalman ZM-T6 Black', 35, 2, 'ATX', 320, 158, 2, 2, 0),
('JONSBO T8 PLUS', 27, 4, 'SFX', 210, 75, 0, 2, 0),
('Ocypus Gamma C50', 17, 3, 'ATX', 310, 155, 2, 2, 0),
('ExeGate FL-102-TPS300', 20, 4, 'TFX', 230, 80, 0, 1, 1),
('PCCooler I100 PRO MESH WH', 24, 4, 'SFX', 200, 70, 0, 2, 0),
('ExeGate MA-371X-UN450', 20, 3, 'ATX', 300, 150, 2, 2, 1),
('Formula SFF T11', 14, 3, 'TFX', 270, 110, 1, 2, 0);

INSERT INTO ram (model, manufacturer_id, memory_type_id, capacity, speed, latency, modules_count) VALUES
('Corsair Vengeance LPX 32GB (2x16GB) DDR4 3600MHz Kit', 31, 1, 32, 3600, 'CL18', 2),
('G.Skill Trident Z RGB 64GB (2x32GB) DDR4 3200MHz Kit', 10, 1, 64, 3200, 'CL16', 2),
('Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz Kit', 30, 1, 16, 3200, 'CL16', 2),
('Corsair Vengeance RGB 64GB (2x32GB) DDR5 5600MHz Kit', 31, 2, 64, 5600, 'CL36', 2),
('G.Skill Trident Z5 32GB (2x16GB) DDR5 6000MHz Kit', 10, 2, 32, 6000, 'CL36', 2),
('Kingston FURY Beast 64GB (2x32GB) DDR5 5200MHz Kit', 30, 2, 64, 5200, 'CL38', 2);

INSERT INTO kits (kit_name, description, compatibility_checked) VALUES
('Esonic H55KEL WITH i5 (650)', 'Материнская плата + процессор Intel i5', 0),
('X99 LGA 2011-3 E5 2650 V3.16G DDR4', 'Процессор + материнская плата + 16GB ram', 0),
('ASRock J4025M', 'Материнская плата + процессор (интегрированный)', 0),
('X79 LGA 2011 Intel Xeon E5 2680v2, 32GB, RGB-Кулер', 'МП + процессор + память + кулер', 0),
('MAXSUN MS-MoDT 12450H ITX WIFI', 'Материнская плата + процессор ITX (интегрированный)', 0),
('X99 LGA 2011-3 Intel Xeon E5 2667v4 64Gb DDR4,1T SSD M.2', 'МП + процессор + память + SSD', 0),
('X99 LGA 2011-3 xeon E5 2680 V4 32GB DDR4, GTX1660S 6GB', 'МП + процессор + память + видеокарта', 0);

INSERT INTO kit_components (kit_id, component_type, component_id, quantity) VALUES
(1, 'motherboard', (SELECT motherboard_id FROM motherboards WHERE model = 'Esonic H55'), 1),
(1, 'processor', (SELECT processor_id FROM processors WHERE model = 'Intel Core i5-650'), 1),
(2, 'motherboard', (SELECT motherboard_id FROM motherboards WHERE model = 'X99 LGA 2011-3'), 1),
(2, 'processor', (SELECT processor_id FROM processors WHERE model = 'Intel Xeon E5 2650 V3'), 1),
(2, 'ram', (SELECT ram_id FROM ram WHERE model = 'X99 Kit DDR4 16GB'), 2),
(3, 'integrated_motherboard', (SELECT motherboard_id FROM motherboards WHERE model = 'ASRock J4025-ITX'), 1),
(4, 'motherboard', (SELECT motherboard_id FROM motherboards WHERE model = 'X79 LGA 2011'), 1),
(4, 'processor', (SELECT processor_id FROM processors WHERE model = 'Intel Xeon E5 2680 V2'), 1),
(4, 'ram', (SELECT ram_id FROM ram WHERE model = 'X79 Kit DDR3 32GB'), 4),
(4, 'cooler', (SELECT cooler_id FROM coolers WHERE model = 'X79 RGB Cooler'), 1),
(5, 'integrated_motherboard', (SELECT motherboard_id FROM motherboards WHERE model = 'MAXSUN MS-MoDT 12450H ITX'), 1),
(6, 'motherboard', (SELECT motherboard_id FROM motherboards WHERE model = 'X99 LGA 2011-3'), 1),
(6, 'processor', (SELECT processor_id FROM processors WHERE model = 'Intel Xeon E5 2667 V4'), 1),
(6, 'ram', (SELECT ram_id FROM ram WHERE model = 'X99 Kit DDR4 64GB'), 4),
(6, 'storage', (SELECT storage_id FROM storage WHERE model = 'X99 Kit SSD 1TB'), 1),
(7, 'motherboard', (SELECT motherboard_id FROM motherboards WHERE model = 'X99 LGA 2011-3'), 1),
(7, 'processor', (SELECT processor_id FROM processors WHERE model = 'Intel Xeon E5 2667 V4'), 1),
(7, 'ram', (SELECT ram_id FROM ram WHERE model = 'X99 Kit DDR4 32GB'), 2),
(7, 'gpu', (SELECT gpu_id FROM graphics_cards WHERE model = 'NVIDIA GTX 1660 Super 6GB'), 1);
