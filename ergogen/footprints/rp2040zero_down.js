// Waveshare RP2040-Zero footprint for Ergogen 4 / KiCad 8.
// FACE-DOWN VARIANT: the MCU is mounted dead-bug style (component side
// facing into the PCB / away from the viewer) instead of the usual
// component-side-up orientation.
//
// Physically flipping the board left-right mirrors the pinout as seen
// from a fixed top-down view of the PCB: pin 0 moves from top-right to
// top-left, pin 8 moves from bottom-right to bottom-left, etc. This file
// bakes that mirror directly into the coordinates (mirrored about the
// footprint's vertical center line, x = 10.16mm) rather than relying on
// the `side` param, since `side` only swaps silkscreen/fab layer names —
// it does not mirror geometry (see the original rp2040-zero.js footprint
// for details on that limitation).
//
// Based on the original footprint credited to:
// https://github.com/axhixh/mini-kbd
//
// `reverse` is retained for config compatibility but intentionally does not
// duplicate pads. The pads are through-hole and already exist on both copper
// layers. A truly reversible controller footprint needs a separate mirrored
// pad/net mapping rather than duplicate pads.

module.exports = {
  params: {
    designator: 'RP2040Zero',
    side: 'F',
    reverse: false,

    include_button_cutout: true,

    P5V: { type: 'net', value: 'P5V' },
    GND: { type: 'net', value: 'GND' },
    P3V3: { type: 'net', value: 'P3V3' },
    GP29: { type: 'net', value: 'GP29' },
    GP28: { type: 'net', value: 'GP28' },
    GP27: { type: 'net', value: 'GP27' },
    GP26: { type: 'net', value: 'GP26' },
    GP15: { type: 'net', value: 'GP15' },
    GP14: { type: 'net', value: 'GP14' },
    GP13: { type: 'net', value: 'GP13' },
    GP12: { type: 'net', value: 'GP12' },
    GP11: { type: 'net', value: 'GP11' },
    GP10: { type: 'net', value: 'GP10' },
    GP9: { type: 'net', value: 'GP9' },
    GP8: { type: 'net', value: 'GP8' },
    GP7: { type: 'net', value: 'GP7' },
    GP6: { type: 'net', value: 'GP6' },
    GP5: { type: 'net', value: 'GP5' },
    GP4: { type: 'net', value: 'GP4' },
    GP3: { type: 'net', value: 'GP3' },
    GP2: { type: 'net', value: 'GP2' },
    GP1: { type: 'net', value: 'GP1' },
    GP0: { type: 'net', value: 'GP0' }
  },

  body: p => {
    const silkLayer = p.side === 'B' ? 'B.SilkS' : 'F.SilkS';
    const fabLayer = p.side === 'B' ? 'B.Fab' : 'F.Fab';

    const line = (x1, y1, x2, y2, layer, width = 0.12) => `
      (fp_line
        (start ${x1} ${y1})
        (end ${x2} ${y2})
        (stroke (width ${width}) (type solid))
        (fill none)
        (layer "${layer}")
      )`;

    const pad = (number, x, y, sizeX, sizeY, offsetX, offsetY, net) => `
      (pad "${number}" thru_hole roundrect
        (at ${x} ${y} ${p.r})
        (size ${sizeX} ${sizeY})
        (drill 1.0922 (offset ${offsetX} ${offsetY}))
        (layers "*.Cu" "*.Mask")
        (roundrect_rratio 0.25)
        ${net.str}
      )`;

    // Outline is symmetric about the center line (x = 10.16) so it is
    // unchanged by the mirror.
    const outline = `
      ${line(19.16, -24.45, 1.16, -24.45, silkLayer)}
      ${line(1.16, -24.45, 1.16, -0.95, silkLayer)}
      ${line(1.16, -0.95, 19.16, -0.95, silkLayer)}
      ${line(19.16, -0.95, 19.16, -24.45, silkLayer)}

      ${line(1.16, -24.45, 19.16, -24.45, 'F.CrtYd', 0.05)}
      ${line(19.16, -24.45, 19.16, -0.95, 'F.CrtYd', 0.05)}
      ${line(19.16, -0.95, 1.16, -0.95, 'F.CrtYd', 0.05)}
      ${line(1.16, -0.95, 1.16, -24.45, 'F.CrtYd', 0.05)}

      ${line(14.49, -25.45, 14.49, -24.45, fabLayer, 0.1)}
      ${line(5.86, -25.45, 5.86, -24.45, fabLayer, 0.1)}
      ${line(14.49, -25.45, 5.86, -25.45, fabLayer, 0.1)}
    `;

    // Mirrored button-access cutout (about x = 10.16).
    const buttonCutout = p.include_button_cutout ? `
      ${line(15.32, -5.13, 4.82, -5.13, 'Edge.Cuts')}
      ${line(15.32, -5.13, 15.32, -10.5, 'Edge.Cuts')}
      ${line(4.82, -10.5, 4.82, -5.13, 'Edge.Cuts')}
      ${line(4.82, -10.5, 15.32, -10.5, 'Edge.Cuts')}
    ` : '';

    // Pad x-coordinates and drill offsetX values are mirrored about
    // x = 10.16 (mirror_x = 20.32 - x, mirror_offsetX = -offsetX).
    // Net assignments are untouched, so GPx still refers to the same
    // physical MCU pin, just at its mirrored board location.
    const pads = `
      ${pad(1, 2.54, -22.86, 2.6, 1.6, -0.6, 0, p.GP0)}
      ${pad(2, 2.54, -20.32, 2.6, 1.6, -0.6, 0, p.GP1)}
      ${pad(3, 2.54, -17.78, 2.6, 1.6, -0.6, 0, p.GP2)}
      ${pad(4, 2.54, -15.24, 2.6, 1.6, -0.6, 0, p.GP3)}
      ${pad(5, 2.54, -12.70, 2.6, 1.6, -0.6, 0, p.GP4)}
      ${pad(6, 2.54, -10.16, 2.6, 1.6, -0.6, 0, p.GP5)}
      ${pad(7, 2.54, -7.62, 2.6, 1.6, -0.6, 0, p.GP6)}
      ${pad(8, 2.54, -5.08, 2.6, 1.6, -0.6, 0, p.GP7)}
      ${pad(9, 2.54, -2.54, 2.6, 1.6, -0.6, 0, p.GP8)}

      ${pad(10, 5.08, -2.33, 1.6, 2.6, 0, 0.6, p.GP9)}
      ${pad(11, 7.62, -2.33, 1.6, 2.6, 0, 0.6, p.GP10)}
      ${pad(12, 10.16, -2.33, 1.6, 2.6, 0, 0.6, p.GP11)}
      ${pad(13, 12.70, -2.33, 1.6, 2.6, 0, 0.6, p.GP12)}
      ${pad(14, 15.24, -2.33, 1.6, 2.6, 0, 0.6, p.GP13)}

      ${pad(15, 17.78, -2.54, 2.6, 1.6, 0.6, 0, p.GP14)}
      ${pad(16, 17.78, -5.08, 2.6, 1.6, 0.6, 0, p.GP15)}
      ${pad(17, 17.78, -7.62, 2.6, 1.6, 0.6, 0, p.GP26)}
      ${pad(18, 17.78, -10.16, 2.6, 1.6, 0.6, 0, p.GP27)}
      ${pad(19, 17.78, -22.86, 2.6, 1.6, 0.6, 0, p.P5V)}
      ${pad(20, 17.78, -20.32, 2.6, 1.6, 0.6, 0, p.GND)}
      ${pad(21, 17.78, -17.78, 2.6, 1.6, 0.6, 0, p.P3V3)}
      ${pad(22, 17.78, -12.70, 2.6, 1.6, 0.6, 0, p.GP28)}
      ${pad(23, 17.78, -15.24, 2.6, 1.6, 0.6, 0, p.GP29)}
    `;

    return `
      (footprint "RP2040-Zero"
        (layer "${p.side}.Cu")
        ${p.at}
        (attr through_hole)

        (fp_text reference "${p.ref}"
          (at 10.16 -15.45 ${p.r})
          (layer "${fabLayer}")
          (effects (font (size 1 1) (thickness 0.15)))
        )

        (fp_text value "RP2040-Zero"
          (at 10.16 -13.90 ${p.r})
          (layer "${fabLayer}")
          (effects (font (size 1 1) (thickness 0.15)))
        )

        ${outline}
        ${buttonCutout}
        ${pads}
      )
    `;
  }
};
