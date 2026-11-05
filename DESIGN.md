# Flavours of Asia: design system

This design is only for Flavours of Asia. It shares nothing with Hewad Market (Apple-style scroll film) or asten.fi (dark editorial serif).

## Idea
"Sri Lanka, packed in Tampere." The shop is online only, so the products are the shopfront. Their real packets are the hero, the Sinhala names on those packets are the voice, and the cardboard box they're packed in is the one moment of storytelling.

## Type
| Role | Font | Notes |
|---|---|---|
| Display | Anybody, weight 900, width 54–64 | Condensed and uppercase, like a painted shop sign. Big prices use width 66–75. |
| Text | Schibsted Grotesk 400–650 | Body copy, product names, buttons. |
| Labels | Martian Mono, width 85, uppercase, 11–13 px | Kickers, the shipping label, and the receipt. |
| Sinhala | Abhaya Libre 800 | Only for Sinhala text taken from their packets and product titles. |

## Colour
| Token | Hex | Use |
|---|---|---|
| paper | #F3EDE1 | Page background |
| paper-2 | #E9DFCC | The knolling board |
| ink | #1A1511 | Text, staples board, footer |
| chilli | #D32F1E | Actions, "Tampere.", tape, restaurant band |
| turmeric | #F2B21B | Search section, shelf tags, prices on the board |
| leaf | #174E35 | The Oiva stamp and the free-delivery meter |
| kraft | #C79D6E | The box |

## Layout grammar
- No nav bar. There's a wordmark in the top-left corner and Shop all, WhatsApp and the Box button in the top-right.
- Each section is a real object, not a card grid: a pile of products on a table, tape with names on it, a knolling board, a price board, a cardboard box, a shipping label, shelf-edge tags, and a till receipt.
- Colour blocks change hard from section to section. There are no gradients and no glass cards.

## Motion (emil-design-eng)
- Easings: out `cubic-bezier(.23,1,.32,1)`, in-out `cubic-bezier(.77,0,.175,1)`, drawer `cubic-bezier(.32,.72,0,1)`.
- Presses scale to 0.97. Hover effects only apply to devices with a fine pointer. Only transform and opacity are animated.
- The price tag scales from 0.94 at the packet it belongs to, in 200 ms. The receipt drawer takes 380–420 ms. The knolling items stagger 55 ms apart.
- The heap uses real physics, the box is scrubbed by scroll, and the staples board's floating packet follows the cursor on a spring.
- With reduced motion turned on, the heap appears already settled, the tapes stop, and nothing flies to the box.
