// Snapshot of flavoursofasia.fi/products.json, taken 3 Nov 2026. Variant ids feed the Shopify cart permalink.
// si = the Sinhala name exactly as it is printed on the packet or written in the shop's own product title.
export const SHOP = 'https://flavoursofasia.fi';
export const P = {
  shflour:{h:'inndu-sri-rice-flour-string-hopper-flour-white-1kg',n:'String hopper flour',s:'Inndu Sri, white, 1 kg',v:51565525172555,p:3.19,a:1,f:'p00',si:'ඉඳි ආප්ප පිටි'},
  press:{h:'maruthi-string-hoppers-press',n:'String hopper press',s:'Maruthi',v:51333489295691,p:19.00,a:0,f:'p01'},
  watti:{h:'string-hoppers-watti-6-pcs',n:'String hopper trays',s:'Watti, 6 pcs',v:51668009550155,p:4.50,a:0,f:'p02'},
  coconut:{h:'chakra-shredded-coconut-500g',n:'Grated coconut',s:'Chakra, frozen, 500 g',v:51404829294923,p:3.79,a:1,f:'p03'},
  cmilk:{h:'menu-kookosmaito-coconut-milk-1l',n:'Coconut milk',s:'Menu, 1 L',v:56849939857739,p:2.99,a:1,f:'p04',fi:'Kookosmaito'},
  leaves:{h:'indusri-dehydrated-curry-leaves-25-g-indusri-kuivatut-currylehdet-25-g-indusri-torkade-curryblad-25-g',n:'Curry leaves',s:'Inndu Sri, dried, 25 g',v:58057495871819,p:1.99,a:1,f:'p05',fi:'Kuivatut currylehdet'},
  hflour:{h:'mdk-easy-hopper-flour-400g',n:'Easy hopper flour',s:'MDK, 400 g',v:51474304532811,p:2.79,a:1,f:'p06',si:'පහසු ආප්ප පිටි'},
  pan:{h:'hopper-pan',n:'Hopper pan',s:'Appachatti',v:55978694574411,p:14.75,a:1,f:'p07'},
  mfish:{h:'freelan-maldive-fish-pieces-100g',n:'Maldive fish',s:'Freelan, 100 g',v:55978619633995,p:4.90,a:0,f:'p08'},
  polos:{h:'inndu-sri-young-jack-fruit-cuts-polos-550g',n:'Young jackfruit',s:'Polos, Inndu Sri, 550 g',v:51836282929483,p:2.90,a:0,f:'p09'},
  roasted:{h:'wijaya-roasted-curry-powder-100g',n:'Roasted curry powder',s:'Wijaya, 100 g',v:51836584296779,p:2.20,a:1,f:'p10'},
  redrice:{h:'annam-red-raw-rice-1kg',n:'Red raw rice',s:'Annam, 1 kg',v:51062217212235,p:3.10,a:1,f:'p11'},
  papadam:{h:'annam-plain-papadam-200g',n:'Papadam',s:'Plain Madras, 200 g',v:50977917894987,p:2.00,a:1,f:'p12'},
  seeni:{h:'inddu-sri-fried-onion-chutney-325g-free-bottle-of-sauce',n:'Seeni sambol',s:'Inndu Sri, 325 g',v:59023758557515,p:6.59,a:1,f:'p13'},
  kithul:{h:'kithul-treacle-350ml-100-kithul',n:'Kithul treacle',s:'100% kithul, 350 ml',v:51788014879051,p:6.90,a:1,f:'p14'},
  soya:{h:'delmege-soya-chicken-90g',n:'Soya meat',s:'Delmege, chicken flavour, 90 g',v:51430342426955,p:1.50,a:1,f:'p15'},
  mackerel:{h:'annam-jack-mackerel-tin-425g',n:'Jack mackerel',s:'Annam, 425 g tin',v:50977915175243,p:2.69,a:1,f:'p16'},
  samaposha:{h:'cbl-samaposha-200g',n:'Samaposha',s:'CBL, 200 g',v:51811414311243,p:1.60,a:1,f:'p17'},
  kingco:{h:'king-coconut-water-350-ml-තැඹිලි-වතුර-kookosvesi',n:'King coconut water',s:'350 ml',v:51400519450955,p:3.59,a:1,f:'p18',si:'තැඹිලි වතුර',fi:'Kookosvesi'},
  katta:{h:'inndu-sri-katta-sambol-325g',n:'Katta sambol',s:'Inndu Sri, 325 g',v:51403620942155,p:4.49,a:0,f:'p19'},
  scraper:{h:'coconut-scrapper',n:'Coconut scraper',s:'Table clamp',v:51062292185419,p:11.99,a:1,f:'p20'},
  black:{h:'roasted-curry-powder-කළු-කුඩු-100g',n:'Black curry powder',s:'100 g',v:58056061124939,p:1.90,a:1,f:'p21',si:'කළු කුඩු'},
  chilli:{h:'wijaya-chilli-powder-500-g-wijaya-chilijauhe-500-g-wijaya-chilipulver-500-g',n:'Chilli powder',s:'Wijaya, 500 g',v:58055440400715,p:7.49,a:1,f:'p22',fi:'Chilijauhe'},
  lentils:{h:'ali-baba-red-split-lentils-2-kg',n:'Red split lentils',s:'Ali Baba, 2 kg',v:58884203053387,p:4.99,a:1,f:'p23'},
  tilda:{h:'tilda-broken-basmati-rice-10kg',n:'Basmati brokens',s:'Tilda, 10 kg',v:51062261514571,p:19.90,a:1,f:'p26'},
  masoor:{h:'annam-masoor-daal-2kg',n:'Masoor dhal',s:'Annam, 2 kg',v:50977903411531,p:5.20,a:1,f:'p27'},
};

// 3D specs, 1 unit = 10 cm. type: pouch (soft packet), box (carton), lathe (tin, jar, bottle)
export const SOLID = {
  tilda:{type:'pouch',h:4.6,d:1.3}, lentils:{type:'pouch',h:3.4,d:0.9}, masoor:{type:'pouch',h:3.1,d:0.8},
  shflour:{type:'pouch',h:3.0,d:0.75}, redrice:{type:'pouch',h:2.6,d:0.7}, chilli:{type:'pouch',h:2.7,d:0.55},
  coconut:{type:'pouch',h:2.4,d:0.4}, hflour:{type:'pouch',h:2.2,d:0.45}, samaposha:{type:'pouch',h:2.1,d:0.45},
  leaves:{type:'pouch',h:2.0,d:0.35}, roasted:{type:'pouch',h:1.9,d:0.35}, mfish:{type:'pouch',h:1.9,d:0.3},
  papadam:{type:'pouch',h:2.0,d:0.25}, soya:{type:'pouch',h:1.5,d:0.45},
  cmilk:{type:'box',h:2.0,d:0.6}, black:{type:'box',h:1.6,d:0.5},
  kithul:{type:'lathe',h:2.2,mat:'glass'}, kingco:{type:'lathe',h:1.9,mat:'glass'}, mackerel:{type:'lathe',h:1.15,mat:'tin'},
  polos:{type:'lathe',h:1.35,mat:'glass'}, seeni:{type:'lathe',h:1.35,mat:'glass'}, katta:{type:'lathe',h:1.35,mat:'glass'},
};
export const HERO_DESK = ['tilda','lentils','masoor','shflour','redrice','chilli','coconut','hflour','samaposha','leaves','roasted','mfish','papadam','soya','cmilk','black','kithul','kingco','mackerel','polos','seeni','katta'];
export const HERO_PHONE = ['lentils','shflour','redrice','chilli','coconut','hflour','leaves','roasted','soya','cmilk','black','kithul','kingco','mackerel','seeni'];

export const DISHES = [
  {k:'string hoppers', d:'Steamed nests of rice flour, kiri hodi and a fiery pol sambol.', need:['shflour','press','watti','coconut','cmilk','leaves']},
  {k:'egg hoppers', d:'Crisp-edged bowls of rice and coconut batter with an egg cracked in the middle.', need:['hflour','pan','cmilk','chilli','mfish']},
  {k:'polos curry', d:'Young jackfruit braised dark in roasted curry powder and coconut milk.', need:['polos','roasted','cmilk','leaves','redrice']},
  {k:'Sunday rice and curry', d:'Red rice, coconut dhal, a crisp papadam and seeni sambol on the side.', need:['redrice','masoor','papadam','seeni','coconut']},
];
export const STAPLES = ['tilda','redrice','lentils','masoor','chilli','roasted','black','cmilk','mackerel','soya','samaposha','kithul','kingco','seeni','katta','scraper'];

// Sinhala names as written in the shop's own product titles
export const NAMES = [
  ['කළු කුඩු','Black curry powder'],['තැඹිලි වතුර','King coconut water'],['රම්පේ කොළ','Pandan leaves'],['හාල්මැස්සන්','Dried sprats'],
  ['කඩල','Chickpeas'],['මුං ඇට','Whole moong'],['දෙල්','Breadfruit'],['පස්පංගුව','Paspanguwa'],['කොස් මැල්ලුම','Green jackfruit'],
  ['කෙසෙල් මුව','Banana blossom'],['තෝර කරවල','Dried seer fish'],['මෝරා','Blue shark'],['කඩල පිටි','Gram flour'],['උඳු පිටි','Urid flour'],
  ['නෙළුම් අල','Lotus root'],['ගල් වංගෙඩිය','Grinding stone'],
];
export const FINNISH = ['Kuivatut currylehdet','Kookosmaito','Kookosvesi','Kookossokeri','Kikherneitä','Neitsytkookosöljy','Inkiväärijauhe','Kookoskerma','Chilijauhe','Kuivatut spratit','Kookosmaitojauhe'];

export const COLS = [
  ['rice','Rice & Noodles',56],['grains-and-flour','Grains & Flour',52],['spices','Spices',115],['canned-products','Canned & Bottled',82],
  ['grains','Dry Fish & Soya',44],['frozen-items','Frozen',22],['drinks-and-snacks','Drinks & Snacks',101],['cooking-items','Kitchen',20],
];
export const ODD = [
  {n:'Soft ball cricket bat',s:'VS Sports',p:35.00,a:1,h:'vs-sports-soft-ball-cricket-bat',v:58869821014347,img:'media/extra/bat.jpg'},
  {n:'Carrom board, 38 inch',s:'With playing pieces',p:99.00,a:1,h:'38-inch-carrom-board-with-playing-pieces',v:58869307081035,img:'media/extra/carrom.jpg'},
  {n:'Electric rice cooker',s:'Annam, 1.5 L',p:34.90,a:0,h:'annam-electric-rice-cooker-1-5-l',v:58869487206731,img:'media/extra/cooker.jpg'},
];
// Delivery, as published on flavoursofasia.fi
export const ZONES = {
  tre:{n:'Tampere', free:15, fee:3},
  fin:{n:'Finland', free:100, fee:7.5},
  eu:{n:'Europe', free:Infinity, fee:12},
};
