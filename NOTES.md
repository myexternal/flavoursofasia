# Flavours of Asia: homepage v2 (4 Nov 2026)

To open it, run `npx http-server` in this folder and open the address it prints. The page uses ES modules and loads its 3D data with fetch, so a double-clicked file won't work. If you only want to watch it, play `preview-desktop.mp4` or `preview-phone.mp4`.

This version shares no layout, fonts or components with Hewad Market or v1. Its own design system is in `DESIGN.md`.

## What's on the page
| # | Section | What it does |
|---|---|---|
| 1 | **The heap** | 22 of their real products in 3D (15 on phones), tipped out onto the page with real physics. You can pick them up and throw them. Tap one to get a price tag with its Sinhala name, price and stock, and "Add to box". Headline: "Sri Lanka, packed in Tampere." |
| 2 | **Say it the way amma says it** | Search across all 370 products in the snapshot, in Sinhala, English or Finnish (for example කළු කුඩු, curry leaves, kookosmaito). Results can go straight into the box. Two tapes scroll past: one with Sinhala names from their own product titles, one with Finnish names. Tapping a Sinhala name searches for it. |
| 3 | **Tonight I'm making…** | Pick a dish: string hoppers, egg hoppers, polos curry or Sunday rice and curry. Its products are laid out as a knolling flat-lay using cutouts of their packshots. Sold-out items are stamped "Sold out" and skipped by "Put it all in my box". |
| 4 | **Staples, priced plainly** | A dark price board with 16 staples. On desktop, the packet follows your cursor down the list. Sold-out items are crossed out, not hidden. |
| 5 | **The box** | Scroll-scrubbed 3D. Whatever is in your box drops into a kraft box printed with their name, the flaps fold, red "FLAVOURS OF ASIA · TAMPERE" tape runs over it, a label with your postcode lands on top, and the box leaves. Four steps run alongside: you fill it, we pick it at Riipuksenkatu 3, taped and labelled, out the door. |
| 6 | **Where's it going?** | The delivery calculator is a shipping label. Typing a postcode sets the zone (33xxx counts as Tampere). It shows the fee and how far you are from free delivery. The Oiva "Oivallinen" stamp lands on the label and links to their inspection page. |
| 7 | **Eight aisles. One stock room.** | The 8 collections are shelf-edge tags with their real product counts. Below them: "Also in the back", with the cricket bat, carrom board and rice cooker. |
| 8 | **Cooking for 200?** | A restaurant and bulk band with a WhatsApp link. |
| | **The box (bag)** | A till receipt that slides in, with quantities, the delivery zone, the total and **Check out on flavoursofasia.fi**. That button opens their real Shopify cart already filled, using `/cart/variant:qty,...`. |

## How the 3D was made
- **Background removal:** their own 500 px packshots were cut out with Higgsfield's background remover, 14 images at about 1 credit each.
- **3D products:** built in code from each packshot's outline, so the labels are their real labels, pixel for pixel.
  - Packets are pillow-shaped.
  - Cartons have flat sides.
  - Tins, jars and bottles are turned from their outline.
- **Why not Higgsfield 3D:** I tested its image-to-3D on the mackerel tin (1 credit). The shape was good, but it garbled the label ("JACK MACKEREL" became nonsense letters), and that would look fake on a grocery site.
- **Weight:** about 3.8 MB in total. That's three.js 0.169 at 0.69 MB, cannon-es at 0.13 MB, and media at 2.9 MB, with no video.

## Live data
- Prices, stock and variant ids are a snapshot from `flavoursofasia.fi/products.json`, taken on 3 Nov 2026 (`media/catalogue.json` and `js/data.js`).
- On flavoursofasia.fi itself, prices and stock for the featured products refresh from `/products/<handle>.js`.
- As a Shopify theme, search should use `/search/suggest.json`, and the box should use `/cart/add.js` and the theme's cart.

## Check with the owner before showing this
1. **"Over 350 groceries".** Their shop lists 370 products, and the "All" collection says 497.
2. **"We pick it off our shelves… Packed by hand".** Confirm this is how the stock room works.
3. **Tampere zone.** The page treats every 33xxx postcode as Tampere. Ask which postcodes actually get free delivery over €15.
4. **Restaurants and bulk.** Only Google mentions this. Their site doesn't.
5. **Europe "from €12" and "13 EU countries"** come from their current site. The real rate is set at checkout.
6. **The ෆ (Sinhala "fa") in the round mark** is my own choice for a monogram. Their current logo is an AI image, so a real logo should replace it.
7. **Sinhala text** is only copied from their packets and product titles, never written by me. Someone who reads Sinhala should still check the dish lines and the tapes.
8. **Sold out right now:** string hopper press and trays, Maldive fish, young jackfruit, katta sambol and the rice cooker. Two of the four dishes are missing items.
9. **"Say it the way amma says it"** is a warm line for the Sri Lankan community. If they want to reach Finnish customers first, it could be "Search in Sinhala, English or Finnish."
10. **Copy is English only.** The tapes and search already work in Finnish.

## Files
- `index.html`: the page and its CSS.
- `js/app.js`: UI, search, the box, the label.
- `js/hero.js`: the heap.
- `js/pack.js`: the box.
- `js/geo.js`: packshot to 3D.
- `js/data.js`: catalogue snapshot.
- `media/p/`: their packshots.
- `media/cut/`: cutouts.
- `media/shapes.json`: product outlines.
- `media/catalogue.json`: search index.
- `media/extra/`: cricket bat, carrom board, rice cooker.
- `vendor/`: three.js, cannon-es, RoomEnvironment.
