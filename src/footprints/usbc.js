// USB-C-shaped proprietary serial interconnect for a reversible split PCB.
//
// IMPORTANT: This is NOT USB-C compliant and must only be used as a dedicated
// keyboard-to-keyboard serial cable. Mark both boards/cases: "SPLIT LINK — NOT USB".
//
// This footprint targets the same 12-contact USB 2.0 mid-mount receptacle
// geometry used by the original footprint:
//   - 12 SMD signal/power contacts
//   - 4 plated shield/mechanical tabs
//
// Cable-flip-safe mapping:
//   GND: contacts 1 and 12, plus shield tabs
//   VCC: contacts 2 and 11, optionally enabled
//   TX:  contacts 5 and 7
//   RX:  contacts 6 and 8
//
// For a reversible PCB, `reversible: true` creates:
//   - a front-side connector pad pattern
//   - a mirrored back-side connector pad pattern
//
// Only populate ONE connector: front for one keyboard half, back for the other.
//
// Never connect this port to a computer, charger, hub, dock, or normal USB
// peripheral. If each half can be powered independently, leave include_vcc
// false to prevent accidental power backfeeding.

module.exports = {
  params: {
    designator: 'SPLIT',

    // Used only when reversible is false.
    side: 'F',

    // Generate equivalent front and back connector pad patterns.
    reversible: true,

    // VCC is OFF by default. For UART-only split communication, use GND/TX/RX.
    include_vcc: false,

    // This must align with and become part of the main board perimeter.
    // Set false while positioning/debugging, or if you create the cutout in
    // the main Ergogen board outline instead.
    include_edge_cutout: true,

    GND: { type: 'net', value: 'GND' },
    VCC: { type: 'net', value: 'VCC' },
    TX: { type: 'net', value: 'TX' },
    RX: { type: 'net', value: 'RX' }
  },

  body: p => {
    const layersFor = side => ({
      copper: `${side}.Cu`,
      paste: `${side}.Paste`,
      mask: `${side}.Mask`,
      silk: `${side}.SilkS`,
      fab: `${side}.Fab`
    });

    const front = layersFor('F');
    const back = layersFor('B');

    const line = (x1, y1, x2, y2, layer, width = 0.15) => `
      (fp_line
        (start ${x1} ${y1})
        (end ${x2} ${y2})
        (stroke (width ${width}) (type solid))
        (layer "${layer}")
      )
    `;

    // `mirror_x` is required for the back-mounted physical connector:
    // viewed from the front of the board, its contact order is reflected.
    const smdPad = (number, x, y, width, height, layers, net = '', mirror_x = false) => `
      (pad "${number}" smd rect
        (at ${mirror_x ? -x : x} ${y})
        (size ${width} ${height})
        (layers "${layers.copper}" "${layers.paste}" "${layers.mask}")
        ${net}
      )
    `;

    const shieldPad = (x, y, width, height, drill_x, drill_y) => `
      (pad "13" thru_hole oval
        (at ${x} ${y})
        (size ${width} ${height})
        (drill oval ${drill_x} ${drill_y})
        (layers "*.Cu" "*.Mask")
        ${p.GND.str}
      )
    `;

    const connectorPads = (layers, mirror_x) => `
      ${'' /* Ground contacts */}
      ${smdPad(1, 3.225, 7.235, 0.6, 1.15, layers, p.GND.str, mirror_x)}
      ${smdPad(12, -3.225, 7.235, 0.6, 1.15, layers, p.GND.str, mirror_x)}

      ${'' /* Optional shared split power */}
      ${smdPad(2, 2.45, 7.235, 0.6, 1.15, layers, p.include_vcc ? p.VCC.str : '', mirror_x)}
      ${smdPad(11, -2.45, 7.235, 0.6, 1.15, layers, p.include_vcc ? p.VCC.str : '', mirror_x)}

      ${'' /* Unused contacts: leave electrically unconnected */}
      ${smdPad(3, 1.75, 7.235, 0.3, 1.15, layers, '', mirror_x)}
      ${smdPad(4, 1.25, 7.235, 0.3, 1.15, layers, '', mirror_x)}
      ${smdPad(9, -1.25, 7.235, 0.3, 1.15, layers, '', mirror_x)}
      ${smdPad(10, -1.75, 7.235, 0.3, 1.15, layers, '', mirror_x)}

      ${'' /*
        Reversible cable orientation:
        contacts 5 and 7 are one wire; contacts 6 and 8 are the other.
      */}
      ${smdPad(5, 0.75, 7.235, 0.3, 1.15, layers, p.TX.str, mirror_x)}
      ${smdPad(7, -0.25, 7.235, 0.3, 1.15, layers, p.TX.str, mirror_x)}
      ${smdPad(6, 0.25, 7.235, 0.3, 1.15, layers, p.RX.str, mirror_x)}
      ${smdPad(8, -0.75, 7.235, 0.3, 1.15, layers, p.RX.str, mirror_x)}
    `;

    const edgeCutout = p.include_edge_cutout ? `
      ${line(7, 0, 4.64, 0, 'Edge.Cuts')}
      ${line(-7, 0, -4.64, 0, 'Edge.Cuts')}
      ${line(-4.64, 0, -4.64, 6.66, 'Edge.Cuts')}
      ${line(-4.64, 6.66, 4.64, 6.66, 'Edge.Cuts')}
      ${line(4.64, 6.66, 4.64, 0, 'Edge.Cuts')}
    ` : '';

    const frontSilk = `
      (fp_rect
        (start -6.45 0.35)
        (end 6.45 7.85)
        (stroke (width 0.12) (type solid))
        (fill none)
        (layer "F.SilkS")
      )

      (fp_text user "SPLIT LINK"
        (at 0 4.10)
        (layer "F.SilkS")
        (effects (font (size 0.85 0.85) (thickness 0.14)))
      )

      (fp_text user "NOT USB"
        (at 0 5.55)
        (layer "F.SilkS")
        (effects (font (size 0.75 0.75) (thickness 0.12)))
      )
    `;

    const backSilk = p.reversible ? `
      (fp_rect
        (start -6.45 0.35)
        (end 6.45 7.85)
        (stroke (width 0.12) (type solid))
        (fill none)
        (layer "B.SilkS")
      )

      (fp_text user "SPLIT LINK"
        (at 0 4.10)
        (layer "B.SilkS")
        (effects
          (font (size 0.85 0.85) (thickness 0.14))
          (justify mirror)
        )
      )

      (fp_text user "NOT USB"
        (at 0 5.55)
        (layer "B.SilkS")
        (effects
          (font (size 0.75 0.75) (thickness 0.12))
          (justify mirror)
        )
      )
    ` : '';

    const selectedPads = p.reversible
      ? `
          ${connectorPads(front, false)}
          ${connectorPads(back, true)}
        `
      : p.side === 'B'
        ? connectorPads(back, true)
        : connectorPads(front, false);

    return `
      (footprint "USB_C_Split_Link_12_Pin_Reversible"
        (layer "F.Cu")
        ${p.at}
        (attr smd)

        (fp_text reference "${p.ref}"
          (at 0 8.75)
          (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)))
        )

        (fp_text value "SPLIT-LINK"
          (at 0 10.10)
          (layer "F.Fab")
          (effects (font (size 1 1) (thickness 0.15)))
        )

        ${edgeCutout}
        ${frontSilk}
        ${backSilk}

        ${selectedPads}

        ${'' /* Shared plated shield / mechanical tabs for either mount side */}
        ${shieldPad(5.62, 6.1, 1, 1.8, 0.6, 1.4)}
        ${shieldPad(-5.62, 6.1, 1, 1.8, 0.6, 1.4)}
        ${shieldPad(-5.62, 2.1, 1, 2.2, 0.6, 1.8)}
        ${shieldPad(5.62, 2.1, 1, 2.2, 0.6, 1.8)}
      )
    `;
  }
};
